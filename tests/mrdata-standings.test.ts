import { describe, expect, it } from 'vitest';
import {
  buildSeasonHighlights,
  getConstructorStandings,
  getDriverStandings,
} from '@/lib/f1/mrdata';
import type { MrData } from '@/lib/data/f1';

function driverSnapshot(count: number, overrides: Record<number, { givenName: string; familyName: string }> = {}): MrData {
  return {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            DriverStandings: Array.from({ length: count }, (_, i) => ({
              position: String(i + 1),
              points: String(100 - i),
              Driver: {
                driverId: `driver_${i + 1}`,
                givenName: overrides[i]?.givenName ?? 'Given',
                familyName: overrides[i]?.familyName ?? `Family${i + 1}`,
                code: `D${i + 1}`,
              },
              Constructors: [{ constructorId: 'team', name: 'Team' }],
            })),
          },
        ],
      },
    },
  } as unknown as MrData;
}

function constructorSnapshot(count: number): MrData {
  return {
    MRData: {
      StandingsTable: {
        StandingsLists: [
          {
            ConstructorStandings: Array.from({ length: count }, (_, i) => ({
              position: String(i + 1),
              points: String(50 - i),
              wins: '0',
              Constructor: { constructorId: `team_${i + 1}`, name: `Team ${i + 1}` },
            })),
          },
        ],
      },
    },
  } as unknown as MrData;
}

function resultsSnapshot(statuses: string[]): MrData {
  return {
    MRData: {
      RaceTable: {
        Races: [
          {
            Results: statuses.map((status, i) => ({
              position: String(i + 1),
              laps: '50',
              points: '0',
              status,
              Time: status === 'Finished' ? { time: '1:30:00.000' } : undefined,
              Driver: { driverId: `d${i}`, givenName: 'A', familyName: `B${i}`, code: `D${i}` },
              Constructor: { constructorId: 'team', name: 'Team' },
            })),
          },
        ],
      },
    },
  } as unknown as MrData;
}

describe('driver and constructor standings limits', () => {
  it('returns every row when no limit is given', () => {
    expect(getDriverStandings(driverSnapshot(23))).toHaveLength(23);
    expect(getDriverStandings(driverSnapshot(30))).toHaveLength(30);
    expect(getConstructorStandings(constructorSnapshot(14))).toHaveLength(14);
  });

  it('still honours an explicit limit', () => {
    expect(getDriverStandings(driverSnapshot(23), 6)).toHaveLength(6);
    expect(getConstructorStandings(constructorSnapshot(14), 3)).toHaveLength(3);
  });

  it('exposes the Jolpica family name instead of the last word of the full name', () => {
    const rows = getDriverStandings(driverSnapshot(2, { 0: { givenName: 'Andrea', familyName: 'de Cesaris' } }));
    expect(rows[0].driverName).toBe('Andrea de Cesaris');
    expect(rows[0].familyName).toBe('de Cesaris');
  });
});

describe('buildSeasonHighlights retirements', () => {
  it('counts every non-finished, non-lapped status as a retirement over all starters', () => {
    const snapshot = resultsSnapshot([
      'Finished',
      '+1 Lap',
      '+2 Laps',
      'Lapped',
      'Engine',
      'Collision',
      'Disqualified',
    ]);
    const highlights = buildSeasonHighlights([snapshot]);
    expect(highlights.dnfCount).toBe(3);
    expect(highlights.starterCount).toBe(7);
    expect(highlights.dnfRatePercent).toBe(43);
  });

  it('is zero for an empty season', () => {
    const highlights = buildSeasonHighlights([]);
    expect(highlights).toMatchObject({ dnfCount: 0, starterCount: 0, dnfRatePercent: 0 });
  });
});
