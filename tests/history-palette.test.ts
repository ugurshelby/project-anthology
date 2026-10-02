import { describe, expect, it } from 'vitest';
import { contrast, luminance } from '@/lib/history/color';
import { paletteFor, paletteForConstructorId } from '@/lib/history/palette';
import {
  allConstructorIds,
  getConstructorRecord,
  getDriverRecord,
  historyYears,
  resolveConstructorId,
  resolveDriverId,
} from '@/lib/history/store';

describe('history index', () => {
  it('covers every season from 1950 with no gaps', () => {
    const years = historyYears();
    expect(years[0]).toBe(1950);
    for (let i = 1; i < years.length; i += 1) expect(years[i]).toBe(years[i - 1] + 1);
  });

  it('keeps Hamilton on the right team and number per season', () => {
    const h = getDriverRecord('lewis-hamilton');
    expect(h).not.toBeNull();
    const row = (y: number) => h!.s.find((r) => r.y === y)!;
    expect(row(2007).t).toEqual(['mclaren']);
    expect(row(2020).t).toEqual(['mercedes']);
    expect(row(2020).n).toEqual(['44']);
    expect(row(2013).n).toEqual(['10']);
    expect(row(2020).ch).toBe(1);
    expect(h!.titles).toContain(2008);
  });

  it('gives lineage for Red Bull back to Stewart', () => {
    const rb = getConstructorRecord('red-bull');
    expect(rb!.chron.map((c) => c.id)).toEqual(['stewart', 'jaguar', 'red-bull']);
  });
});

describe('id resolution', () => {
  it('resolves Ergast and display-name team references', () => {
    expect(resolveConstructorId('red_bull', 2024)).toBe('red-bull');
    expect(resolveConstructorId('Oracle Red Bull Racing', 2026)).toBe('red-bull');
    expect(resolveConstructorId('Scuderia Ferrari', 2026)).toBe('ferrari');
    expect(resolveConstructorId('Mercedes-AMG PETRONAS F1 Team', 2020)).toBe('mercedes');
    expect(resolveConstructorId('sauber', 2025)).toBe('kick-sauber');
    expect(resolveConstructorId('sauber', 2012)).toBe('sauber');
    expect(resolveConstructorId('rb', 2024)).toBe('rb');
    expect(resolveConstructorId('rb', 2025)).toBe('racing-bulls');
    expect(resolveConstructorId('nonsense team name', 2020)).toBeNull();
  });

  it('resolves Ergast and F1DB driver references', () => {
    expect(resolveDriverId('lewis-hamilton')).toBe('lewis-hamilton');
    expect(resolveDriverId('hamilton')).toBe('lewis-hamilton');
    expect(resolveDriverId('max_verstappen')).toBe('max-verstappen');
    expect(resolveDriverId('x', { name: 'Lewis Hamilton' })).toBe('lewis-hamilton');
    expect(resolveDriverId('zzzz-not-a-driver')).toBeNull();
  });
});

describe('team palettes', () => {
  it('gives every constructor-season a palette that reads on the dark surface', () => {
    for (const id of allConstructorIds()) {
      for (const row of getConstructorRecord(id)!.s) {
        const p = paletteForConstructorId(id, row.y);
        expect(p.ui).toMatch(/^#[0-9A-F]{6}$/);
        expect(p.secondary).toMatch(/^#[0-9A-F]{6}$/);
        expect(contrast(p.ui, '#0A0A0A')).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('changes a team colour between eras', () => {
    expect(paletteFor('ferrari', 2026).secondary).not.toBe(paletteFor('ferrari', 2019).secondary);
    // the current Ferrari red is brighter than the 2018-2025 one
    expect(luminance(paletteFor('ferrari', 2026).secondary)).toBeGreaterThan(luminance(paletteFor('ferrari', 2025).secondary));
    expect(paletteFor('mclaren', 2010).secondary).not.toBe(paletteFor('mclaren', 2020).secondary);
  });

  it('never returns an unusable palette for unknown teams', () => {
    const p = paletteFor('definitely-unknown', 1999);
    expect(p.curated).toBe(false);
    expect(contrast(p.ui, '#0A0A0A')).toBeGreaterThanOrEqual(3);
  });

  it('separates sibling fallback teams of the same country', () => {
    const a = paletteForConstructorId('osella', 1985).secondary;
    const b = paletteForConstructorId('ags', 1989).secondary; // another team, different country is fine; compare two italian
    const c = paletteForConstructorId('dallara', 1990).secondary;
    expect(a === c).toBe(false);
    expect(typeof b).toBe('string');
  });
});
