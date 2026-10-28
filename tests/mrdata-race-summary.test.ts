import { describe, expect, it } from 'vitest';
import { buildSeasonRaceSummaries } from '@/lib/f1/mrdata';
import type { CalendarRace } from '@/lib/f1Calendar';

describe('buildSeasonRaceSummaries firstSessionMs (20.3)', () => {
  it('takes the earliest session of the weekend', () => {
    const race: CalendarRace = {
      round: '19',
      raceName: 'Mexico City Grand Prix',
      date: '2026-11-01',
      time: '20:00:00Z',
      FirstPractice: { date: '2026-10-30', time: '18:30:00Z' },
      Qualifying: { date: '2026-10-31', time: '21:00:00Z' },
    };
    const [summary] = buildSeasonRaceSummaries([race], [], () => false);
    expect(summary.firstSessionMs).toBe(Date.parse('2026-10-30T18:30:00Z'));
  });

  it('falls back to the race start, and is null without a date', () => {
    const [withRace, empty] = buildSeasonRaceSummaries(
      [{ round: '1', date: '2026-03-08', time: '04:00:00Z' }, { round: '2' }],
      [],
      () => false,
    );
    expect(withRace.firstSessionMs).toBe(Date.parse('2026-03-08T04:00:00Z'));
    expect(empty.firstSessionMs).toBeNull();
  });
});
