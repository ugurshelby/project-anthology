/**
 * Source-agnostic F1 ingestion core (Masterplan Karar E).
 *
 * Responsibilities:
 *  - `roundSuffixToSnapshotType`: normalise free-form path suffixes to the
 *    kanonik SnapshotType set enforced by the DB CHECK constraint.
 *  - `upsertF1Snapshot`: single write path — takes (season, round, type, data, source)
 *    and upserts into `f1_snapshots`. No caller cares which source filled it.
 *  - `runBounded`: in-house bounded concurrency (replaces p-limit dependency).
 *    Keeps at most `concurrency` promises in flight at once.
 *
 * Anti-pattern guards (Karar D):
 *  - No disk I/O: data flows memory → DB only.
 *  - No anon fallback: getSupabaseAdmin() throws if service key is absent.
 *  - No free-form `type` strings: roundSuffixToSnapshotType maps everything or
 *    returns null (skip) — nothing outside the CHECK set ever reaches the DB.
 */

import type { SnapshotType, SnapshotSource } from '@/types/database';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Json } from '@/types/database';

// ── Canonical type normaliser ──────────────────────────────────────────────

const SUFFIX_MAP: Record<string, SnapshotType> = {
  // Calendar
  calendar: 'calendar',
  // Driver standings
  driverstandings: 'standings_drivers',
  standings_drivers: 'standings_drivers',
  driver_standings: 'standings_drivers',
  // Constructor standings
  constructorstandings: 'standings_constructors',
  standings_constructors: 'standings_constructors',
  constructor_standings: 'standings_constructors',
  // Race results
  results: 'results',
  // Qualifying
  qualifying: 'qualifying',
  // Sprint
  sprint: 'sprint',
  // Circuit
  circuit: 'circuit',
};

/**
 * Map an arbitrary path suffix/key to a canonical SnapshotType.
 * Returns null if the input does not match any kanonik type — caller should skip.
 *
 * Examples:
 *   "driverStandings" → "standings_drivers"
 *   "results"         → "results"
 *   "results-1"       → null  (old disk-path artefact, never written to DB)
 *   "qualifying-1"    → null
 */
export function roundSuffixToSnapshotType(suffix: string): SnapshotType | null {
  const key = suffix.toLowerCase().replace(/[-\s]/g, '_');
  // Reject any suffixed variants like "results_1", "qualifying_1"
  if (/_([\d]+)$/.test(key)) return null;
  return SUFFIX_MAP[key] ?? null;
}

// ── Upsert ─────────────────────────────────────────────────────────────────

export interface UpsertResult {
  upserted: number;
  skipped: number;
  errors: string[];
}

/**
 * Upsert a single F1 snapshot into the DB.
 * - onConflict('season,round,type'): update data + source + fetched_at.
 * - round=null for season-level rows (calendar, standings).
 */
export async function upsertF1Snapshot(
  season: number,
  round: number | null,
  type: SnapshotType,
  data: Json,
  source: SnapshotSource,
): Promise<void> {
  const db = getSupabaseAdmin();
  const row = {
    season,
    round: round ?? null,
    type,
    data,
    source,
    fetched_at: new Date().toISOString(),
  };

  // Season-level rows (round IS NULL): Postgres UNIQUE(season,round,type) treats
  // each NULL as distinct, so plain upsert can INSERT duplicates and hit the
  // partial unique index idx_f1_snapshots_season_type_no_round. Update-first instead.
  if (round === null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (db.from('f1_snapshots') as any)
      .update({ data: row.data, source: row.source, fetched_at: row.fetched_at })
      .eq('season', season)
      .is('round', null)
      .eq('type', type)
      .select('id');

    if (updateError) {
      throw new Error(`upsertF1Snapshot(${season},${round},${type}): ${updateError.message}`);
    }
    if (updated?.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (db.from('f1_snapshots') as any).insert(row);
    if (insertError) {
      throw new Error(`upsertF1Snapshot(${season},${round},${type}): ${insertError.message}`);
    }
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from('f1_snapshots') as any).upsert(row, {
    onConflict: 'season,round,type',
  });
  if (error) {
    throw new Error(`upsertF1Snapshot(${season},${round},${type}): ${error.message}`);
  }
}

// ── Bounded concurrency ────────────────────────────────────────────────────

/**
 * Run an array of async thunks with at most `concurrency` in flight at once.
 * Collects results (resolved values or Error objects) preserving order.
 * No external dependency required.
 */
export async function runBounded<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<Array<T | Error>> {
  const results: Array<T | Error> = new Array(tasks.length);
  let nextIdx = 0;

  async function worker(): Promise<void> {
    while (nextIdx < tasks.length) {
      const idx = nextIdx++;
      try {
        results[idx] = await tasks[idx]();
      } catch (err) {
        results[idx] = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Ingest helpers (used by cron routes) ──────────────────────────────────

export interface IngestStats {
  upserted: number;
  skipped: number;
  errors: string[];
}

/** Ingest a season-level snapshot (round=null). Returns stats delta. */
export async function ingestSeasonSnapshot(
  season: number,
  type: SnapshotType,
  data: Json,
  source: SnapshotSource,
  stats: IngestStats,
): Promise<void> {
  try {
    await upsertF1Snapshot(season, null, type, data, source);
    stats.upserted++;
  } catch (err) {
    stats.errors.push(`${type} ${season}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Ingest a round-level snapshot. Returns stats delta. */
export async function ingestRoundSnapshot(
  season: number,
  round: number,
  type: SnapshotType,
  data: Json,
  source: SnapshotSource,
  stats: IngestStats,
): Promise<void> {
  try {
    await upsertF1Snapshot(season, round, type, data, source);
    stats.upserted++;
  } catch (err) {
    stats.errors.push(
      `${type} ${season}/${round}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
