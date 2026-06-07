/**
 * Read-path staleness guards for current-season f1_snapshots.
 *
 * When cached data is older than the race-calendar expects, callers should
 * bypass DB and hit the live Jolpica proxy so users see fresh standings/results
 * without waiting for the next cron.
 */

import {
  getLastFinishedRace,
  isRaceWeekend,
  isRoundWeekend,
  raceStartMs,
  type CalendarRace,
} from '@/lib/f1Calendar';
import {
  qualiSyncDueMs,
  raceResultsSyncDueMs,
  sprintSyncDueMs,
  standingsSyncDueMs,
} from '@/lib/f1/syncSchedule';
import type { SnapshotType } from '@/types/database';

const CALENDAR_RACE_WEEKEND_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const CALENDAR_OFF_WEEKEND_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function fetchedAtMs(fetchedAt: string | null | undefined): number | null {
  if (!fetchedAt) return null;
  const t = Date.parse(fetchedAt);
  return Number.isFinite(t) ? t : null;
}

function isOlderThan(fetchedAt: string | null | undefined, dueAt: number): boolean {
  const fetched = fetchedAtMs(fetchedAt);
  return fetched === null || fetched < dueAt;
}

export function isCalendarSnapshotStale(
  fetchedAt: string | null | undefined,
  races: CalendarRace[],
  now: Date = new Date(),
): boolean {
  const fetched = fetchedAtMs(fetchedAt);
  if (fetched === null) return true;
  const age = now.getTime() - fetched;
  if (isRaceWeekend(races, now)) return age > CALENDAR_RACE_WEEKEND_MAX_AGE_MS;
  return age > CALENDAR_OFF_WEEKEND_MAX_AGE_MS;
}

export function isStandingsSnapshotStale(
  fetchedAt: string | null | undefined,
  races: CalendarRace[],
  now: Date = new Date(),
): boolean {
  if (isRaceWeekend(races, now)) {
    for (const race of races) {
      const due = standingsSyncDueMs(race);
      if (due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due)) {
        return true;
      }
    }
  }

  const last = getLastFinishedRace(races, now);
  if (!last) return false;
  const due = standingsSyncDueMs(last);
  if (due === null || now.getTime() < due) return false;
  return isOlderThan(fetchedAt, due);
}

export function isRoundSnapshotStale(
  type: Extract<SnapshotType, 'results' | 'qualifying' | 'sprint'>,
  round: number,
  fetchedAt: string | null | undefined,
  races: CalendarRace[],
  now: Date = new Date(),
): boolean {
  const race = races.find((r) => Number(r.round) === round);
  if (!race) return false;

  if (isRoundWeekend(race, now)) {
    if (type === 'qualifying') {
      const due = qualiSyncDueMs(race);
      return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
    }
    if (type === 'sprint') {
      const due = sprintSyncDueMs(race);
      return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
    }
    if (type === 'results') {
      const due = raceResultsSyncDueMs(race);
      return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
    }
  }

  const last = getLastFinishedRace(races, now);
  if (!last || Number(last.round) !== round) return false;

  if (type === 'qualifying') {
    const due = qualiSyncDueMs(race);
    return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
  }
  if (type === 'sprint') {
    const due = sprintSyncDueMs(race);
    return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
  }
  if (type === 'results') {
    const start = raceStartMs(race);
    if (start === null || now.getTime() < start) return false;
    const due = raceResultsSyncDueMs(race);
    return due !== null && now.getTime() >= due && isOlderThan(fetchedAt, due);
  }

  return false;
}
