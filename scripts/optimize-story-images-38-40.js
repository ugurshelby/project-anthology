/**
 * Optimize story images 38, 39, 40 in all three layout folders.
 * Reads from public/images/ (or root images/ as fallback), resizes to exact
 * layout dimensions, compresses PNG, writes to public/images/.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const publicImages = path.join(root, 'public', 'images');
const rootImages = path.join(root, 'images');

const LAYOUTS = [
  { name: 'Full 1280x720', width: 1280, height: 720 },
  { name: 'Landscape 1280x720', width: 1280, height: 720 },
  { name: 'Portrait 1280x1707', width: 1280, height: 1707 },
];

const IMAGE_NUMBERS = [38, 39, 40];

const PNG_OPTIONS = {
  compressionLevel: 9,
  adaptiveFiltering: true,
  palette: false, // keep full color for photos
};

async function optimizeOne(inputPath, outputPath, width, height) {
  if (!fs.existsSync(inputPath)) {
    return { skipped: true, reason: 'source not found' };
  }
  const statsBefore = fs.statSync(inputPath);
  await sharp(inputPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .png(PNG_OPTIONS)
    .toFile(outputPath);
  const statsAfter = fs.statSync(outputPath);
  return {
    skipped: false,
    before: statsBefore.size,
    after: statsAfter.size,
  };
}

async function run() {
  console.log('🖼️  Optimizing story images 38, 39, 40 in 3 layout folders...\n');

  let processed = 0;
  let skipped = 0;

  for (const layout of LAYOUTS) {
    const layoutDir = path.join(publicImages, layout.name);
    const layoutDirRoot = path.join(rootImages, layout.name);

    if (!fs.existsSync(layoutDir)) {
      fs.mkdirSync(layoutDir, { recursive: true });
    }

    for (const num of IMAGE_NUMBERS) {
      const fileName = `${num}.png`;
      const outPath = path.join(layoutDir, fileName);
      const srcPublic = path.join(layoutDir, fileName);
      const srcRoot = path.join(layoutDirRoot, fileName);
      const inputPath = fs.existsSync(srcPublic)
        ? srcPublic
        : fs.existsSync(srcRoot)
          ? srcRoot
          : null;
      if (!inputPath) {
        console.log(`  ⊘ ${layout.name}/${fileName} – source not found, skipped`);
        skipped++;
        continue;
      }

      const result = await optimizeOne(
        inputPath,
        outPath,
        layout.width,
        layout.height
      );

      const pct = ((result.before - result.after) / result.before * 100).toFixed(1);
      console.log(`  ✓ ${layout.name}/${fileName} – ${(result.after / 1024).toFixed(1)} KB (${pct}% smaller)`);
      processed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✓ Processed: ${processed} | Skipped: ${skipped}`);
  console.log('✅ Done.');
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
