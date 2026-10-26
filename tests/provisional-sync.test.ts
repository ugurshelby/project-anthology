/**
 * sync-f1 step 6: OpenF1 provisional results + standings for the race that
 * just finished (lib/f1/provisionalSync.ts). Supabase and OpenF1 are stubbed.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenF1RestrictedError } from '@/lib/f1/sources/openf1Errors';
import type { CalendarRace } from '@/lib/f1Calendar';

const SEASON = new Date().getUTCFullYear();
const RACE_START = Date.parse(`${SEASON}-10-11T12:00:00Z`);
const HOUR = 3_600_000;

let dbRows: Array<{ round: number | null; type: string; source: string; data: unknown }> = [];
const mockUpsert = vi.fn();
const mockSessions = vi.fn();
const mockSessionsOfKind = vi.fn();
const mockResult = vi.fn();
const mockRoster = vi.fn();
const mockChampDrivers = vi.fn();
const mockChampTeams = vi.fn();

vi.mock('@/lib/supabase', () => {
  const builder: unknown = new Proxy(function () {}, {
    get: (_t, prop) => (prop === 'then' ? (resolve: (v: unknown) => void) => resolve({ data: dbRows, error: null }) : builder),
    apply: () => builder,
  });
  return { getSupabaseAdmin: () => ({ from: () => builder }) };
});

vi.mock('@/lib/f1Ingest', () => ({
  upsertF1Snapshot: (...a: unknown[]) => mockUpsert(...a),
}));

vi.mock('@/lib/f1/sources/openf1', () => ({
  fetchRaceSessionsOfYear: () => mockSessions(),
  fetchSessionsOfYear: (...a: unknown[]) => mockSessionsOfKind(...a),
  fetchSessionResult: () => mockResult(),
  fetchLiveDrivers: () => mockRoster(),
  fetchChampionshipDrivers: () => mockChampDrivers(),
  fetchChampionshipTeams: () => mockChampTeams(),
}));

const { syncProvisionalFromOpenF1, syncProvisionalSessionFromOpenF1, keepProvisionalStandings } = await import(
  '@/lib/f1/provisionalSync'
);

const race: CalendarRace = {
  round: '17',
  raceName: 'Singapore Grand Prix',
  date: `${SEASON}-10-11`,
  time: '12:00:00Z',
  Circuit: { circuitId: 'marina_bay', circuitName: 'Marina Bay Street Circuit' },
};
const races = [race];

const VER = { driverId: 'max_verstappen', permanentNumber: '3', givenName: 'Max', familyName: 'Verstappen' };
const ANT = { driverId: 'antonelli', permanentNumber: '12', givenName: 'Andrea Kimi', familyName: 'Antonelli' };
const RBR = { constructorId: 'red_bull', name: 'Red Bull' };
const MER = { constructorId: 'mercedes', name: 'Mercedes' };

const qualifyingRow = {
  round: 17,
  type: 'qualifying',
  source: 'jolpica',
  data: { MRData: { RaceTable: { Races: [{ QualifyingResults: [{ number: '3', Driver: VER, Constructor: RBR }, { number: '12', Driver: ANT, Constructor: MER }] }] } } },
};
const jolpicaStandings = (round: number) => ({
  round: null,
  type: 'standings_drivers',
  source: 'jolpica',
  data: { MRData: { StandingsTable: { round: String(round), StandingsLists: [{ DriverStandings: [{ position: '1', points: '325', wins: '6', Driver: ANT, Constructors: [MER] }] }] } } },
});

function seedOpenF1() {
  mockSessions.mockResolvedValue([
    { session_key: 11388, date_start: new Date(RACE_START).toISOString(), date_end: new Date(RACE_START + 2 * HOUR).toISOString() },
  ]);
  mockResult.mockResolvedValue([
    { position: 1, driver_number: 3, number_of_laps: 62, points: 25, dnf: false, dns: false, dsq: false, duration: 6120.785, gap_to_leader: 0 },
    { position: 2, driver_number: 12, number_of_laps: 62, points: 18, dnf: false, dns: false, dsq: false, duration: 6128.1, gap_to_leader: 7.3 },
  ]);
  mockRoster.mockResolvedValue([]);
  mockChampDrivers.mockResolvedValue([
    { driver_number: 12, position_current: 1, points_current: 343 },
    { driver_number: 3, position_current: 4, points_current: 221 },
  ]);
  mockChampTeams.mockResolvedValue([
    { team_name: 'Mercedes', position_current: 1, points_current: 579 },
    { team_name: 'Red Bull Racing', position_current: 4, points_current: 332 },
  ]);
}

const run = (nowMs: number, onStandings = vi.fn()) =>
  syncProvisionalFromOpenF1({ races, now: new Date(nowMs), stats: { upserted: 0, skipped: 0, errors: [] }, onStandings });

beforeEach(() => {
  dbRows = [qualifyingRow, jolpicaStandings(17)];
  for (const m of [mockUpsert, mockSessions, mockSessionsOfKind, mockResult, mockRoster, mockChampDrivers, mockChampTeams]) m.mockReset();
  seedOpenF1();
});

afterEach(() => vi.restoreAllMocks());

describe('OpenF1 provisional step', () => {
  it('writes results and both standings as source=openf1 once the session has ended', async () => {
    const onStandings = vi.fn();
    const out = await run(RACE_START + 2.5 * HOUR, onStandings);

    expect(out).toEqual({ status: 'written', round: 17, results: true, standings: true });
    expect(mockUpsert.mock.calls.map((c) => [c[1], c[2], c[4]])).toEqual([
      [17, 'results', 'openf1'],
      [null, 'standings_drivers', 'openf1'],
      [null, 'standings_constructors', 'openf1'],
    ]);
    const results = mockUpsert.mock.calls[0][3] as { MRData: { RaceTable: { Races: Array<{ Results: Array<{ Driver: { driverId: string } }> }> } } };
    expect(results.MRData.RaceTable.Races[0].Results[0].Driver.driverId).toBe('max_verstappen');
    // leader-change hook sees the previous Jolpica table and the new one
    expect(onStandings).toHaveBeenCalledTimes(1);
  });

  it('does nothing once Jolpica has the results (no OpenF1 call)', async () => {
    dbRows = [...dbRows, { round: 17, type: 'results', source: 'jolpica', data: {} }];
    expect((await run(RACE_START + 3 * HOUR)).status).toBe('jolpica-has-results');
    expect(mockSessions).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('waits while the race session is still running', async () => {
    expect((await run(RACE_START + 1.5 * HOUR)).status).toBe('session-running');
    expect(mockResult).not.toHaveBeenCalled();
  });

  it('waits while OpenF1 has not published the classification', async () => {
    mockResult.mockResolvedValue([]);
    expect((await run(RACE_START + 2.2 * HOUR)).status).toBe('not-published');
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('is idle once both provisional rows exist for the round', async () => {
    dbRows = [
      qualifyingRow,
      { round: 17, type: 'results', source: 'openf1', data: {} },
      { ...jolpicaStandings(17), source: 'openf1' },
    ];
    expect((await run(RACE_START + 4 * HOUR)).status).toBe('already-written');
    expect(mockSessions).not.toHaveBeenCalled();
  });

  it('reports the live-session lock instead of an error', async () => {
    mockSessions.mockRejectedValue(new OpenF1RestrictedError('sessions'));
    const stats = { upserted: 0, skipped: 0, errors: [] as string[] };
    const out = await syncProvisionalFromOpenF1({ races, now: new Date(RACE_START + 2.5 * HOUR), stats });
    expect(out.status).toBe('locked');
    expect(stats.errors).toEqual([]);
  });

  it('gives up three days after the race', async () => {
    expect((await run(RACE_START + 80 * HOUR)).status).toBe('no-race');
  });
});

describe('OpenF1 provisional Qualifying and Sprint step', () => {
  const QUALI_START = Date.parse(`${SEASON}-10-10T09:00:00Z`);
  const weekend: CalendarRace = {
    ...race,
    Qualifying: { date: `${SEASON}-10-10`, time: '09:00:00Z' },
    Sprint: { date: `${SEASON}-10-10`, time: '05:00:00Z' },
  };
  const noSprint: CalendarRace = { ...race, Qualifying: weekend.Qualifying };
  const runSession = (kind: 'qualifying' | 'sprint', nowMs: number, calendar = [weekend]) => {
    const stats = { upserted: 0, skipped: 0, errors: [] as string[] };
    return syncProvisionalSessionFromOpenF1({ kind, races: calendar, now: new Date(nowMs), stats }).then((out) => ({ out, stats }));
  };

  beforeEach(() => {
    // Entry list comes from the previous round's results, so neither kind's own row exists yet.
    dbRows = [{ ...qualifyingRow, type: 'results', round: 16 }, jolpicaStandings(17)];
    mockSessionsOfKind.mockResolvedValue([
      { session_key: 11380, date_start: new Date(QUALI_START).toISOString(), date_end: new Date(QUALI_START + HOUR).toISOString() },
    ]);
    mockResult.mockResolvedValue([
      { position: 1, driver_number: 3, number_of_laps: 18, points: 0, dnf: false, dns: false, dsq: false, duration: [86.1, 85.8, 85.2], gap_to_leader: [0, 0, 0] },
    ]);
  });

  it('writes the qualifying snapshot as source=openf1 once the session has ended', async () => {
    const { out, stats } = await runSession('qualifying', QUALI_START + 1.5 * HOUR);
    expect(out).toEqual({ status: 'written', round: 17 });
    expect(stats.upserted).toBe(1);
    expect(mockSessionsOfKind).toHaveBeenCalledWith(SEASON, 'Qualifying');
    expect(mockUpsert.mock.calls.map((c) => [c[1], c[2], c[4]])).toEqual([[17, 'qualifying', 'openf1']]);
  });

  it('writes the sprint snapshot under SprintResults', async () => {
    const start = Date.parse(`${SEASON}-10-10T05:00:00Z`);
    mockSessionsOfKind.mockResolvedValue([
      { session_key: 11379, date_start: new Date(start).toISOString(), date_end: new Date(start + 0.75 * HOUR).toISOString() },
    ]);
    const { out } = await runSession('sprint', start + 1.5 * HOUR);
    expect(out.status).toBe('written');
    expect(mockSessionsOfKind).toHaveBeenCalledWith(SEASON, 'Sprint');
    expect(mockUpsert.mock.calls[0].slice(1, 3)).toEqual([17, 'sprint']);
    expect(JSON.stringify(mockUpsert.mock.calls[0][3])).toContain('SprintResults');
  });

  it('never calls OpenF1 when Jolpica already has the session', async () => {
    dbRows = [...dbRows, { round: 17, type: 'qualifying', source: 'jolpica', data: {} }];
    const { out } = await runSession('qualifying', QUALI_START + 2 * HOUR);
    expect(out.status).toBe('jolpica-has-data');
    expect(mockSessionsOfKind).not.toHaveBeenCalled();
  });

  it('is idle once the provisional row exists', async () => {
    dbRows = [{ round: 17, type: 'qualifying', source: 'openf1', data: {} }];
    expect((await runSession('qualifying', QUALI_START + 2 * HOUR)).out.status).toBe('already-written');
    expect(mockSessionsOfKind).not.toHaveBeenCalled();
  });

  it('waits while the session is running', async () => {
    expect((await runSession('qualifying', QUALI_START + 0.5 * HOUR)).out.status).toBe('session-running');
    expect(mockResult).not.toHaveBeenCalled();
  });

  it('reports the live-session lock instead of an error', async () => {
    mockSessionsOfKind.mockRejectedValue(new OpenF1RestrictedError('sessions'));
    const { out, stats } = await runSession('qualifying', QUALI_START + 1.5 * HOUR);
    expect(out.status).toBe('locked');
    expect(stats.errors).toEqual([]);
  });

  it('is no-session when the calendar has no Sprint', async () => {
    const { out } = await runSession('sprint', QUALI_START + 1.5 * HOUR, [noSprint]);
    expect(out).toEqual({ status: 'no-session', round: null });
    expect(mockSessionsOfKind).not.toHaveBeenCalled();
  });
});

describe('keepProvisionalStandings', () => {
  const openf1Row = { source: 'openf1', data: jolpicaStandings(17).data };
  it('keeps OpenF1 standings while Jolpica lacks that round’s results', () => {
    expect(keepProvisionalStandings(openf1Row, () => false)).toBe(true);
  });
  it('lets Jolpica take over once it has the results', () => {
    expect(keepProvisionalStandings(openf1Row, (r) => r === 17)).toBe(false);
  });
  it('never blocks Jolpica standings over Jolpica standings', () => {
    expect(keepProvisionalStandings({ source: 'jolpica', data: openf1Row.data }, () => false)).toBe(false);
    expect(keepProvisionalStandings(null, () => false)).toBe(false);
  });
});
