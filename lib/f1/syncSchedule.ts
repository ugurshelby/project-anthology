/**
 * Race-calendar-aware sync windows for F1 ingestion.
 *
 * Computes UTC instants when qualifying, sprint, race results, and standings
 * should be refreshed. Used by GitHub Actions (hourly due-check) and read-path
 * staleness guards. Postponements flow through automatically: callers always
 * pass the latest Jolpica/DB calendar, so shifted dates produce new windows.
 */

import {
  raceStartMs,
  sessionStartMs,
  type CalendarRace,
} from '@/lib/f1Calendar';

/** Sync this long after qualifying green light. */
export const QUALI_SYNC_OFFSET_MS = 90 * 60 * 1000;

/** Sync this long after sprint green light. */
export const SPRINT_SYNC_OFFSET_MS = 90 * 60 * 1000;

/** Sync race results this long after race green light (~2h race + buffer). */
export const RACE_RESULTS_OFFSET_MS = 2.5 * 60 * 60 * 1000;

/** Standings often lag results — refresh a bit later. */
export const STANDINGS_OFFSET_MS = 3 * 60 * 60 * 1000;

export type SyncTargetKind = 'calendar' | 'qualifying' | 'sprint' | 'results' | 'standings';

export interface SyncWindow {
  kind: SyncTargetKind;
  round: number | null;
  raceName: string;
  /** UTC epoch ms — earliest instant we should have ingested this data. */
  dueAt: number;
  label: string;
}

export function qualiSyncDueMs(race: CalendarRace): number | null {
  const start = sessionStartMs(race.Qualifying);
  return start !== null ? start + QUALI_SYNC_OFFSET_MS : null;
}

export function sprintSyncDueMs(race: CalendarRace): number | null {
  const start = sessionStartMs(race.Sprint);
  return start !== null ? start + SPRINT_SYNC_OFFSET_MS : null;
}

export function raceResultsSyncDueMs(race: CalendarRace): number | null {
  const start = raceStartMs(race);
  return start !== null ? start + RACE_RESULTS_OFFSET_MS : null;
}

export function standingsSyncDueMs(race: CalendarRace): number | null {
  const start = raceStartMs(race);
  return start !== null ? start + STANDINGS_OFFSET_MS : null;
}

/** All per-race sync windows for a season calendar (sorted by dueAt). */
export function getSyncWindows(races: CalendarRace[]): SyncWindow[] {
  const windows: SyncWindow[] = [
    {
      kind: 'calendar',
      round: null,
      raceName: 'Season calendar',
      dueAt: 0,
      label: 'calendar-baseline',
    },
  ];

  for (const race of races) {
    const round = Number(race.round);
    if (!round) continue;
    const name = race.raceName ?? `Round ${round}`;

    const qualiDue = qualiSyncDueMs(race);
    if (qualiDue !== null) {
      windows.push({
        kind: 'qualifying',
        round,
        raceName: name,
        dueAt: qualiDue,
        label: `R${round} qualifying`,
      });
    }

    const sprintDue = sprintSyncDueMs(race);
    if (sprintDue !== null) {
      windows.push({
        kind: 'sprint',
        round,
        raceName: name,
        dueAt: sprintDue,
        label: `R${round} sprint`,
      });
    }

    const resultsDue = raceResultsSyncDueMs(race);
    if (resultsDue !== null) {
      windows.push({
        kind: 'results',
        round,
        raceName: name,
        dueAt: resultsDue,
        label: `R${round} results`,
      });
    }

    const standingsDue = standingsSyncDueMs(race);
    if (standingsDue !== null) {
      windows.push({
        kind: 'standings',
        round: null,
        raceName: name,
        dueAt: standingsDue,
        label: `standings after R${round}`,
      });
    }
  }

  return windows.sort((a, b) => a.dueAt - b.dueAt);
}

/**
 * Windows whose dueAt fell within [now - lookbackMs, now].
 * Hourly GitHub Actions passes lookbackMs ≈ 65 minutes.
 */
export function getDueSyncWindows(
  windows: SyncWindow[],
  now: Date = new Date(),
  lookbackMs = 65 * 60 * 1000,
): SyncWindow[] {
  const t = now.getTime();
  const start = t - lookbackMs;
  return windows.filter((w) => w.kind !== 'calendar' && w.dueAt > 0 && w.dueAt <= t && w.dueAt >= start);
}

/** Whether a round should be processed in live ingestion scope. */
export function isRoundInLiveScope(
  race: CalendarRace,
  now: Date = new Date(),
): boolean {
  const raceDay = race.date ? Date.parse(`${race.date}T23:59:59Z`) : NaN;
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  if (Number.isFinite(raceDay) && raceDay >= sevenDaysAgo) return true;

  const qualiDue = qualiSyncDueMs(race);
  const sprintDue = sprintSyncDueMs(race);
  const resultsDue = raceResultsSyncDueMs(race);
  const earliest = Math.min(
    qualiDue ?? Infinity,
    sprintDue ?? Infinity,
    resultsDue ?? Infinity,
  );
  if (!Number.isFinite(earliest)) return false;
  // Active from first session sync window through 7 days after race day.
  return now.getTime() >= earliest - 24 * 60 * 60 * 1000;
}

export function shouldFetchQualifying(race: CalendarRace, now: Date = new Date()): boolean {
  const due = qualiSyncDueMs(race);
  return due !== null && now.getTime() >= due;
}

export function shouldFetchSprint(race: CalendarRace, now: Date = new Date()): boolean {
  const due = sprintSyncDueMs(race);
  return due !== null && now.getTime() >= due;
}

export function shouldFetchResults(race: CalendarRace, now: Date = new Date()): boolean {
  const due = raceResultsSyncDueMs(race);
  return due !== null && now.getTime() >= due;
}

export function shouldFetchStandings(races: CalendarRace[], now: Date = new Date()): boolean {
  for (const race of races) {
    const due = standingsSyncDueMs(race);
    if (due !== null && now.getTime() >= due) return true;
  }
  return false;
}
