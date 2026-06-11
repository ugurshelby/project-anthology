import { describe, expect, it } from 'vitest';
import {
  getQualifyingRows,
  getRaceResultRows,
  getRoundRaceInfo,
  getSprintResultRows,
} from '@/lib/f1/mrdata';
import type { MrData } from '@/lib/data/f1';

const driver = (given: string, family: string, code: string) => ({
  givenName: given,
  familyName: family,
  code,
});

const resultsSnapshot: MrData = {
  MRData: {
    RaceTable: {
      Races: [
        {
          raceName: 'Spanish Grand Prix',
          date: '2026-06-07',
          Circuit: {
            circuitId: 'catalunya',
            circuitName: 'Circuit de Barcelona-Catalunya',
            Location: { locality: 'Montmeló', country: 'Spain' },
          },
          Results: [
            {
              position: '1',
              grid: '2',
              laps: '66',
              points: '25',
              status: 'Finished',
              Time: { time: '1:32:01.234' },
              FastestLap: { rank: '1', Time: { time: '1:18.500' } },
              Driver: driver('Max', 'Verstappen', 'VER'),
              Constructor: { name: 'Red Bull' },
            },
            {
              position: '2',
              grid: '1',
              laps: '66',
              points: '18',
              status: 'Finished',
              Time: { time: '+4.500' },
              Driver: driver('Lando', 'Norris', 'NOR'),
              Constructor: { name: 'McLaren' },
            },
            {
              position: '18',
              grid: '15',
              laps: '40',
              points: '0',
              status: 'Collision',
              Driver: driver('Test', 'Driver', 'TST'),
              Constructor: { name: 'Sauber' },
            },
          ],
        },
      ],
    },
  },
} as unknown as MrData;

describe('getRaceResultRows', () => {
  it('maps the full classification with time-or-status and fastest lap', () => {
    const rows = getRaceResultRows(resultsSnapshot);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      position: '1',
      driverName: 'Max Verstappen',
      driverCode: 'ver',
      constructorName: 'Red Bull',
      grid: '2',
      laps: '66',
      timeOrStatus: '1:32:01.234',
      points: '25',
      fastestLap: true,
    });
    expect(rows[1].fastestLap).toBe(false);
    // No Time block → status string shows instead.
    expect(rows[2].timeOrStatus).toBe('Collision');
  });

  it('returns [] for null or shapeless data', () => {
    expect(getRaceResultRows(null)).toEqual([]);
    expect(getRaceResultRows({} as MrData)).toEqual([]);
  });
});

describe('getSprintResultRows', () => {
  it('reads SprintResults (not Results)', () => {
    const sprint = {
      MRData: {
        RaceTable: {
          Races: [
            {
              raceName: 'Sprint GP',
              SprintResults: [
                {
                  position: '1',
                  laps: '24',
                  points: '8',
                  Time: { time: '30:12.000' },
                  Driver: driver('Oscar', 'Piastri', 'PIA'),
                  Constructor: { name: 'McLaren' },
                },
              ],
            },
          ],
        },
      },
    } as unknown as MrData;

    const rows = getSprintResultRows(sprint);
    expect(rows).toHaveLength(1);
    expect(rows[0].driverName).toBe('Oscar Piastri');
    expect(getSprintResultRows(resultsSnapshot)).toEqual([]);
  });
});

describe('getQualifyingRows', () => {
  it('maps Q1/Q2/Q3 with null for missed segments', () => {
    const quali = {
      MRData: {
        RaceTable: {
          Races: [
            {
              raceName: 'Quali GP',
              QualifyingResults: [
                {
                  position: '1',
                  Q1: '1:19.1',
                  Q2: '1:18.6',
                  Q3: '1:18.0',
                  Driver: driver('Max', 'Verstappen', 'VER'),
                  Constructor: { name: 'Red Bull' },
                },
                {
                  position: '16',
                  Q1: '1:21.0',
                  Driver: driver('Out', 'InQ1', 'OUT'),
                  Constructor: { name: 'Haas' },
                },
              ],
            },
          ],
        },
      },
    } as unknown as MrData;

    const rows = getQualifyingRows(quali);
    expect(rows[0]).toMatchObject({ position: '1', q1: '1:19.1', q2: '1:18.6', q3: '1:18.0' });
    expect(rows[1]).toMatchObject({ position: '16', q1: '1:21.0', q2: null, q3: null });
  });
});

describe('getRoundRaceInfo', () => {
  it('extracts header fields from a round snapshot', () => {
    expect(getRoundRaceInfo(resultsSnapshot)).toEqual({
      raceName: 'Spanish Grand Prix',
      date: '2026-06-07',
      circuitId: 'catalunya',
      circuitName: 'Circuit de Barcelona-Catalunya',
      locality: 'Montmeló',
      country: 'Spain',
    });
  });

  it('returns null when there is no race', () => {
    expect(getRoundRaceInfo(null)).toBeNull();
  });
});
