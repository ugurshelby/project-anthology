import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { logSupabaseCall, timed } from '@/lib/data/logger';
import {
  findRaceByCircuitId,
  getCircuitIdsFromRaces,
  getRaceWinner,
  getRacesFromCalendar,
  type CircuitWinnerEntry,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, type CalendarRace } from '@/lib/f1Calendar';
import { getSupabaseClient } from '@/lib/supabase';
import type { Json } from '@/types/database';

const WINNER_HISTORY_SEASONS = 8;

export interface CircuitCard {
  circuitId: string;
  circuitName: string;
  country: string;
  round: string;
  date: string;
  svgSrc: string | null;
}

export interface CircuitEditorial {
  lapLengthKm: string | null;
  drsZones: string | null;
}

export interface CircuitDetail {
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  round: string;
  date: string;
  raceName: string;
  svgSrc: string | null;
  laps: string | null;
  editorial: CircuitEditorial;
  winners: CircuitWinnerEntry[];
}

export async function getCurrentSeasonRaces(): Promise<CalendarRace[]> {
  const calendarData = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
  return getRacesFromCalendar(calendarData);
}

export function raceToCircuitCard(race: CalendarRace): CircuitCard | null {
  const circuitId = race.Circuit?.circuitId?.trim();
  if (!circuitId) return null;

  return {
    circuitId,
    circuitName: race.Circuit?.circuitName ?? race.raceName ?? circuitId,
    country: race.Circuit?.Location?.country ?? '—',
    round: String(race.round ?? '—'),
    date: race.date ?? '—',
    svgSrc: circuitIconSrc(circuitId),
  };
}

export async function getCurrentSeasonCircuitCards(): Promise<CircuitCard[]> {
  const races = await getCurrentSeasonRaces();
  return races
    .map(raceToCircuitCard)
    .filter((card): card is CircuitCard => card !== null);
}

export async function getCircuitIdsForSitemap(): Promise<string[]> {
  const races = await getCurrentSeasonRaces();
  return getCircuitIdsFromRaces(races);
}

export async function getCircuitEditorial(circuitId: string): Promise<CircuitEditorial> {
  const empty: CircuitEditorial = { lapLengthKm: null, drsZones: null };
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('circuits')
        .select('data')
        .eq('id', circuitId)
        .maybeSingle<{ data: Json }>(),
    );
    logSupabaseCall('circuits', `id=${circuitId}`, durationMs);
    if (result.error || !result.data?.data || typeof result.data.data !== 'object') {
      return empty;
    }
    const data = result.data.data as Record<string, unknown>;
    const lapLength = data.lap_length_km ?? data.lapLengthKm;
    const drs = data.drs_zones ?? data.drsZones;
    return {
      lapLengthKm: lapLength != null ? String(lapLength) : null,
      drsZones: drs != null ? String(drs) : null,
    };
  } catch {
    return empty;
  }
}

async function getWinnerForSeason(
  circuitId: string,
  season: number,
): Promise<CircuitWinnerEntry | null> {
  const calendarData = await fetchSeasonSnapshotTyped(season, 'calendar');
  const races = getRacesFromCalendar(calendarData);
  const race = findRaceByCircuitId(races, circuitId);
  if (!race?.round) return null;

  const round = Number(race.round);
  if (!Number.isFinite(round)) return null;

  const resultsData = await fetchRoundSnapshot(season, round, 'results');
  const winner = getRaceWinner(resultsData);
  if (!winner) return null;

  return {
    season,
    raceName: race.raceName ?? 'Grand Prix',
    driverName: winner.driverName,
    constructorName: winner.constructorName,
  };
}

export async function getCircuitWinners(
  circuitId: string,
  fromSeason = CURRENT_SEASON - WINNER_HISTORY_SEASONS + 1,
  toSeason = CURRENT_SEASON,
): Promise<CircuitWinnerEntry[]> {
  const seasons = Array.from(
    { length: toSeason - fromSeason + 1 },
    (_, i) => fromSeason + i,
  ).reverse();

  const entries = await Promise.all(
    seasons.map((season) => getWinnerForSeason(circuitId, season)),
  );

  return entries.filter((e): e is CircuitWinnerEntry => e !== null);
}

export async function getCircuitDetail(circuitId: string): Promise<CircuitDetail | null> {
  const races = await getCurrentSeasonRaces();
  const race = findRaceByCircuitId(races, circuitId);
  if (!race) return null;

  const round = race.round != null ? Number(race.round) : null;
  const [resultsData, editorial, winners] = await Promise.all([
    round != null && Number.isFinite(round)
      ? fetchRoundSnapshot(CURRENT_SEASON, round, 'results')
      : Promise.resolve(null),
    getCircuitEditorial(circuitId),
    getCircuitWinners(circuitId),
  ]);

  const winner = getRaceWinner(resultsData);

  return {
    circuitId,
    circuitName: race.Circuit?.circuitName ?? race.raceName ?? circuitId,
    country: race.Circuit?.Location?.country ?? '—',
    locality: race.Circuit?.Location?.locality ?? '—',
    round: String(race.round ?? '—'),
    date: race.date ?? '—',
    raceName: race.raceName ?? 'Grand Prix',
    svgSrc: circuitIconSrc(circuitId),
    laps: winner?.laps ?? null,
    editorial,
    winners,
  };
}

/** Editorial grid span classes — 6-column bento, repeating every 6 cards. */
export const CIRCUIT_GRID_SPANS = [
  'md:col-span-4 md:row-span-2',
  'md:col-span-2',
  'md:col-span-2',
  'md:col-span-3',
  'md:col-span-3',
  'md:col-span-6',
] as const;

export function circuitGridSpan(index: number): string {
  return CIRCUIT_GRID_SPANS[index % CIRCUIT_GRID_SPANS.length];
}

export function isFeaturedCircuitCard(index: number): boolean {
  return index % CIRCUIT_GRID_SPANS.length === 0;
}
