/**
 * F1 snapshot read layer — 3-tier fallback (Masterplan Karar E):
 *   1. Supabase `f1_snapshots` (DB — the single source of truth)
 *   2. build-time static JSON under public/data/f1 (if present)
 *   3. Jolpica proxy via /api/f1-season (last resort, live only)
 *
 * Historical data is always served from the DB (F1DB seed has written it);
 * Jolpica is never used for historical seasons. All reads are server-side (RSC).
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { Json, SnapshotType } from '@/types/database';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { readPublicJson } from '@/lib/data/fs';

/** Ergast/Jolpica envelope — kept as opaque Json; UI consumes the shape directly. */
export type MrData = { MRData?: Record<string, unknown> } & Record<string, unknown>;

/** Season-level snapshot types (round IS NULL). */
type SeasonSnapshotType = Extract<
  SnapshotType,
  'calendar' | 'standings_drivers' | 'standings_constructors'
>;

/** Map a season snapshot type to its Jolpica path suffix (proxy fallback). */
const SEASON_TYPE_TO_PROXY: Record<SeasonSnapshotType, string> = {
  calendar: '', // {year}.json
  standings_drivers: 'driverStandings',
  standings_constructors: 'constructorStandings',
};

/** Map a season snapshot type to its static-file name under public/data/f1/{year}/. */
const SEASON_TYPE_TO_STATIC: Record<SeasonSnapshotType, string> = {
  calendar: 'calendar.json',
  standings_drivers: 'driverStandings.json',
  standings_constructors: 'constructorStandings.json',
};

function hasMrData(json: unknown): json is MrData {
  return Boolean(json && typeof json === 'object' && 'MRData' in (json as object));
}

/**
 * Fetch a season-level snapshot (round IS NULL) by canonical type.
 * DB → static → Jolpica proxy.
 */
export async function fetchSeasonSnapshotTyped(
  season: number,
  type: SeasonSnapshotType,
): Promise<MrData | null> {
  // 1) DB
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('f1_snapshots')
        .select('data')
        .eq('season', season)
        .is('round', null)
        .eq('type', type)
        // Round-NULL rows can duplicate (Postgres treats NULLs as distinct in the
        // UNIQUE constraint), so take the freshest row instead of erroring on >1.
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ data: Json }>(),
    );
    logSupabaseCall('f1_snapshots', `season=${season} type=${type}`, durationMs);
    if (!result.error && result.data?.data && hasMrData(result.data.data)) {
      return result.data.data as MrData;
    }
  } catch (err) {
    logFallback('supabase f1_snapshots', 'static', (err as Error).message);
  }

  // 2) static (build-time fallback)
  const staticJson = await readPublicJson<MrData>(
    `data/f1/${season}/${SEASON_TYPE_TO_STATIC[type]}`,
  );
  if (hasMrData(staticJson)) return staticJson;

  // 3) Jolpica proxy — live seasons only (historical must be in DB)
  if (season >= CURRENT_SEASON) {
    logFallback('static', '/api/f1-season (proxy)', `season=${season} type=${type}`);
    const suffix = SEASON_TYPE_TO_PROXY[type];
    const path = suffix ? `/api/f1-season?path=${season}/${suffix}` : `/api/f1-season?path=${season}`;
    const proxied = await fetchSiteJson<MrData>(path);
    if (hasMrData(proxied)) return proxied;
  }

  return null;
}

/**
 * Fetch a round-level snapshot (results / qualifying / sprint).
 * DB → static → Jolpica proxy (live only).
 */
export async function fetchRoundSnapshot(
  season: number,
  round: number,
  type: Extract<SnapshotType, 'results' | 'qualifying' | 'sprint'>,
): Promise<MrData | null> {
  // 1) DB
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('f1_snapshots')
        .select('data')
        .eq('season', season)
        .eq('round', round)
        .eq('type', type)
        // Defensive: take the freshest row if duplicates ever exist.
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ data: Json }>(),
    );
    logSupabaseCall('f1_snapshots', `season=${season} round=${round} type=${type}`, durationMs);
    if (!result.error && result.data?.data && hasMrData(result.data.data)) {
      return result.data.data as MrData;
    }
  } catch (err) {
    logFallback('supabase f1_snapshots', 'static', (err as Error).message);
  }

  // 2) static
  const staticJson = await readPublicJson<MrData>(
    `data/f1/${season}/rounds/${round}/${type}.json`,
  );
  if (hasMrData(staticJson)) return staticJson;

  // 3) Jolpica proxy — live only
  if (season >= CURRENT_SEASON) {
    logFallback('static', '/api/f1-season (proxy)', `season=${season} round=${round} type=${type}`);
    const proxied = await fetchSiteJson<MrData>(
      `/api/f1-season?path=${season}/${round}/${type}`,
    );
    if (hasMrData(proxied)) return proxied;
  }

  return null;
}

/** Convenience: current-season calendar races (used by getF1Context callers). */
export async function fetchCurrentCalendar(): Promise<MrData | null> {
  return fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
}

export type { Json };
