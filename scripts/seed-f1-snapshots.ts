import { config } from 'dotenv';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import type { Database } from '../types/database';

config({ path: resolve(process.cwd(), '.env.local') });

const SEASONS = [2022, 2023, 2024, 2025] as const;
const DATA_ROOT = resolve(process.cwd(), 'public/data/f1');
const SOURCE = 'local';
const BATCH_SIZE = 50;

type SnapshotInsert = Database['public']['Tables']['f1_snapshots']['Insert'];
type CircuitInsert = Database['public']['Tables']['circuits']['Insert'];

interface CircuitMeta {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
}

interface CircuitYearJson {
  absent?: boolean;
  round?: number;
  winner?: { name?: string; code?: string };
  pole?: { name?: string; code?: string };
  fl?: { name?: string; time?: string };
  podium?: Array<{ name?: string; code?: string }>;
}

interface SeedStats {
  inserted: number;
  skipped: number;
  updated: number;
  errors: string[];
}

const seasonStats: Record<number, SeedStats> = Object.fromEntries(
  SEASONS.map((s) => [s, { inserted: 0, skipped: 0, updated: 0, errors: [] }]),
) as Record<number, SeedStats>;

const globalStats: SeedStats = { inserted: 0, skipped: 0, updated: 0, errors: [] };
const circuitStats: SeedStats = { inserted: 0, skipped: 0, updated: 0, errors: [] };

function readJsonFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    globalStats.errors.push(`JSON parse failed: ${filePath} — ${msg}`);
    return null;
  }
}

function roundFileType(filename: string): string {
  const stem = basename(filename, '.json');
  if (stem === 'sprint') return 'sprint';
  if (stem === 'results' || stem.startsWith('results-')) return stem;
  if (stem === 'qualifying' || stem.startsWith('qualifying-')) return stem;
  return stem;
}

function buildCircuitMetaMap(): Map<string, CircuitMeta> {
  const map = new Map<string, CircuitMeta>();

  for (const season of SEASONS) {
    const calendar = readJsonFile<{
      MRData?: { RaceTable?: { Races?: Array<{ Circuit?: { circuitId?: string; circuitName?: string; Location?: { locality?: string; country?: string } } }> } };
    }>(join(DATA_ROOT, String(season), 'calendar.json'));

    const races = calendar?.MRData?.RaceTable?.Races ?? [];
    for (const race of races) {
      const circuit = race.Circuit;
      const id = circuit?.circuitId;
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: circuit.circuitName ?? id,
          country: circuit.Location?.country ?? null,
          city: circuit.Location?.locality ?? null,
        });
      }
    }
  }

  return map;
}

async function upsertSnapshots(
  rows: SnapshotInsert[],
  season: number,
  updateOnConflict: boolean,
): Promise<void> {
  if (rows.length === 0) return;

  const { supabaseAdmin } = await import('../lib/supabase');
  const stats = seasonStats[season] ?? globalStats;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    if (updateOnConflict) {
      const { data, error } = await supabaseAdmin
        .from('f1_snapshots')
        .upsert(batch, { onConflict: 'season,round,type' })
        .select('id');

      if (error) {
        stats.errors.push(`Upsert batch failed (season ${season}): ${error.message}`);
        continue;
      }
      stats.updated += data?.length ?? batch.length;
      globalStats.updated += data?.length ?? batch.length;
    } else {
      const { data, error } = await supabaseAdmin
        .from('f1_snapshots')
        .upsert(batch, { onConflict: 'season,round,type', ignoreDuplicates: true })
        .select('id');

      if (error) {
        stats.errors.push(`Insert batch failed (season ${season}): ${error.message}`);
        continue;
      }
      const inserted = data?.length ?? 0;
      stats.inserted += inserted;
      stats.skipped += batch.length - inserted;
      globalStats.inserted += inserted;
      globalStats.skipped += batch.length - inserted;
    }
  }
}

