// Uploads a DZI tile pyramid (produced by scripts/generate-parking-tiles.mjs)
// to the public "parking-map" Supabase Storage bucket, preserving relative
// paths so the result is fetchable at
// `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/parking-map/parking-map.dzi`.
// Re-running after regenerating tiles overwrites existing files (upsert).
//
// Usage: node scripts/upload-parking-tiles.mjs [tiles-dir]
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 8;

// .env.local isn't auto-loaded by plain `node`; parse it ourselves rather
// than requiring the caller to remember an --env-file flag.
function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  let contents;
  try {
    contents = readFileSync(envPath, "utf-8");
  } catch {
    return;
  }
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".dzi")) return "application/xml";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function listFilesRecursive(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...listFilesRecursive(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function runWithConcurrency(items, limit, worker) {
  let cursor = 0;
  let completed = 0;
  async function next() {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index]);
      completed += 1;
      if (completed % 50 === 0 || completed === items.length) {
        console.log(`Uploaded ${completed}/${items.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).",
    );
  }

  const tilesDir = path.resolve(process.argv[2] ?? path.join(__dirname, "..", "tiles"));
  const files = listFilesRecursive(tilesDir);
  if (files.length === 0) {
    throw new Error(`No files found under ${tilesDir}. Run generate-parking-tiles.mjs first.`);
  }
  console.log(`Uploading ${files.length} files from ${tilesDir}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  await runWithConcurrency(files, CONCURRENCY, async (filePath) => {
    const relativePath = path.relative(tilesDir, filePath).split(path.sep).join("/");
    const body = readFileSync(filePath);
    const { error } = await supabase.storage
      .from("parking-map")
      .upload(relativePath, body, { contentType: contentTypeFor(filePath), upsert: true });
    if (error) {
      throw new Error(`Failed to upload ${relativePath}: ${error.message}`);
    }
  });

  console.log(`Done. DZI available at: ${supabaseUrl}/storage/v1/object/public/parking-map/parking-map.dzi`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
