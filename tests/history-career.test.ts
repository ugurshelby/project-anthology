import { describe, expect, it } from 'vitest';
import { driverStints, driverTotalsAsOf, numberOf } from '@/lib/history/career';
import { buildTeamDna } from '@/lib/history/dna';
import { lineupFor } from '@/lib/history/lineup';
import { getDriverRecord } from '@/lib/history/store';

const hamilton = getDriverRecord('lewis-hamilton')!;

describe('driver career as of a season', () => {
  it('counts Hamilton through 2020 with seven titles and 95 wins', () => {
    const t = driverTotalsAsOf(hamilton, 2020);
    expect(t.titles).toBe(7);
    expect(t.titleYears[0]).toBe(2008);
    expect(t.wins).toBe(95);
    expect(t.seasons).toBe(14);
  });

  it('is cumulative and monotonic', () => {
    let prev = 0;
    for (let y = 2007; y <= 2026; y += 1) {
      const wins = driverTotalsAsOf(hamilton, y).wins;
      expect(wins).toBeGreaterThanOrEqual(prev);
      prev = wins;
    }
    expect(driverTotalsAsOf(hamilton, 2006).seasons).toBe(0);
  });

  it('builds a team timeline: McLaren, Mercedes, Ferrari', () => {
    const stints = driverStints(hamilton);
    expect(stints.map((s) => s.constructorId)).toEqual(['mclaren', 'mercedes', 'ferrari']);
    expect(stints[0].from).toBe(2007);
  });

  it('reads the race number per season', () => {
    const row = hamilton.s.find((r) => r.y === 2020)!;
    expect(numberOf(row)).toBe('44');
  });
});

describe('team DNA', () => {
  it('traces Red Bull back to Stewart through Jaguar', () => {
    const dna = buildTeamDna('red-bull')!;
    expect(dna.stages.map((s) => s.constructorId)).toEqual(['stewart', 'jaguar', 'red-bull']);
    expect(dna.firstSeason).toBe(1997);
    expect(dna.active).toBe(true);
    expect(dna.note).not.toBeNull();
    expect(dna.totals.titles.length).toBeGreaterThan(0);
  });

  it('marks Ferrari as the founding team that never missed a season', () => {
    const dna = buildTeamDna('ferrari')!;
    expect(dna.founder).toBe(true);
    expect(dna.continuous).toBe(true);
    expect(dna.firstSeason).toBe(1950);
  });

  it('keeps separate earlier spells apart (Mercedes 1954-55)', () => {
    const dna = buildTeamDna('mercedes')!;
    expect(dna.priorSpells.some((s) => s.from === 1954 && s.to === 1955)).toBe(true);
    expect(dna.stages[dna.stages.length - 1].constructorId).toBe('mercedes');
    expect(dna.founder).toBe(false);
  });

  it('follows a name that returns later (Renault inside the Alpine lineage)', () => {
    const dna = buildTeamDna('alpine')!;
    const renaults = dna.stages.filter((s) => s.constructorId === 'renault');
    expect(renaults).toHaveLength(2);
    expect(dna.stages[0].constructorId).toBe('toleman');
  });

  it('returns null for unknown teams', () => {
    expect(buildTeamDna('does-not-exist')).toBeNull();
  });
});

describe('lineups', () => {
  it('lists the 2020 Mercedes drivers', () => {
    const ids = lineupFor('mercedes', 2020).map((l) => l.driverId);
    expect(ids).toContain('lewis-hamilton');
    expect(ids).toContain('valtteri-bottas');
  });

  it('returns an empty list instead of failing for a team that did not race', () => {
    expect(lineupFor('ferrari', 1900)).toEqual([]);
  });
});
