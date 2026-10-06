import { describe, expect, it } from 'vitest';
import { buildSeasonHeadToHead, type RoundSnapshot } from '@/lib/f1/headToHead';
import type { MrData } from '@/lib/data/f1';

type Entry = { id: string; team: string; position: string };

const NAMES: Record<string, [string, string, string]> = {
  norris: ['Lando', 'Norris', 'NOR'],
  piastri: ['Oscar', 'Piastri', 'PIA'],
  leclerc: ['Charles', 'Leclerc', 'LEC'],
  hamilton: ['Lewis', 'Hamilton', 'HAM'],
  sainz: ['Carlos', 'Sainz', 'SAI'],
  verstappen: ['Max', 'Verstappen', 'VER'],
};

function snapshot(round: number, key: 'Results' | 'QualifyingResults', entries: Entry[]): RoundSnapshot {
  const data: MrData = {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: String(round),
            [key]: entries.map((e) => ({
              position: e.position,
              Driver: {
                driverId: e.id,
                givenName: NAMES[e.id][0],
                familyName: NAMES[e.id][1],
                code: NAMES[e.id][2],
              },
              Constructor: { constructorId: e.team, name: e.team.toUpperCase() },
            })),
          },
        ],
      },
    },
  };
  return { round, data };
}

const q = (round: number, entries: Entry[]) => snapshot(round, 'QualifyingResults', entries);
const r = (round: number, entries: Entry[]) => snapshot(round, 'Results', entries);

describe('buildSeasonHeadToHead', () => {
  it('tallies qualifying and race wins between teammates', () => {
    const quali = [
      q(1, [{ id: 'norris', team: 'mclaren', position: '1' }, { id: 'piastri', team: 'mclaren', position: '2' }]),
      q(2, [{ id: 'norris', team: 'mclaren', position: '4' }, { id: 'piastri', team: 'mclaren', position: '3' }]),
      q(3, [{ id: 'norris', team: 'mclaren', position: '2' }, { id: 'piastri', team: 'mclaren', position: '5' }]),
    ];
    const race = [
      r(1, [{ id: 'norris', team: 'mclaren', position: '1' }, { id: 'piastri', team: 'mclaren', position: '2' }]),
      r(2, [{ id: 'piastri', team: 'mclaren', position: '1' }, { id: 'norris', team: 'mclaren', position: '2' }]),
    ];

    const h2h = buildSeasonHeadToHead(quali, race).mclaren;
    expect(h2h.drivers.map((d) => d.driverId)).toEqual(['norris', 'piastri']);
    expect(h2h.qualifying).toEqual({ compared: 3, wins: [2, 1] });
    expect(h2h.race).toEqual({ compared: 2, wins: [1, 1] });
    expect(h2h.drivers[0]).toEqual({ driverId: 'norris', driverName: 'Lando Norris', driverCode: 'nor' });
  });

  it('ranks a retirement behind a classified finisher (classification order)', () => {
    const race = [
      r(1, [
        { id: 'verstappen', team: 'red_bull', position: '3' },
        { id: 'sainz', team: 'red_bull', position: '17' }, // retired, classified last
      ]),
    ];
    const h2h = buildSeasonHeadToHead([], race).red_bull;
    // ids sort alphabetically: sainz first
    expect(h2h.drivers.map((d) => d.driverId)).toEqual(['sainz', 'verstappen']);
    expect(h2h.race).toEqual({ compared: 1, wins: [0, 1] });
    expect(h2h.qualifying).toEqual({ compared: 0, wins: [0, 0] });
  });

  it('picks the pair with the most shared sessions as the headline pair when a seat is shared', () => {
    const race = [
      r(1, [{ id: 'leclerc', team: 'ferrari', position: '1' }, { id: 'sainz', team: 'ferrari', position: '2' }]),
      r(2, [{ id: 'leclerc', team: 'ferrari', position: '1' }, { id: 'hamilton', team: 'ferrari', position: '2' }]),
      r(3, [{ id: 'leclerc', team: 'ferrari', position: '2' }, { id: 'hamilton', team: 'ferrari', position: '1' }]),
    ];
    const h2h = buildSeasonHeadToHead([], race).ferrari;
    expect(h2h.drivers.map((d) => d.driverId)).toEqual(['hamilton', 'leclerc']);
    expect(h2h.race.compared).toBe(2);
  });

  it('omits single-car teams and ignores rows without a numeric position', () => {
    const race = [
      r(1, [
        { id: 'verstappen', team: 'red_bull', position: '1' },
        { id: 'norris', team: 'mclaren', position: '2' },
        { id: 'piastri', team: 'mclaren', position: 'W' },
      ]),
    ];
    const h2h = buildSeasonHeadToHead([], race);
    expect(h2h.red_bull).toBeUndefined();
    expect(h2h.mclaren).toBeUndefined();
  });

  it('does not count an unbeaten tie as a win for either driver', () => {
    const race = [
      r(1, [{ id: 'norris', team: 'mclaren', position: '5' }, { id: 'piastri', team: 'mclaren', position: '5' }]),
    ];
    expect(buildSeasonHeadToHead([], race).mclaren.race).toEqual({ compared: 1, wins: [0, 0] });
  });

  it('returns an empty object for no snapshots', () => {
    expect(buildSeasonHeadToHead([], [])).toEqual({});
  });
});
