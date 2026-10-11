import { describe, expect, it } from 'vitest';
import { getDriverStandings, getConstructorStandings, getLastRaceResult } from '@/lib/f1/mrdata';
import { buildIdentityMap, buildProvisionalResults, buildProvisionalStandings } from '@/lib/f1/provisional';
import type { OpenF1Driver, OpenF1SessionResult } from '@/lib/f1/sources/openf1';
import type { CalendarRace } from '@/lib/f1Calendar';

const VER = { driverId: 'max_verstappen', permanentNumber: '3', code: 'VER', givenName: 'Max', familyName: 'Verstappen' };
const LEC = { driverId: 'leclerc', permanentNumber: '16', code: 'LEC', givenName: 'Charles', familyName: 'Leclerc' };
const ANT = { driverId: 'antonelli', permanentNumber: '12', code: 'ANT', givenName: 'Andrea Kimi', familyName: 'Antonelli' };
const RBR = { constructorId: 'red_bull', name: 'Red Bull' };
const FER = { constructorId: 'ferrari', name: 'Ferrari' };
const MER = { constructorId: 'mercedes', name: 'Mercedes' };

const qualifying = {
  MRData: {
    RaceTable: {
      Races: [
        {
          QualifyingResults: [
            { number: '3', Driver: VER, Constructor: RBR },
            { number: '16', Driver: LEC, Constructor: FER },
            { number: '12', Driver: ANT, Constructor: MER },
          ],
        },
      ],
    },
  },
};
const prevDriverStandings = {
  MRData: {
    StandingsTable: {
      StandingsLists: [
        {
          DriverStandings: [
            { position: '1', points: '325', wins: '6', Driver: ANT, Constructors: [MER] },
            { position: '5', points: '196', wins: '3', Driver: VER, Constructors: [RBR] },
          ],
        },
      ],
    },
  },
};
const prevConstructorStandings = {
  MRData: { StandingsTable: { StandingsLists: [{ ConstructorStandings: [{ position: '1', points: '561', wins: '9', Constructor: MER }] }] } },
};

const roster: OpenF1Driver[] = [
  { driver_number: 3, broadcast_name: 'M VERSTAPPEN', full_name: 'Max VERSTAPPEN', name_acronym: 'VER', team_name: 'Red Bull Racing', team_colour: '4781D7', session_key: 1, meeting_key: 1, headshot_url: null },
  { driver_number: 99, broadcast_name: 'N NEWBIE', full_name: 'Nico NEWBIE', name_acronym: 'NEW', first_name: 'Nico', last_name: 'Newbie', team_name: 'Ferrari', team_colour: 'E80020', session_key: 1, meeting_key: 1, headshot_url: null },
];

const race: CalendarRace = {
  round: '17',
  raceName: 'Singapore Grand Prix',
  date: '2026-10-11',
  time: '12:00:00Z',
  Circuit: { circuitId: 'marina_bay', circuitName: 'Marina Bay Street Circuit' },
};

const result = (r: Partial<OpenF1SessionResult> & { driver_number: number }): OpenF1SessionResult => ({
  position: null,
  number_of_laps: 62,
  points: 0,
  dnf: false,
  dns: false,
  dsq: false,
  duration: null,
  gap_to_leader: null,
  meeting_key: 1,
  session_key: 1,
  ...r,
});

const ids = buildIdentityMap({
  entryLists: [qualifying],
  driverStandings: prevDriverStandings,
  constructorStandings: prevConstructorStandings,
});

