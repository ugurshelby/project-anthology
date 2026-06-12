/**
 * F1 Temporal Single Source of Truth (Masterplan Karar D — no hardcoding).
 *
 * Every season/round/"which season is current" decision flows through here.
 * No other file hardcodes the season year, driver list, or team list.
 *
 * This module is intentionally DEPENDENCY-FREE (a leaf): it does pure temporal
 * reasoning from the system clock and from calendar data PASSED IN by callers.
 * It does not import the data layer, so `lib/data/f1.ts` can depend on it
 * without a cycle.
 */

/** Earliest season we backfill (F1DB historical seed lower bound). */
export const F1_SEASON_MIN = 1950;

/**
 * Current season, derived from the clock — never hardcoded.
 * The F1 season aligns with the calendar year; before the first race the
 * standings of the new year are simply empty, which the UI tolerates.
 */
export const CURRENT_SEASON: number = new Date().getUTCFullYear();

/** Minimal shape of an Ergast/Jolpica race (only what temporal helpers need). */
export interface CalendarCircuit {
  circuitId?: string;
  circuitName?: string;
  Location?: {
    locality?: string;
    country?: string;
  };
}

/** Ergast/Jolpica session slot (practice, qualifying, sprint, race). */
export interface SessionSlot {
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm:ssZ
}

export interface CalendarRace {
  round?: string | number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm:ssZ — race green-light start (Ergast convention)
  raceName?: string;
  Circuit?: CalendarCircuit;
  Qualifying?: SessionSlot;
  Sprint?: SessionSlot;
}

/** UTC epoch ms for a session start, or null when the slot is unusable. */
export function sessionStartMs(slot: SessionSlot | undefined): number | null {
  if (!slot?.date) return null;
  const iso = slot.time ? `${slot.date}T${slot.time}` : `${slot.date}T12:00:00Z`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** Race green-light start (Ergast `date` + `time`). */
export function raceStartMs(race: CalendarRace): number | null {
  if (!race?.date) return null;
  const iso = race.time ? `${race.date}T${race.time}` : `${race.date}T12:00:00Z`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

export interface F1Context {
  /** Season treated as "current" right now. */
  currentSeason: number;
  /** Inclusive backfill lower bound. */
  seasonMin: number;
  /** True if we are within a race weekend window (when a calendar is provided). */
  isRaceWeekend: boolean;
  /** The next upcoming (not-yet-done) race, if a calendar is provided. */
  nextRace: CalendarRace | null;
  /** The most recent finished race, if a calendar is provided. */
  lastFinishedRace: CalendarRace | null;
}

/** @deprecated Ergast `time` is race start, not end — prefer `raceStartMs` + buffers in syncSchedule. */
function raceEnd(race: CalendarRace): number {
  const start = raceStartMs(race);
  return start ?? NaN;
}

/**
 * Has this race finished as of `now`? Mirrors the legacy `isRaceDone` guard so
 * ingestion never fetches round data before the race is over.
 */
export function isRaceDone(race: CalendarRace, now: Date = new Date()): boolean {
  const end = raceEnd(race);
  if (Number.isNaN(end)) return false;
  return end < now.getTime();
}

/**
 * Are we within a race weekend? Heuristic: the race date is within ±2 days of
 * `now` (covers practice Fri → race Sun). Requires a calendar; without one we
 * conservatively return false.
 */
const RACE_WEEKEND_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

/** True when `now` is within ±2 days of this race's scheduled date. */
export function isRoundWeekend(
  race: CalendarRace,
  now: Date = new Date(),
): boolean {
  if (!race.date) return false;
  const dayStart = new Date(`${race.date}T00:00:00Z`).getTime();
  if (Number.isNaN(dayStart)) return false;
  return Math.abs(dayStart - now.getTime()) <= RACE_WEEKEND_WINDOW_MS;
}

export function isRaceWeekend(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!races?.length) return false;
  return races.some((r) => isRoundWeekend(r, now));
}

/** Duration after race start during which the UI treats the race as "live". */
export const RACE_LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;

export type RaceCountdownPhase = 'countdown' | 'live' | 'completed';

/** Countdown UI phase relative to race start and the live window. */
export function getRaceCountdownPhase(
  targetMs: number,
  nowMs: number,
): RaceCountdownPhase {
  if (!Number.isFinite(targetMs)) return 'completed';
  if (nowMs < targetMs) return 'countdown';
  if (nowMs < targetMs + RACE_LIVE_WINDOW_MS) return 'live';
  return 'completed';
}

/** Race currently in the live window, if any (latest by round). */
export function getLiveRace(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): CalendarRace | null {
  if (!races?.length) return null;
  const nowMs = now.getTime();
  const live = races
    .filter((r) => {
      const start = raceStartMs(r);
      return start != null && getRaceCountdownPhase(start, nowMs) === 'live';
    })
    .sort((a, b) => Number(b.round ?? 0) - Number(a.round ?? 0));
  return live[0] ?? null;
}

/** Live race when in the post-start window; otherwise the next upcoming race. */
export function getLiveOrNextRace(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): CalendarRace | null {
  return getLiveRace(races, now) ?? getNextRace(races, now);
}

/** Next not-yet-finished race (earliest by round) from a calendar. */
export function getNextRace(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): CalendarRace | null {
  if (!races?.length) return null;
  const upcoming = races
    .filter((r) => !isRaceDone(r, now))
    .sort((a, b) => Number(a.round ?? 0) - Number(b.round ?? 0));
  return upcoming[0] ?? null;
}

/** Most recent finished race (latest by round) from a calendar. */
export function getLastFinishedRace(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): CalendarRace | null {
  if (!races?.length) return null;
  const done = races
    .filter((r) => isRaceDone(r, now))
    .sort((a, b) => Number(b.round ?? 0) - Number(a.round ?? 0));
  return done[0] ?? null;
}

/**
 * Resolve the temporal context. Pass the current season's calendar races (from
 * the data layer) to enrich race-weekend / next-race fields; omit them for a
 * clock-only context.
 */
export function getF1Context(
  currentSeasonRaces?: CalendarRace[] | null,
  now: Date = new Date(),
): F1Context {
  return {
    currentSeason: CURRENT_SEASON,
    seasonMin: F1_SEASON_MIN,
    isRaceWeekend: isRaceWeekend(currentSeasonRaces, now),
    nextRace: getNextRace(currentSeasonRaces, now),
    lastFinishedRace: getLastFinishedRace(currentSeasonRaces, now),
  };
}
