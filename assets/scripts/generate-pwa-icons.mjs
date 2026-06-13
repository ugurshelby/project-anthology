/**
 * Generate PWA PNG icons from assets/icons/app-icon.svg (Faz 2).
 * Outputs the sizes the manifest + apple-touch-icon reference. Run with:
 *   node assets/scripts/generate-pwa-icons.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = resolve(root, 'assets/icons/app-icon.svg');
const outDir = resolve(root, 'public/icons');

const targets = [
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
];

const svg = await readFile(src);
await mkdir(outDir, { recursive: true });

for (const { size, file } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, file));
  console.log(`✓ public/icons/${file} (${size}×${size})`);
}
