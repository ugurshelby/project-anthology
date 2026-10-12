import { describe, expect, it } from 'vitest';
import { MACHINERY_CARS } from '@/data/machinery/cars';
import { getConstructorRecord, resolveConstructorId } from '@/lib/history/store';

/**
 * The machinery pages are about iconic cars, so their headline numbers must
 * match the archive. For a car that raced one season for its team, that
 * season's F1DB row is the car's record (2026-10 audit: F2004 showed 30
 * podiums, F1DB has 29). Multi-season cars (Lotus 72) are checked by hand.
 */
const SINGLE_SEASON = ['mclaren-mp4-4', 'williams-fw14b', 'ferrari-f2004', 'brawn-bgp-001', 'redbull-rb19'];

describe('machinery season numbers match F1DB', () => {
  for (const id of SINGLE_SEASON) {
    it(id, () => {
      const car = MACHINERY_CARS.find((c) => c.id === id)!;
      const teamId = resolveConstructorId(car.constructorId, car.year) ?? car.constructorId;
      const row = getConstructorRecord(teamId)?.s.find((s) => s.y === car.year);
      expect(row, `${teamId} ${car.year}`).toBeTruthy();
      expect({ wins: car.achievements.wins, poles: car.achievements.poles, podiums: car.achievements.podiums }).toEqual({
        wins: row!.w,
        poles: row!.pl,
        podiums: row!.pd,
      });
      expect(car.achievements.winRate).toBe(`${Number(((row!.w / car.achievements.races) * 100).toFixed(2))}%`);
    });
  }
});
