// Generates public/resources/eielson-mirror-tile.jpg: the airfield photo
// stacked with a vertically-flipped copy of itself. Tiling that pair with
// CSS background-repeat: repeat-y (see src/app/globals.css) produces a
// seamless reflected pattern down the page - the pair's bottom edge and top
// edge both show the original photo's top, so repeats line up cleanly.
//
// Re-run this (`node scripts/generate-mirror-tile.mjs`) if the source photo
// ever changes.
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const sourcePath = path.join(__dirname, "..", "public", "resources", "eielson.JPG");
  const outputPath = path.join(__dirname, "..", "public", "resources", "eielson-mirror-tile.jpg");

  const original = await sharp(sourcePath).toBuffer();
  const meta = await sharp(original).metadata();
  const flipped = await sharp(original).flip().toBuffer();

  await sharp({
    create: { width: meta.width, height: meta.height * 2, channels: 3, background: "#000000" },
  })
    .composite([
      { input: original, top: 0, left: 0 },
      { input: flipped, top: meta.height, left: 0 },
    ])
    .jpeg({ quality: 82 })
    .toFile(outputPath);

  console.log(`Wrote ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
