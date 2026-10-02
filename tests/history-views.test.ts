import { describe, expect, it } from 'vitest';
import { getDriverView, getTeamView } from '@/lib/data/profiles';

// Historical seasons only: these paths never touch the live snapshots.

describe('driver view', () => {
  it('shows Hamilton in 2020 on Mercedes with number 44 and seven titles in the career-to-date', async () => {
    const v = await getDriverView('lewis-hamilton', 2020);
    expect(v).not.toBeNull();
    expect(v!.year).toBe(2020);
    expect(v!.teams.map((t) => t.id)).toEqual(['mercedes']);
    expect(v!.number).toBe('44');
    expect(v!.season.champion).toBe(true);
    expect(v!.asOf.titles).toBe(7);
    expect(v!.stints.map((s) => s.id)).toEqual(['mclaren', 'mercedes', 'ferrari']);
  });

  it('changes the palette between seasons for the same driver', async () => {
    const mclaren = await getDriverView('lewis-hamilton', 2010);
    const mercedes = await getDriverView('lewis-hamilton', 2020);
    expect(mclaren!.palette.secondary).not.toBe(mercedes!.palette.secondary);
  });

  it('handles an early-era driver and keeps every field renderable', async () => {
    const v = await getDriverView('juan-manuel-fangio', 1951);
    expect(v).not.toBeNull();
    expect(v!.season.champion).toBe(true);
    expect(v!.teams[0].name).toBeTruthy();
    expect(v!.years.length).toBeGreaterThan(3);
  });

  it('falls back to a valid season when the requested one is not a season the driver raced', async () => {
    const v = await getDriverView('juan-manuel-fangio', 2020);
    expect(v).not.toBeNull();
    expect(v!.years.some((y) => y.year === v!.year)).toBe(true);
  });

  it('returns null for an unknown driver without a live lookup for a historical season', async () => {
    expect(await getDriverView('zzzz-not-a-driver', 1999)).toBeNull();
  });
});

describe('team view', () => {
  it('follows the Red Bull lineage into the Jaguar years', async () => {
    const v = await getTeamView('red-bull', 2002);
    expect(v).not.toBeNull();
    expect(v!.id).toBe('jaguar');
    expect(v!.headId).toBe('red-bull');
    expect(v!.years[0].year).toBe(1997);
    expect(v!.lineup.length).toBeGreaterThan(0);
  });

  it('shows lineage totals as of the selected season', async () => {
    const early = await getTeamView('red-bull', 2005);
    const late = await getTeamView('red-bull', 2013);
    expect(late!.asOf.titles.length).toBe(4);
    expect(early!.asOf.titles.length).toBe(0);
  });

  it('resolves Ergast style ids and display names', async () => {
    expect((await getTeamView('red_bull', 2013))?.id).toBe('red-bull');
    expect((await getTeamView('Scuderia Ferrari', 1952))?.id).toBe('ferrari');
  });

  it('returns null for an unknown team', async () => {
    expect(await getTeamView('no-such-team', 1999)).toBeNull();
  });
});
