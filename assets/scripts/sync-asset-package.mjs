/**
 * Copy production assets from assets/asset-package/ into public/.
 * Mapping is defined in assets/data/asset-package-manifest.json.
 *
 * Run: npm run sync:assets
 */
import { readFileSync, copyFileSync, mkdirSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const PKG = join(ROOT, 'assets', 'asset-package');
const MANIFEST = JSON.parse(
  readFileSync(join(ROOT, 'assets', 'data', 'asset-package-manifest.json'), 'utf8'),
);

function copy(src, dest) {
  mkdirSync(join(dest, '..'), { recursive: true });
  copyFileSync(src, dest);
  const bytes = statSync(dest).size;
  console.log(`  ✓ ${dest.replace(ROOT, '.')} (${bytes} bytes)`);
}

console.log('Syncing asset-package → public/');

console.log('\nDrivers:');
const driversDir = join(ROOT, 'public', 'drivers', String(MANIFEST.season));
mkdirSync(driversDir, { recursive: true });
for (const [driverId, index] of Object.entries(MANIFEST.drivers)) {
  copy(
    join(PKG, '2026-drivers', `${index}.svg`),
    join(driversDir, `${driverId}.svg`),
  );
}

console.log('\nTeam logos:');
const teamsDir = join(ROOT, 'public', 'teams', String(MANIFEST.season));
mkdirSync(teamsDir, { recursive: true });
for (const [srcName, destName] of Object.entries(MANIFEST.teamLogos)) {
  copy(join(PKG, '2026-team-logos', srcName), join(teamsDir, destName));
}

console.log('\nCars:');
const carsDir = join(ROOT, 'public', 'cars');
mkdirSync(carsDir, { recursive: true });
for (const [index, constructorId] of Object.entries(MANIFEST.cars)) {
  copy(
    join(PKG, '2026-cars', `${index}.svg`),
    join(carsDir, `${constructorId}.svg`),
  );
}

console.log('\nCircuit cover photos:');
const coversDir = join(ROOT, 'public', 'circuit-images');
mkdirSync(coversDir, { recursive: true });
const coverFiles = new Set(Object.values(MANIFEST.circuitCovers));
for (const file of coverFiles) {
  copy(join(PKG, 'circuit-images', file), join(coversDir, file));
}

console.log('\nDone.');
