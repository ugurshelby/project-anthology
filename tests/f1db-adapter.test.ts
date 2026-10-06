/**
 * F1DB → Ergast adapter: race/circuit names must resolve through the
 * normalized `grandsPrix` / `circuits` / `countries` tables. Regression for the
 * seed that read non-existent `race.name` / `race.circuit.*` fields and wrote
 * blank raceName / circuitName / locality / country for every historical season
 * (measured on the live API: 22/22, 24/24, 24/24 blank for 2022/2024/2025).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearF1DbCache,
  ergastTime,
  getF1DbLookups,
  toMRDataCalendar,
  toMRDataQualifying,
  toMRDataResults,
  toMRDataSprint,
  type F1DbData,
  type F1DbRace,
} from '@/lib/f1/sources/f1db';

const DB: F1DbData = {
  grandsPrix: [
    { id: 'australia', name: 'Australia', fullName: 'Australian Grand Prix' },
    { id: 'china', name: 'China', fullName: 'Chinese Grand Prix' },
  ],
  circuits: [
    { id: 'melbourne', name: 'Albert Park Circuit', placeName: 'Melbourne', countryId: 'australia' },
    { id: 'shanghai', name: 'Shanghai International Circuit', placeName: 'Shanghai', countryId: 'china' },
  ],
  countries: [
    { id: 'australia', name: 'Australia' },
    { id: 'china', name: 'China' },
  ],
  drivers: [{ id: 'lando-norris', firstName: 'Lando', lastName: 'Norris', abbreviation: 'NOR' }],
  constructors: [{ id: 'mclaren', name: 'McLaren' }],
};

const RACES: F1DbRace[] = [
  {
    year: 2025,
    round: 1,
    grandPrixId: 'australia',
    circuitId: 'melbourne',
    date: '2025-03-16',
    time: '04:00',
    qualifyingDate: '2025-03-15',
    qualifyingTime: '05:00',
    raceResults: [{ driverId: 'lando-norris', constructorId: 'mclaren', positionNumber: 1, points: 25, gridPositionNumber: 1 }],
    qualifyingResults: [{ driverId: 'lando-norris', constructorId: 'mclaren', positionNumber: 1, q1: '1:16.0' }],
  },
  {
    year: 2025,
    round: 2,
    grandPrixId: 'china',
    circuitId: 'shanghai',
    date: '2025-03-23',
    time: '07:00',
    sprintRaceDate: '2025-03-22',
    sprintRaceTime: '03:00',
    sprintRaceResults: [{ driverId: 'lando-norris', constructorId: 'mclaren', positionNumber: 1, points: 8 }],
  },
];

type Race = {
  round: string;
  raceName: string;
  time: string;
  Circuit: { circuitId: string; circuitName: string; Location: { country: string; locality: string } };
  Qualifying?: { date: string; time?: string };
  Sprint?: { date: string; time?: string };
};

function racesOf(mr: { MRData: Record<string, unknown> }): Race[] {
  return (mr.MRData as { RaceTable: { Races: Race[] } }).RaceTable.Races;
}

describe('F1DB adapter — names resolved via lookup tables', () => {
  beforeEach(() => clearF1DbCache());

  it('calendar carries race name, circuit name, locality and country', () => {
    const lk = getF1DbLookups(DB);
    const [r1, r2] = racesOf(toMRDataCalendar(2025, RACES, lk));

    expect(r1.raceName).toBe('Australian Grand Prix');
    expect(r1.Circuit).toEqual({
      circuitId: 'melbourne',
      circuitName: 'Albert Park Circuit',
      Location: { country: 'Australia', locality: 'Melbourne' },
    });
    expect(r2.raceName).toBe('Chinese Grand Prix');
    expect(r2.Circuit.Location).toEqual({ country: 'China', locality: 'Shanghai' });
  });

  it('calendar exposes Qualifying / Sprint slots only when the session exists, with Ergast times', () => {
    const lk = getF1DbLookups(DB);
    const [r1, r2] = racesOf(toMRDataCalendar(2025, RACES, lk));

    expect(r1.Qualifying).toEqual({ date: '2025-03-15', time: '05:00:00Z' });
    expect(r1.Sprint).toBeUndefined();
    expect(r2.Sprint).toEqual({ date: '2025-03-22', time: '03:00:00Z' });
    expect(r2.Qualifying).toBeUndefined();
    // race start parses as UTC, not as the machine's local time
    expect(Date.parse(`2025-03-16T${r1.time}`)).toBe(Date.UTC(2025, 2, 16, 4, 0, 0));
  });

  it('results, qualifying and sprint snapshots carry the same resolved race name', () => {
    const lk = getF1DbLookups(DB);
    expect(racesOf(toMRDataResults(2025, 1, RACES, lk))[0]).toMatchObject({
      raceName: 'Australian Grand Prix',
      Circuit: { circuitName: 'Albert Park Circuit', Location: { locality: 'Melbourne' } },
    });
    expect(racesOf(toMRDataQualifying(2025, 1, RACES, lk))[0].raceName).toBe('Australian Grand Prix');
    expect(racesOf(toMRDataSprint(2025, 2, RACES, lk))[0].raceName).toBe('Chinese Grand Prix');
  });

  it('degrades to officialName, then to empty strings, instead of throwing on missing references', () => {
    const lk = getF1DbLookups(DB);
    const odd: F1DbRace[] = [
      { year: 2025, round: 1, grandPrixId: 'missing', officialName: '2025 Formula 1 Odd Grand Prix', circuitId: 'nowhere' },
      { year: 2025, round: 2 },
    ];
    const [a, b] = racesOf(toMRDataCalendar(2025, odd, lk));
    expect(a.raceName).toBe('2025 Formula 1 Odd Grand Prix');
    expect(a.Circuit).toEqual({ circuitId: 'nowhere', circuitName: '', Location: { country: '', locality: '' } });
    expect(b.raceName).toBe('');
  });
});

describe('ergastTime', () => {
  it('normalises HH:mm and HH:mm:ss to UTC and leaves complete values alone', () => {
    expect(ergastTime('04:00')).toBe('04:00:00Z');
    expect(ergastTime('04:00:00')).toBe('04:00:00Z');
    expect(ergastTime('04:00:00Z')).toBe('04:00:00Z');
    expect(ergastTime(undefined)).toBe('');
  });
});