async function seedStandings(season: number, updateOnConflict: boolean): Promise<void> {
  const rows: SnapshotInsert[] = [];
  const fetchedAt = new Date().toISOString();

  const driverPath = join(DATA_ROOT, String(season), 'driverStandings.json');
  const driverData = readJsonFile<Record<string, unknown>>(driverPath);
  if (driverData) {
    rows.push({
      season,
      round: null,
      type: 'standings_drivers',
      data: driverData,
      source: SOURCE,
      fetched_at: fetchedAt,
    });
  } else {
    seasonStats[season].errors.push(`Missing driverStandings.json for ${season}`);
  }

  const constructorPath = join(DATA_ROOT, String(season), 'constructorStandings.json');
  const constructorData = readJsonFile<Record<string, unknown>>(constructorPath);
  if (constructorData) {
    rows.push({
      season,
      round: null,
      type: 'standings_constructors',
      data: constructorData,
      source: SOURCE,
      fetched_at: fetchedAt,
    });
  } else {
    seasonStats[season].errors.push(`Missing constructorStandings.json for ${season}`);
  }

  await upsertSnapshots(rows, season, updateOnConflict);
}

async function seedCalendar(season: number, updateOnConflict: boolean): Promise<void> {
  const calendarPath = join(DATA_ROOT, String(season), 'calendar.json');
  let calendarData = readJsonFile<Record<string, unknown>>(calendarPath);

  if (!calendarData) {
    try {
      const response = await fetch(`http://localhost:3000/api/f1-season?path=${season}/races`);
      if (response.ok) {
        calendarData = (await response.json()) as Record<string, unknown>;
      } else {
        seasonStats[season].errors.push(
          `Calendar missing locally and API fetch failed (${response.status}) for ${season}`,
        );
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      seasonStats[season].errors.push(`Calendar fetch failed for ${season}: ${msg}`);
      return;
    }
  }

  await upsertSnapshots(
    [
      {
        season,
        round: null,
        type: 'calendar',
        data: calendarData,
        source: SOURCE,
        fetched_at: new Date().toISOString(),
      },
    ],
    season,
    updateOnConflict,
  );
}

async function seedRoundResults(season: number, updateOnConflict: boolean): Promise<void> {
  const roundsDir = join(DATA_ROOT, String(season), 'rounds');
  if (!existsSync(roundsDir)) {
    seasonStats[season].errors.push(`No rounds directory for ${season}`);
    return;
  }

  const rows: SnapshotInsert[] = [];
  const fetchedAt = new Date().toISOString();

  for (const roundDir of readdirSync(roundsDir, { withFileTypes: true })) {
    if (!roundDir.isDirectory()) continue;
    const round = Number(roundDir.name);
    if (!Number.isFinite(round)) continue;

    const roundPath = join(roundsDir, roundDir.name);
    for (const file of readdirSync(roundPath)) {
      if (!file.endsWith('.json')) continue;
      const data = readJsonFile<Record<string, unknown>>(join(roundPath, file));
      if (!data) continue;

      rows.push({
        season,
        round,
        type: roundFileType(file),
        data,
        source: SOURCE,
        fetched_at: fetchedAt,
      });
    }
  }

  await upsertSnapshots(rows, season, updateOnConflict);
}

async function seedCircuits(circuitMeta: Map<string, CircuitMeta>): Promise<void> {
  const circuitsDir = join(DATA_ROOT, 'circuits');
  if (!existsSync(circuitsDir)) {
    globalStats.errors.push('circuits directory not found');
    return;
  }

  const { supabaseAdmin } = await import('../lib/supabase');
  const snapshotRows: SnapshotInsert[] = [];
  const circuitAggregates = new Map<
    string,
    {
      meta: CircuitMeta;
      years: Record<string, CircuitYearJson>;
      bestFl: { year: number; time: string; driver: string } | null;
      latestWinner: { year: number; name: string } | null;
    }
  >();

  for (const circuitDir of readdirSync(circuitsDir, { withFileTypes: true })) {
    if (!circuitDir.isDirectory()) continue;
    const circuitId = circuitDir.name;
    const circuitPath = join(circuitsDir, circuitId);

    for (const file of readdirSync(circuitPath)) {
      if (!file.endsWith('.json')) continue;
      const year = Number(basename(file, '.json'));
      if (!SEASONS.includes(year as (typeof SEASONS)[number])) continue;

      const data = readJsonFile<CircuitYearJson>(join(circuitPath, file));
      if (!data) continue;

      const meta = circuitMeta.get(circuitId) ?? {
        id: circuitId,
        name: circuitId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        country: null,
        city: null,
      };

      snapshotRows.push({
        season: year,
        round: data.round ?? null,
        type: 'circuit',
        data: { circuitId, ...data },
        source: SOURCE,
        fetched_at: new Date().toISOString(),
      });

      let agg = circuitAggregates.get(circuitId);
      if (!agg) {
        agg = { meta, years: {}, bestFl: null, latestWinner: null };
        circuitAggregates.set(circuitId, agg);
      }
      agg.years[String(year)] = data;

      if (!data.absent && data.fl?.time && data.fl.name) {
        if (!agg.bestFl || data.fl.time < agg.bestFl.time) {
          agg.bestFl = { year, time: data.fl.time, driver: data.fl.name };
        }
      }
      if (!data.absent && data.winner?.name) {
        if (!agg.latestWinner || year > agg.latestWinner.year) {
          agg.latestWinner = { year, name: data.winner.name };
        }
      }
    }
  }

  for (const season of SEASONS) {
    const updateOnConflict = season === 2025;
    const seasonRows = snapshotRows.filter((r) => r.season === season);
    await upsertSnapshots(seasonRows, season, updateOnConflict);
  }

  const circuitRows: CircuitInsert[] = [];
  for (const [circuitId, agg] of circuitAggregates) {
    circuitRows.push({
      id: circuitId,
      name: agg.meta.name,
      country: agg.meta.country,
      city: agg.meta.city,
      first_f1_year: Math.min(...Object.keys(agg.years).map(Number)),
      lap_record_time: agg.bestFl?.time ?? null,
      lap_record_driver: agg.bestFl?.driver ?? null,
      lap_record_year: agg.bestFl?.year ?? null,
      iconic_moment: agg.latestWinner
        ? `${agg.latestWinner.name} won the ${agg.latestWinner.year} Grand Prix`
        : null,
      iconic_moment_year: agg.latestWinner?.year ?? null,
      data: { circuitId, years: agg.years },
    });
  }

  for (let i = 0; i < circuitRows.length; i += BATCH_SIZE) {
    const batch = circuitRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabaseAdmin
      .from('circuits')
      .upsert(batch, { onConflict: 'id' })
      .select('id');

    if (error) {
      circuitStats.errors.push(`Circuits upsert failed: ${error.message}`);
    } else {
      circuitStats.updated += data?.length ?? batch.length;
    }
  }
}

async function main(): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY missing in .env.local — aborting seed.');
    process.exit(1);
  }

  console.log('Building circuit metadata from calendars…');
  const circuitMeta = buildCircuitMetaMap();

  for (const season of SEASONS) {
    const updateOnConflict = season === 2025;
    console.log(`Seeding season ${season} (${updateOnConflict ? 'upsert' : 'insert-only'})…`);

    await seedStandings(season, updateOnConflict);
    await seedCalendar(season, updateOnConflict);
    await seedRoundResults(season, updateOnConflict);
  }

  console.log('Seeding circuits…');
  await seedCircuits(circuitMeta);

  console.log('\n=== Seed Summary ===');
  for (const season of SEASONS) {
    const s = seasonStats[season];
    console.log(
      `Season ${season}: inserted=${s.inserted}, skipped=${s.skipped}, updated=${s.updated}, errors=${s.errors.length}`,
    );
  }
  console.log(
    `Circuits table: updated=${circuitStats.updated}, errors=${circuitStats.errors.length}`,
  );
  console.log(
    `Global: inserted=${globalStats.inserted}, skipped=${globalStats.skipped}, updated=${globalStats.updated}`,
  );

  if (globalStats.errors.length > 0 || circuitStats.errors.length > 0) {
    console.log('\nErrors:');
    for (const e of [...globalStats.errors, ...circuitStats.errors]) {
      console.log(`  - ${e}`);
    }
    for (const season of SEASONS) {
      for (const e of seasonStats[season].errors) {
        console.log(`  - [${season}] ${e}`);
      }
    }
  }

  const { supabaseAdmin } = await import('../lib/supabase');
  const { data: verifyRows, error: verifyError } = await supabaseAdmin
    .from('f1_snapshots')
    .select('season, type')
    .in('season', [...SEASONS]);

  if (verifyError) {
    console.error('Verification query failed:', verifyError.message);
  } else if (verifyRows) {
    const counts = new Map<string, number>();
    for (const row of verifyRows) {
      const key = `${row.season}|${row.type}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    console.log('\n=== DB Verification (season|type → count) ===');
    [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, count]) => console.log(`  ${key.replace('|', ' / ')}: ${count}`));
    console.log(`  TOTAL: ${verifyRows.length}`);
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
