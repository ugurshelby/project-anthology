import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { fetchAllRoundResults, fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { logSupabaseCall, timed } from '@/lib/data/logger';
import {
  findRaceByCircuitId,
  getCircuitIdsFromRaces,
  getLastRaceResult,
  getRaceWinner,
  getRacesFromCalendar,
  type CircuitWinnerEntry,
  type LastRaceRecap,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, isRaceDone, type CalendarRace } from '@/lib/f1Calendar';
import { getSupabaseClient } from '@/lib/supabase';
import type { Json } from '@/types/database';

const WINNER_HISTORY_SEASONS = 5;

export interface CircuitCard {
  circuitId: string;
  circuitName: string;
  country: string;
  round: string;
  date: string;
  svgSrc: string | null;
  done: boolean;
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

export interface CircuitWeather {
  /** Air temperature in °C. */
  temperatureC: number;
  /** Apparent ("feels like") temperature in °C. */
  apparentC: number | null;
  /** Wind speed in km/h. */
  windKmh: number | null;
  /** WMO weather interpretation code (0 = clear … 95+ = thunderstorm). */
  weatherCode: number;
  /** Human-readable summary derived from the WMO code. */
  summary: string;
  /** Whether it is currently day (1) or night (0) at the circuit. */
  isDay: boolean;
}

// Minimal WMO weather-code → label map (Open-Meteo current.weather_code).
const WMO_SUMMARY: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ hail',
};

/**
 * Live local weather at a circuit via Open-Meteo (no API key, server-side).
 * Returns null on any failure or missing coordinates so the panel can hide
 * gracefully — weather is a nice-to-have, never a hard dependency of the page.
 */
export async function getCircuitWeather(
  lat: number | undefined | null,
  lon: number | undefined | null,
): Promise<CircuitWeather | null> {
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,is_day`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      // Cache at the edge for 15 min, serve stale for an hour while revalidating.
      next: { revalidate: 900 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        apparent_temperature?: number;
        wind_speed_10m?: number;
        weather_code?: number;
        is_day?: number;
      };
    };
    const c = json.current;
    if (!c || typeof c.temperature_2m !== 'number') return null;

    const code = typeof c.weather_code === 'number' ? c.weather_code : 0;
    return {
      temperatureC: Math.round(c.temperature_2m),
      apparentC:
        typeof c.apparent_temperature === 'number' ? Math.round(c.apparent_temperature) : null,
      windKmh: typeof c.wind_speed_10m === 'number' ? Math.round(c.wind_speed_10m) : null,
      weatherCode: code,
      summary: WMO_SUMMARY[code] ?? 'Unknown',
      isDay: c.is_day !== 0,
    };
  } catch {
    return null;
  }
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
    done: isRaceDone(race),
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

/** One finished round's podium recap, for the "Results" scroll panel on the circuit detail page. */
export type SeasonRoundResult = LastRaceRecap;

/**
 * All finished rounds of the current season as podium recaps, newest first —
 * powers the circuit detail page's "Results" panel (replaces the old Driver
 * Standings sidebar, which duplicated /season and had no circuit relevance).
 */
export async function getCurrentSeasonResults(): Promise<SeasonRoundResult[]> {
  const races = await getCurrentSeasonRaces();
  const roundSnapshots = await fetchAllRoundResults(CURRENT_SEASON, races);
  return roundSnapshots
    .map((s) => getLastRaceResult(s.data))
    .filter((r): r is LastRaceRecap => r !== null)
    .sort((a, b) => Number(b.round) - Number(a.round));
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

/**
 * Index of the next upcoming race in the card list (first with `done === false`).
 * Used to pull that race into the page hero instead of an oversized grid cell.
 */
export function nextCircuitIndex(cards: Pick<CircuitCard, 'done'>[]): number {
  return cards.findIndex((c) => !c.done);
}
