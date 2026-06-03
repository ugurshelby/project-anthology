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
export interface CalendarRace {
  round?: string | number;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm:ssZ
  raceName?: string;
  Circuit?: { circuitId?: string };
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

/** Parse a race's end instant. Falls back to end-of-day UTC when time is absent. */
function raceEnd(race: CalendarRace): number {
  const d = race?.date;
  if (!d) return NaN;
  const iso = race.time ? `${d}T${race.time}` : `${d}T23:59:59Z`;
  return new Date(iso).getTime();
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
export function isRaceWeekend(
  races: CalendarRace[] | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!races?.length) return false;
  const t = now.getTime();
  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
  return races.some((r) => {
    if (!r.date) return false;
    const start = new Date(`${r.date}T00:00:00Z`).getTime();
    if (Number.isNaN(start)) return false;
    return Math.abs(start - t) <= TWO_DAYS;
  });
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
