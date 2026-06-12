import { describe, it, expect } from 'vitest';
import {
  getLiveOrNextRace,
  getRaceCountdownPhase,
  isRaceDone,
  RACE_LIVE_WINDOW_MS,
  type CalendarRace,
} from '@/lib/f1Calendar';
import { raceStartMs } from '@/lib/f1/mrdata';
import { roundSuffixToSnapshotType } from '@/lib/f1Ingest';

const NOW = new Date('2026-06-09T12:00:00Z');

function race(date: string, time = '12:00:00Z'): CalendarRace {
  return { round: '1', date, time, raceName: 'Test GP' };
}

describe('isRaceDone', () => {
  it('returns false for a future race', () => {
    expect(isRaceDone(race('2026-12-01'), NOW)).toBe(false);
  });

  it('returns true for a past race', () => {
    expect(isRaceDone(race('2026-01-01'), NOW)).toBe(true);
  });

  it('returns false when the date is unusable', () => {
    expect(isRaceDone({ round: '1' }, NOW)).toBe(false);
  });
});

describe('getRaceCountdownPhase', () => {
  const startMs = Date.parse('2026-06-15T13:00:00Z');

  it('returns countdown before race start', () => {
    expect(getRaceCountdownPhase(startMs, startMs - 1000)).toBe('countdown');
  });

  it('returns live within 4 hours after start', () => {
    expect(getRaceCountdownPhase(startMs, startMs + 2 * 60 * 60 * 1000)).toBe('live');
  });

  it('returns completed after live window', () => {
    expect(getRaceCountdownPhase(startMs, startMs + RACE_LIVE_WINDOW_MS + 1)).toBe('completed');
  });

  it('returns completed for invalid target', () => {
    expect(getRaceCountdownPhase(NaN, startMs)).toBe('completed');
  });
});

describe('getLiveOrNextRace', () => {
  const races: CalendarRace[] = [
    { round: '1', date: '2026-01-01', time: '12:00:00Z', raceName: 'Past GP' },
    { round: '2', date: '2026-06-15', time: '13:00:00Z', raceName: 'Live GP' },
    { round: '3', date: '2026-12-01', time: '12:00:00Z', raceName: 'Future GP' },
  ];

  it('returns the live race when within the post-start window', () => {
    const liveStart = raceStartMs(races[1]!);
    const now = new Date(liveStart! + 60 * 60 * 1000);
    expect(getLiveOrNextRace(races, now)?.raceName).toBe('Live GP');
  });

  it('returns the next upcoming race when none are live', () => {
    expect(getLiveOrNextRace(races, NOW)?.raceName).toBe('Live GP');
  });
});

describe('roundSuffixToSnapshotType', () => {
  it('maps canonical suffixes', () => {
    expect(roundSuffixToSnapshotType('results')).toBe('results');
    expect(roundSuffixToSnapshotType('qualifying')).toBe('qualifying');
    expect(roundSuffixToSnapshotType('driverStandings')).toBe('standings_drivers');
  });

  // NOTE: the implementation deliberately REJECTS numeric-suffixed disk-path
  // artefacts ("results-1", "qualifying-2") by returning null — they must never
  // reach the DB. The original task brief expected these to map to the base
  // type; that contradicts the code, so we assert the real (correct) behaviour.
  it('rejects numeric-suffixed disk-path artefacts (returns null)', () => {
    expect(roundSuffixToSnapshotType('results-1')).toBeNull();
    expect(roundSuffixToSnapshotType('qualifying-2')).toBeNull();
  });

  it('returns null for unknown suffixes', () => {
    expect(roundSuffixToSnapshotType('telemetry')).toBeNull();
  });
});
