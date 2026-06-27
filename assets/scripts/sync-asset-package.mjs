/**
 * Copy illustrated 2026 assets from assets/asset-package/ into public/ with
 * the slugs expected by lib/assets/f1-icons.ts (driverIconSrc, teamIconSrc, carSrc).
 *
 * Run: node assets/scripts/sync-asset-package.mjs
 */
import { readFileSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const PKG = join(ROOT, 'assets', 'asset-package');

const ROSTER = JSON.parse(
  readFileSync(join(ROOT, 'assets', 'data', 'season-rosters.json'), 'utf8'),
);
const SEASON = 2026;
const roster = ROSTER[String(SEASON)];
if (!roster) throw new Error(`No roster for ${SEASON}`);

/** Numbered car SVG index → constructorId (underscore basename for carSrc). */
const CAR_INDEX_TO_ID = {
  1: 'mercedes',
  2: 'ferrari',
  3: 'mclaren',
  4: 'red_bull',
  5: 'alpine',
  6: 'rb',
  7: 'haas',
  8: 'williams',
  9: 'audi',
  10: 'aston_martin',
  11: 'cadillac',
};

/** asset-package team logo basename → public/teams kebab slug. */
const TEAM_LOGO_MAP = {
  'redbull.svg': 'red-bull.svg',
  'mclaren.svg': 'mclaren.svg',
  'visa_cash_racing_bulls.svg': 'racing-bulls.svg',
  'ferrari.svg': 'ferrari.svg',
  'mercedes.svg': 'mercedes.svg',
  'aston_martin.svg': 'aston-martin.svg',
  'alpine.svg': 'alpine.svg',
  'haas.svg': 'haas.svg',
  'williams.svg': 'williams.svg',
  'audi.svg': 'audi.svg',
  'cadillac.svg': 'cadillac.svg',
};

function copy(src, dest) {
  mkdirSync(join(dest, '..'), { recursive: true });
  copyFileSync(src, dest);
  const bytes = statSync(dest).size;
  console.log(`  ✓ ${dest.replace(ROOT, '.')} (${bytes} bytes)`);
}

console.log(`Syncing 2026 illustrated assets → public/`);

console.log('\nDrivers:');
const driversDir = join(ROOT, 'public', 'drivers', String(SEASON));
mkdirSync(driversDir, { recursive: true });
roster.drivers.forEach((d, i) => {
  const index = i + 1;
  const src = join(PKG, '2026-drivers', `${index}.svg`);
  const dest = join(driversDir, `${d.driverId}.svg`);
  copy(src, dest);
});

console.log('\nTeam logos:');
const teamsDir = join(ROOT, 'public', 'teams', String(SEASON));
mkdirSync(teamsDir, { recursive: true });
for (const [srcName, destName] of Object.entries(TEAM_LOGO_MAP)) {
  copy(join(PKG, '2026-team-logos', srcName), join(teamsDir, destName));
}

console.log('\nCars:');
const carsDir = join(ROOT, 'public', 'cars');
mkdirSync(carsDir, { recursive: true });
for (const [index, constructorId] of Object.entries(CAR_INDEX_TO_ID)) {
  copy(
    join(PKG, '2026-cars', `${index}.svg`),
    join(carsDir, `${constructorId}.svg`),
  );
}

console.log('\nDone.');
