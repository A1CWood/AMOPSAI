// Generates a Deep Zoom Image (DZI) tile pyramid from the parking apron map
// source image, for use with the OpenSeadragon viewer in
// src/components/parking-map.tsx. The source is expected to be very large
// (tens of thousands of pixels on a side) - sharp/libvips streams the
// tiling so it doesn't hold the whole image in memory at once, but it does
// need limitInputPixels raised past sharp's default safety cap.
//
// Usage: node scripts/generate-parking-tiles.mjs <source-image> [output-dir]
// Then run scripts/upload-parking-tiles.mjs <output-dir> to push the result
// to Supabase Storage. Re-run both whenever the source map changes.
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TILE_SIZE = 512;
const TILE_OVERLAP = 1;

async function main() {
  const sourceArg = process.argv[2];
  if (!sourceArg) {
    console.error("Usage: node scripts/generate-parking-tiles.mjs <source-image> [output-dir]");
    process.exit(1);
  }
  const sourcePath = path.resolve(sourceArg);
  const outputDir = path.resolve(process.argv[3] ?? path.join(__dirname, "..", "tiles"));
  const outputBase = path.join(outputDir, "parking-map");

  const source = sharp(sourcePath, { limitInputPixels: false, sequentialRead: true });
  const meta = await source.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read dimensions from ${sourcePath}`);
  }
  console.log(`Source: ${meta.width}x${meta.height} (${((meta.width * meta.height) / 1e6).toFixed(0)}MP)`);

  await source
    .jpeg({ quality: 85 })
    .tile({ size: TILE_SIZE, overlap: TILE_OVERLAP, layout: "dz" })
    .toFile(outputBase);

  console.log(`Wrote ${outputBase}.dzi and ${outputBase}_files/`);
  console.log("Next: node scripts/upload-parking-tiles.mjs " + path.relative(process.cwd(), outputDir));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
