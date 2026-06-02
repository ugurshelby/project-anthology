import { join } from 'path';
import { readFile } from 'fs/promises';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  fetchRoundSnapshot,
  fetchSeasonSnapshot,
  hasUsableMrData,
  parseSnapshotData,
} from '@/lib/f1Snapshots';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import type { MrDataPayload, RaceResult, SeasonCalendar, SeasonStandings } from '@/lib/data/types';

export type { SeasonStandings, SeasonCalendar, RaceResult, Race, MrDataPayload } from '@/lib/data/types';

const F1_DATA_ROOT = join(process.cwd(), 'public/data/f1');

const STANDINGS_TYPES = ['standings_drivers', 'driverStandings'] as const;
const CALENDAR_TYPES = ['calendar'] as const;
const RESULT_TYPES = ['results'] as const;

async function readLocalF1Json(year: number, ...segments: string[]): Promise<MrDataPayload | null> {
  try {
    const raw = await readFile(join(F1_DATA_ROOT, String(year), ...segments), 'utf-8');
    const parsed = JSON.parse(raw) as MrDataPayload;
    return hasUsableMrData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readLocalRoundJson(
  year: number,
  round: number,
  filename: string,
): Promise<MrDataPayload | null> {
  try {
    const raw = await readFile(
      join(F1_DATA_ROOT, String(year), 'rounds', String(round), filename),
      'utf-8',
    );
    const parsed = JSON.parse(raw) as MrDataPayload;
    return hasUsableMrData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchSeasonSnapshotTyped(
  supabase: SupabaseClient,
  year: number,
  types: readonly string[],
): Promise<MrDataPayload | null> {
  for (const type of types) {
    const { result, durationMs } = await timed(async () => {
      const { data, error } = await supabase
        .from('f1_snapshots')
        .select('data')
        .eq('season', year)
        .is('round', null)
        .eq('type', type)
        .maybeSingle();
      if (error) throw error;
      return data?.data ?? null;
    });
    logSupabaseCall('f1_snapshots', `select season=${year} type=${type}`, durationMs);
    const payload = parseSnapshotData(result);
    if (hasUsableMrData(payload)) return payload as MrDataPayload;
  }
  return null;
}

async function fetchRoundSnapshotTyped(
  supabase: SupabaseClient,
  year: number,
  round: number,
  types: readonly string[],
): Promise<MrDataPayload | null> {
  for (const type of types) {
    const { result, durationMs } = await timed(() =>
      fetchRoundSnapshot(supabase, year, round, type === 'results' ? 'results' : type),
    );
    logSupabaseCall('f1_snapshots', `select season=${year} round=${round} type=${type}`, durationMs);
    const payload = parseSnapshotData(result);
    if (hasUsableMrData(payload)) return payload as MrDataPayload;
  }
  return null;
}

async function fetchStandingsFromApi(year: number): Promise<MrDataPayload | null> {
  const path = `/api/f1-season?path=${encodeURIComponent(`${year}/driverStandings`)}`;
  const data = await fetchSiteJson<MrDataPayload>(path);
  return data && hasUsableMrData(data) ? data : null;
}

async function fetchCalendarFromApi(year: number): Promise<MrDataPayload | null> {
  const path = `/api/f1-season?path=${encodeURIComponent(`${year}/races`)}`;
  const data = await fetchSiteJson<MrDataPayload>(path);
  return data && hasUsableMrData(data) ? data : null;
}

async function fetchRaceResultFromApi(year: number, round: number): Promise<MrDataPayload | null> {
  const path = `/api/f1-season?path=${encodeURIComponent(`${year}/${round}/results`)}`;
  const data = await fetchSiteJson<MrDataPayload>(path);
  return data && hasUsableMrData(data) ? data : null;
}

export async function getSeasonStandings(year: number): Promise<SeasonStandings | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let data = await fetchSeasonSnapshotTyped(supabase, year, STANDINGS_TYPES);
      if (!data) {
        data = parseSnapshotData(
          await fetchSeasonSnapshot(supabase, year, 'driverStandings'),
        ) as MrDataPayload | null;
        if (data && hasUsableMrData(data)) {
          logSupabaseCall('f1_snapshots', `legacy driverStandings season=${year}`, 0);
        } else {
          data = null;
        }
      }
      if (data) return { season: year, data };
      logFallback(`supabase standings ${year}`, 'local f1 json');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logFallback(`supabase standings ${year}`, 'local f1 json', msg);
    }
  } else {
    logFallback('supabase client unavailable', `local f1 json ${year}`);
  }

  const local = await readLocalF1Json(year, 'driverStandings.json');
  if (local) return { season: year, data: local };

  logFallback(`local standings ${year}`, '/api/f1-season');
  const api = await fetchStandingsFromApi(year);
  return api ? { season: year, data: api } : null;
}

export async function getSeasonCalendar(year: number): Promise<SeasonCalendar | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const data = await fetchSeasonSnapshotTyped(supabase, year, CALENDAR_TYPES);
      if (data) return { season: year, data };
      logFallback(`supabase calendar ${year}`, 'local f1 json');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logFallback(`supabase calendar ${year}`, 'local f1 json', msg);
    }
  } else {
    logFallback('supabase client unavailable', `local f1 json ${year}`);
  }

  const local = await readLocalF1Json(year, 'calendar.json');
  if (local) return { season: year, data: local };

  logFallback(`local calendar ${year}`, '/api/f1-season');
  const api = await fetchCalendarFromApi(year);
  return api ? { season: year, data: api } : null;
}

export async function getRaceResult(year: number, round: number): Promise<RaceResult | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const data = await fetchRoundSnapshotTyped(supabase, year, round, RESULT_TYPES);
      if (data) return { season: year, round, data };
      logFallback(`supabase results ${year} r${round}`, 'local f1 json');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logFallback(`supabase results ${year} r${round}`, 'local f1 json', msg);
    }
  } else {
    logFallback('supabase client unavailable', `local f1 json ${year}/${round}`);
  }

  const local = await readLocalRoundJson(year, round, 'results.json');
  if (local) return { season: year, round, data: local };

  logFallback(`local results ${year} r${round}`, '/api/f1-season');
  const api = await fetchRaceResultFromApi(year, round);
  return api ? { season: year, round, data: api } : null;
}
