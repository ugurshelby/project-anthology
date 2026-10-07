/**
 * Machinery cross-link matching must be exact: the first version used substring
 * matching, so Bruno Senna's profile linked Ayrton Senna's MP4/4 and the 2012
 * `lotus_f1` team linked the 1970 Team Lotus 72.
 */

import { describe, expect, it } from 'vitest';
import { getMachineryCarsForDriver, getMachineryCarsForTeam } from '@/data/machinery/cars';

const ids = (cars: Array<{ id: string }>) => cars.map((c) => c.id).sort();

describe('getMachineryCarsForDriver', () => {
  it('matches the listed id, F1DB name-slug ids and accents', () => {
    expect(ids(getMachineryCarsForDriver('senna'))).toEqual(['mclaren-mp4-4']);
    expect(ids(getMachineryCarsForDriver('ayrton-senna'))).toEqual(['mclaren-mp4-4']);
    expect(ids(getMachineryCarsForDriver('michael-schumacher'))).toEqual(['ferrari-f2004']);
    expect(ids(getMachineryCarsForDriver('sergio-perez'))).toEqual(['redbull-rb19']);
  });

  it('finds every car a driver raced in', () => {
    expect(ids(getMachineryCarsForDriver('barrichello'))).toEqual(['brawn-bgp-001', 'ferrari-f2004']);
  });

  it('does NOT match a different driver that merely contains the id (Bruno Senna)', () => {
    expect(getMachineryCarsForDriver('bruno-senna')).toEqual([]);
    expect(getMachineryCarsForDriver('bruno_senna')).toEqual([]);
  });

  it('treats the profile name as authoritative when it is known', () => {
    expect(getMachineryCarsForDriver('senna', 'Bruno Senna')).toEqual([]);
    expect(ids(getMachineryCarsForDriver('senna', 'Ayrton Senna'))).toEqual(['mclaren-mp4-4']);
  });

  it('returns nothing for unrelated or empty ids', () => {
    expect(getMachineryCarsForDriver('norris')).toEqual([]);
    expect(getMachineryCarsForDriver('')).toEqual([]);
  });
});

describe('getMachineryCarsForTeam', () => {
  it('matches Ergast and F1DB spellings exactly', () => {
    expect(ids(getMachineryCarsForTeam('mclaren'))).toEqual(['mclaren-mp4-4']);
    expect(ids(getMachineryCarsForTeam('red_bull'))).toEqual(['redbull-rb19']);
    expect(ids(getMachineryCarsForTeam('red-bull'))).toEqual(['redbull-rb19']);
    expect(ids(getMachineryCarsForTeam('brawn'))).toEqual(['brawn-bgp-001']);
  });

  it('maps Team Lotus to the Lotus 72 but not the 2012 Lotus F1 team', () => {
    expect(ids(getMachineryCarsForTeam('team-lotus'))).toEqual(['lotus-72']);
    expect(ids(getMachineryCarsForTeam('lotus'))).toEqual(['lotus-72']);
    expect(getMachineryCarsForTeam('lotus_f1')).toEqual([]);
  });

  it('returns nothing for unrelated teams', () => {
    expect(getMachineryCarsForTeam('alpine')).toEqual([]);
    expect(getMachineryCarsForTeam('')).toEqual([]);
  });
});
