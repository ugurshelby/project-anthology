import { describe, expect, it } from 'vitest';
import { circuitCounts } from '@/lib/data/circuits';
import { DRS_LAST_SEASON, seasonHasDrs } from '@/lib/f1Calendar';

describe('circuitCounts', () => {
  const card = (country: string, done: boolean) => ({ country, done });

  it('counts the whole calendar: all = upcoming + done, countries are distinct', () => {
    const cards = [
      card('USA', true),
      card('USA', true),
      card('Italy', true),
      card('Japan', false),
      card('Spain', false),
      card('Spain', false),
    ];
    expect(circuitCounts(cards)).toEqual({ all: 6, upcoming: 3, done: 3, countries: 4 });
  });

  it('ignores the placeholder country and handles an empty calendar', () => {
    expect(circuitCounts([card('—', false), card('Italy', false)]).countries).toBe(1);
    expect(circuitCounts([])).toEqual({ all: 0, upcoming: 0, done: 0, countries: 0 });
  });
});

describe('seasonHasDrs', () => {
  it('is true up to DRS_LAST_SEASON and false after it', () => {
    expect(seasonHasDrs(DRS_LAST_SEASON)).toBe(true);
    expect(seasonHasDrs(DRS_LAST_SEASON - 10)).toBe(true);
    expect(seasonHasDrs(DRS_LAST_SEASON + 1)).toBe(false);
    expect(seasonHasDrs(2026)).toBe(false);
  });
});