describe('provisional results from OpenF1', () => {
  const sessionResult = [
    result({ position: 1, driver_number: 3, points: 25, duration: 6120.785, gap_to_leader: 0 }),
    result({ position: 2, driver_number: 16, points: 18, gap_to_leader: 7.335, duration: 6128.12 }),
    result({ position: 3, driver_number: 12, points: 15, number_of_laps: 61, gap_to_leader: '+1 LAP' }),
    result({ driver_number: 99, number_of_laps: 7, dnf: true }),
    result({ driver_number: 99, number_of_laps: 7, dnf: true }), // OpenF1 repeats a row sometimes
  ];
  const snapshot = buildProvisionalResults({ season: 2026, race, results: sessionResult, roster, ids });

  it('is Ergast-shaped: the existing recap reader picks the podium with Jolpica ids', () => {
    const recap = getLastRaceResult(snapshot as never);
    expect(recap?.raceName).toBe('Singapore Grand Prix');
    expect(recap?.circuitId).toBe('marina_bay');
    expect(recap?.podium.map((p) => [p.driverId, p.constructorId, p.number])).toEqual([
      ['max_verstappen', 'red_bull', '3'],
      ['leclerc', 'ferrari', '16'],
      ['antonelli', 'mercedes', '12'],
    ]);
    expect(recap?.podium[0].time).toBe('1:42:00.785');
    expect(recap?.podium[1].time).toBe('+7.335');
  });

  it('marks lapped and retired cars like Ergast and drops duplicate rows', () => {
    const rows = (snapshot as { MRData: { RaceTable: { Races: Array<{ Results: Array<Record<string, unknown>> }> } } })
      .MRData.RaceTable.Races[0].Results;
    expect(rows).toHaveLength(4);
    expect(rows[2]).toMatchObject({ position: '3', status: '+1 Lap' });
    expect(rows[3]).toMatchObject({ position: '4', positionText: 'R', status: 'Retired', laps: '7' });
  });

  it('falls back to the OpenF1 roster for a driver Jolpica has not listed, keeping a known team', () => {
    const rows = (snapshot as { MRData: { RaceTable: { Races: Array<{ Results: Array<{ Driver: { driverId: string; givenName: string }; Constructor: { constructorId: string } }> }> } } })
      .MRData.RaceTable.Races[0].Results;
    expect(rows[3].Driver).toMatchObject({ driverId: 'newbie', givenName: 'Nico' });
    expect(rows[3].Constructor.constructorId).toBe('ferrari');
  });

  it('returns null while OpenF1 has no classification yet', () => {
    expect(buildProvisionalResults({ season: 2026, race, results: [], roster, ids })).toBeNull();
  });
});

describe('provisional standings from OpenF1', () => {
  const built = buildProvisionalStandings({
    season: 2026,
    round: 17,
    drivers: [
      { driver_number: 12, position_start: 1, position_current: 1, points_start: 325, points_current: 340, meeting_key: 1, session_key: 1 },
      { driver_number: 3, position_start: 5, position_current: 4, points_start: 196, points_current: 221, meeting_key: 1, session_key: 1 },
    ],
    teams: [
      { team_name: 'Mercedes', position_start: 1, position_current: 1, points_start: 561, points_current: 578, meeting_key: 1, session_key: 1 },
      { team_name: 'Red Bull Racing', position_start: 4, position_current: 4, points_start: 306, points_current: 332, meeting_key: 1, session_key: 1 },
    ],
    roster,
    ids,
    winnerNumber: 3,
  });

  it('feeds the existing standings readers with Jolpica identities and updated wins', () => {
    const drivers = getDriverStandings(built?.drivers as never, 5);
    expect(drivers.map((d) => [d.position, d.points, d.driverId])).toEqual([
      ['1', '340', 'antonelli'],
      ['4', '221', 'max_verstappen'],
    ]);
    const raw = (built?.drivers as { MRData: { StandingsTable: { StandingsLists: Array<{ DriverStandings: Array<{ wins: string }> }> } } })
      .MRData.StandingsTable.StandingsLists[0].DriverStandings;
    expect(raw.map((r) => r.wins)).toEqual(['6', '4']);
    const teams = getConstructorStandings(built?.constructors as never, 5);
    expect(teams.map((t) => [t.constructorId, t.points, t.wins])).toEqual([
      ['mercedes', '578', '9'],
      ['red_bull', '332', '1'],
    ]);
  });

  it('records the round it reflects', () => {
    const list = (built?.drivers as { MRData: { StandingsTable: { round: string } } }).MRData.StandingsTable;
    expect(list.round).toBe('17');
  });
});

describe('team names that differ between OpenF1 and Jolpica', () => {
  it('maps OpenF1 "Racing Bulls" to Jolpica "rb" through a shared driver', () => {
    const LAW = { driverId: 'lawson', permanentNumber: '30', givenName: 'Liam', familyName: 'Lawson' };
    const RB = { constructorId: 'rb', name: 'RB F1 Team' };
    const idsWithRb = buildIdentityMap({
      entryLists: [{ MRData: { RaceTable: { Races: [{ QualifyingResults: [{ number: '30', Driver: LAW, Constructor: RB }] }] } } }],
    });
    const built = buildProvisionalStandings({
      season: 2026,
      round: 17,
      drivers: [{ driver_number: 30, position_start: 9, position_current: 9, points_start: 30, points_current: 36, meeting_key: 1, session_key: 1 }],
      teams: [{ team_name: 'Racing Bulls', position_start: 5, position_current: 5, points_start: 94, points_current: 100, meeting_key: 1, session_key: 1 }],
      roster: [{ driver_number: 30, broadcast_name: 'L LAWSON', full_name: 'Liam LAWSON', name_acronym: 'LAW', team_name: 'Racing Bulls', team_colour: '6C98FF', session_key: 1, meeting_key: 1, headshot_url: null }],
      ids: idsWithRb,
      winnerNumber: null,
    });
    expect(getConstructorStandings(built?.constructors as never, 5)[0].constructorId).toBe('rb');
  });
});
