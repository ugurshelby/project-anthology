import { describe, expect, it, vi } from 'vitest';

// A debutant and a brand-new team that the history index does not know yet.
vi.mock('@/lib/data/f1', () => ({
  getSeasonData: async () => ({
    year: new Date().getUTCFullYear(),
    standings: [
      { position: '7', points: '41', driverName: 'Nova Rookie', constructorName: 'Newcomer GP', driverCode: 'nov', driverId: 'nova_rookie', constructorId: 'newcomer', permanentNumber: '99' },
    ],
    constructors: [{ position: '9', points: '41', constructorName: 'Newcomer GP', wins: '0', constructorId: 'newcomer' }],
    driverStats: { 'Nova Rookie': { wins: 0, podiums: 1 } },
  }),
}));

import { getDriverView, getTeamView } from '@/lib/data/profiles';

describe('live-only fallback (not in the history index yet)', () => {
  it('still renders a driver that only exists in the live standings', async () => {
    const v = await getDriverView('nova_rookie');
    expect(v).not.toBeNull();
    expect(v!.name).toBe('Nova Rookie');
    expect(v!.season.position).toBe(7);
    expect(v!.number).toBe('99');
    expect(v!.stints).toEqual([]);
    expect(v!.years).toHaveLength(1);
  });

  it('still renders a team that only exists in the live standings', async () => {
    const v = await getTeamView('newcomer');
    expect(v).not.toBeNull();
    expect(v!.dna).toBeNull();
    expect(v!.lineup[0].name).toBe('Nova Rookie');
    expect(v!.season.points).toBe(41);
  });

  it('does not invent history for a past season', async () => {
    expect(await getDriverView('nova_rookie', 1999)).toBeNull();
    expect(await getTeamView('newcomer', 1999)).toBeNull();
  });
});
