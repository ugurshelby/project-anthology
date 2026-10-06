import { describe, expect, it } from 'vitest';
import { getDriverCumulativePoints } from '@/lib/f1/mrdata';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { MrData } from '@/lib/data/f1';

interface Row {
  given: string;
  family: string;
  code: string;
  team: string;
  position: string;
  points?: string;
}

function weekend(round: number, key: 'Results' | 'SprintResults', rows: Row[]): MrData {
  return {
    MRData: {
      RaceTable: {
        Races: [
          {
            round: String(round),
            [key]: rows.map((r) => ({
              position: r.position,
              ...(r.points !== undefined ? { points: r.points } : {}),
              Driver: { givenName: r.given, familyName: r.family, code: r.code.toUpperCase() },
              Constructor: { name: r.team },
            })),
          },
        ],
      },
    },
  };
}

const NOR = (position: string, points?: string, team = 'McLaren'): Row => ({
  given: 'Lando', family: 'Norris', code: 'NOR', team, position, points,
});
const VER = (position: string, points?: string, team = 'Red Bull'): Row => ({
  given: 'Max', family: 'Verstappen', code: 'VER', team, position, points,
});
const LEC = (position: string, points?: string, team = 'Ferrari'): Row => ({
  given: 'Charles', family: 'Leclerc', code: 'LEC', team, position, points,
});

describe('getDriverCumulativePoints', () => {
  it('accumulates race points per round and sorts by final total', () => {
    const rounds = [
      weekend(1, 'Results', [NOR('1', '25'), VER('2', '18'), LEC('3', '15')]),
      weekend(2, 'Results', [VER('1', '25'), NOR('2', '18'), LEC('3', '15')]),
      weekend(3, 'Results', [VER('1', '25'), LEC('2', '18'), NOR('3', '15')]),
    ];
    const series = getDriverCumulativePoints(rounds, 5);

    expect(series.map((s) => s.driverCode)).toEqual(['ver', 'nor', 'lec']);
    expect(series[0].data).toEqual([[1, 18], [2, 43], [3, 68]]);
    expect(series[1].data).toEqual([[1, 25], [2, 43], [3, 58]]);
  });

  it('honours topN', () => {
    const rounds = [weekend(1, 'Results', [NOR('1', '25'), VER('2', '18'), LEC('3', '15')])];
    expect(getDriverCumulativePoints(rounds, 2)).toHaveLength(2);
  });

  it('adds sprint points to the weekend they were scored in', () => {
    const races = [
      weekend(1, 'Results', [NOR('1', '25'), VER('2', '18')]),
      weekend(2, 'Results', [VER('1', '25'), NOR('2', '18')]),
    ];
    const sprints = [weekend(2, 'SprintResults', [NOR('1', '8'), VER('2', '7')])];

    const withSprint = getDriverCumulativePoints(races, 5, { sprintResults: sprints });
    const nor = withSprint.find((s) => s.driverCode === 'nor')!;
    const ver = withSprint.find((s) => s.driverCode === 'ver')!;
    expect(nor.data).toEqual([[1, 25], [2, 51]]); // 25 + (18 + 8)
    expect(ver.data).toEqual([[1, 18], [2, 50]]); // 18 + (25 + 7)

    const without = getDriverCumulativePoints(races, 5);
    expect(without.find((s) => s.driverCode === 'nor')!.data).toEqual([[1, 25], [2, 43]]);
  });

  it('ignores a sprint whose race has no result yet (no phantom round)', () => {
    const races = [weekend(1, 'Results', [NOR('1', '25')])];
    const sprints = [weekend(2, 'SprintResults', [NOR('1', '8')])];
    const [nor] = getDriverCumulativePoints(races, 5, { sprintResults: sprints });
    expect(nor.data).toEqual([[1, 25]]);
  });

  it('carries the total forward through rounds a driver missed, starting at 0', () => {
    const rounds = [
      weekend(1, 'Results', [NOR('1', '25')]),
      weekend(2, 'Results', [NOR('1', '25'), LEC('2', '18')]),
      weekend(3, 'Results', [NOR('1', '25')]),
    ];
    const series = getDriverCumulativePoints(rounds, 5);
    const lec = series.find((s) => s.driverCode === 'lec')!;
    expect(lec.data).toEqual([[1, 0], [2, 18], [3, 18]]);
    // every series spans the same rounds
    expect(new Set(series.map((s) => s.data.map(([r]) => r).join(',')))).toEqual(new Set(['1,2,3']));
  });

  it('falls back to the standard points table only when the row has no points', () => {
    const rounds = [weekend(1, 'Results', [NOR('1'), VER('2'), LEC('11')])];
    const series = getDriverCumulativePoints(rounds, 5);
    expect(series.find((s) => s.driverCode === 'nor')!.data).toEqual([[1, 25]]);
    expect(series.find((s) => s.driverCode === 'ver')!.data).toEqual([[1, 18]]);
    expect(series.find((s) => s.driverCode === 'lec')!.data).toEqual([[1, 0]]);
  });

  it('labels the driver with the team of their most recent round, regardless of snapshot order', () => {
    const rounds = [
      weekend(2, 'Results', [NOR('1', '25', 'Ferrari')]),
      weekend(1, 'Results', [NOR('1', '25', 'McLaren')]),
    ];
    const [nor] = getDriverCumulativePoints(rounds, 5);
    expect(nor.constructorName).toBe('Ferrari');
    expect(nor.data).toEqual([[1, 25], [2, 50]]);
  });

  it('resolves the team colour server-side for the requested season', () => {
    const rounds = [weekend(1, 'Results', [LEC('1', '25')])];
    const [lec] = getDriverCumulativePoints(rounds, 5, { season: 2008 });
    expect(lec.color).toMatch(/^#[0-9a-f]{3,8}$/i);
    expect(lec.color).toBe(resolveTeamUiColor(undefined, 'Ferrari', 2008));
  });

  it('returns an empty list for no snapshots', () => {
    expect(getDriverCumulativePoints([], 5)).toEqual([]);
  });
});
