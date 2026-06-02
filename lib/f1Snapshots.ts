import type { SupabaseClient } from '@supabase/supabase-js';

const SEASON_RESOURCES = new Set(['calendar', 'driverStandings', 'constructorStandings']);

/** Map legacy round `suffix` query param to `f1_snapshots.type`. */
export function roundSuffixToSnapshotType(suffix: string): string {
  const normalized = suffix.trim();
  if (normalized === 'results' || /^results-\d+$/.test(normalized)) return 'results';
  if (normalized === 'qualifying' || /^qualifying-\d+$/.test(normalized)) return 'qualifying';
  if (normalized === 'sprint' || /^sprint-\d+$/.test(normalized)) return 'sprint';
  return normalized;
}

/** Map legacy season `resource` query param to `f1_snapshots.type`. */
export function seasonResourceToSnapshotType(resource: string): string {
  return resource;
}

export function isValidSeasonResource(resource: string): boolean {
  return SEASON_RESOURCES.has(resource);
}

export function parseSnapshotData(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export function hasUsableMrData(json: unknown): json is { MRData: Record<string, unknown> } {
  return Boolean(json && typeof json === 'object' && (json as { MRData?: unknown }).MRData);
}

export async function fetchRoundSnapshot(
  supabase: SupabaseClient,
  season: number,
  round: number,
  suffix: string,
): Promise<unknown | null> {
  const type = roundSuffixToSnapshotType(suffix);
  const { data, error } = await supabase
    .from('f1_snapshots')
    .select('data')
    .eq('season', season)
    .eq('round', round)
    .eq('type', type)
    .maybeSingle();

  if (error) throw error;
  return data?.data ?? null;
}

export async function fetchSeasonSnapshot(
  supabase: SupabaseClient,
  season: number,
  resource: string,
): Promise<unknown | null> {
  const type = seasonResourceToSnapshotType(resource);
  const { data, error } = await supabase
    .from('f1_snapshots')
    .select('data')
    .eq('season', season)
    .is('round', null)
    .eq('type', type)
    .maybeSingle();

  if (error) throw error;
  return data?.data ?? null;
}

export async function upsertF1Snapshot(
  supabase: SupabaseClient,
  season: number,
  round: number | null,
  type: string,
  data: Record<string, unknown>,
  source = 'jolpica',
): Promise<void> {
  const { error } = await supabase.from('f1_snapshots').upsert(
    { season, round, type, data, source },
    { onConflict: 'season,round,type' },
  );
  if (error) throw error;
}
