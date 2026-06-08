/**
 * One-time historical F1 seed: F1DB → Supabase f1_snapshots (Masterplan Karar E).
 *
 * Downloads the latest F1DB release JSON once into memory, then upserts
 * season + round snapshots for SEED_MIN..SEED_MAX (default 2018..currentYear).
 *
 * Usage:
 *   npx tsx scripts/seed-f1-history.ts
 *   npx tsx scripts/seed-f1-history.ts --from 2020 --to 2023   # custom range
 *   npx tsx scripts/seed-f1-history.ts --dry-run               # report only
 *
 * Anti-pattern guards (Karar D):
 *  - NO disk writes — F1DB JSON stays in memory.
 *  - NO Jolpica calls — F1DB is authoritative for history.
 *  - NO anon fallback — getSupabaseAdmin() throws if service key absent.
 *  - CONCURRENCY=5 — bounded parallelism; avoids Supabase connection storms.
 *
 * Env required: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (loaded from .env.local via dotenv before running)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import {
  loadF1Db,
  getF1DbLookups,
  toMRDataCalendar,
  toMRDataResults,
  toMRDataQualifying,
  toMRDataSprint,
  toMRDataDriverStandings,
  toMRDataConstructorStandings,
} from '../lib/f1/sources/f1db';
import {
  upsertF1Snapshot,
  runBounded,
  type IngestStats,
} from '../lib/f1Ingest';
import { F1_SEASON_MIN } from '../lib/f1Calendar';
import type { SnapshotType, Json } from '../types/database';

const SEED_MIN = Math.max(F1_SEASON_MIN, 2018); // masterplan: seed from 2018
const CONCURRENCY = 5;

function parseArgs(): { from: number; to: number; dryRun: boolean } {
  const args = process.argv.slice(2);
  let from = SEED_MIN;
  let to = new Date().getUTCFullYear();
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) from = parseInt(args[++i], 10);
    if (args[i] === '--to' && args[i + 1]) to = parseInt(args[++i], 10);
    if (args[i] === '--dry-run') dryRun = true;
  }
  return { from, to, dryRun };
}

async function upsert(
  season: number,
  round: number | null,
  type: SnapshotType,
  data: Json,
  dryRun: boolean,
  stats: IngestStats,
): Promise<void> {
  if (dryRun) {
    console.log(`  [dry-run] ${season}/${round ?? 'season'} ${type}`);
    stats.upserted++;
    return;
  }
  try {
    await upsertF1Snapshot(season, round, type, data, 'f1db');
    stats.upserted++;
  } catch (err) {
    const msg = `${season}/${round ?? 'season'} ${type}: ${err instanceof Error ? err.message : String(err)}`;
    stats.errors.push(msg);
    console.warn('  ERR', msg);
  }
}

async function main(): Promise<void> {
  const { from, to, dryRun } = parseArgs();
  const stats: IngestStats = { upserted: 0, skipped: 0, errors: [] };

  console.log(`\n=== F1DB Historical Seed ===`);
  console.log(`Range: ${from}–${to}  |  dry-run: ${dryRun}  |  concurrency: ${CONCURRENCY}\n`);

  console.log('Loading F1DB JSON from GitHub…');
  const db = await loadF1Db();
  const lk = getF1DbLookups(db);
  const races = db.races ?? [];
  const seasons = db.seasons ?? [];
  console.log(
    `  ${races.length} races, ${seasons.length} season records, ${lk.drivers.size} drivers, ${lk.constructors.size} constructors loaded.\n`,
  );

  for (let season = from; season <= to; season++) {
    const seasonRaces = races.filter((r) => r.year === season);
    const seasonRecord = seasons.find((s) => s.year === season);

    console.log(`Season ${season}: ${seasonRaces.length} races`);

    // Season-level snapshots
    const calData = toMRDataCalendar(season, races);
    await upsert(season, null, 'calendar', calData as unknown as Json, dryRun, stats);

    if (seasonRecord) {
      const drvSt = toMRDataDriverStandings(season, seasonRecord, lk);
      await upsert(season, null, 'standings_drivers', drvSt as unknown as Json, dryRun, stats);

      const conSt = toMRDataConstructorStandings(season, seasonRecord, lk);
      await upsert(season, null, 'standings_constructors', conSt as unknown as Json, dryRun, stats);
    }

    // Round-level tasks (bounded concurrency)
    const roundTasks = seasonRaces.flatMap((race) => {
      const tasks: Array<() => Promise<void>> = [];

      // Results
      const resultsData = toMRDataResults(season, race.round, races, lk);
      const raceArr = (resultsData.MRData as { RaceTable?: { Races?: Array<{ Results?: unknown[] }> } })?.RaceTable?.Races?.[0];
      if (raceArr?.Results && raceArr.Results.length > 0) {
        tasks.push(() =>
          upsert(season, race.round, 'results', resultsData as unknown as Json, dryRun, stats),
        );
      }

      // Qualifying
      const qualData = toMRDataQualifying(season, race.round, races, lk);
      const qualRace = (qualData.MRData as { RaceTable?: { Races?: Array<{ QualifyingResults?: unknown[] }> } })?.RaceTable?.Races?.[0];
      if (qualRace?.QualifyingResults && qualRace.QualifyingResults.length > 0) {
        tasks.push(() =>
          upsert(season, race.round, 'qualifying', qualData as unknown as Json, dryRun, stats),
        );
      }

      // Sprint (only if data present)
      const sprintData = toMRDataSprint(season, race.round, races, lk);
      const sprintRace = (sprintData.MRData as { RaceTable?: { Races?: unknown[] } })?.RaceTable?.Races;
      if (Array.isArray(sprintRace) && sprintRace.length > 0) {
        tasks.push(() =>
          upsert(season, race.round, 'sprint', sprintData as unknown as Json, dryRun, stats),
        );
      }

      return tasks;
    });

    const results = await runBounded(roundTasks, CONCURRENCY);
    const errs = results.filter((r): r is Error => r instanceof Error);
    for (const e of errs) {
      stats.errors.push(e.message);
      console.warn('  ERR', e.message);
    }

    console.log(
      `  season ${season}: ${stats.upserted} upserted total, ${stats.errors.length} errors so far`,
    );
  }

  console.log('\n=== Seed complete ===');
  console.log(`Upserted: ${stats.upserted}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Errors:   ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach((e) => console.log(' ', e));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
