import type { MrData } from '@/lib/data/f1';
import type { CalendarRace } from '@/lib/f1Calendar';

export function getRacesFromCalendar(data: MrData | null): CalendarRace[] {
  const races = (data?.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable
    ?.Races;
  return Array.isArray(races) ? races : [];
}

export interface DriverStandingRow {
  position: string;
  points: string;
  driverName: string;
  constructorName: string;
  driverCode: string;
  /** Jolpica/Ergast stable driverId (e.g. 'max_verstappen') — profile URL slug. */
  driverId: string;
  /** Jolpica/Ergast stable constructorId (e.g. 'red_bull'). */
  constructorId: string;
}

export function getDriverStandings(data: MrData | null, limit = 22): DriverStandingRow[] {
  const list = (
    data?.MRData as {
      StandingsTable?: {
        StandingsLists?: Array<{
          DriverStandings?: Array<{
            position?: string;
            points?: string;
            Driver?: { driverId?: string; givenName?: string; familyName?: string; code?: string };
            Constructors?: Array<{ constructorId?: string; name?: string }>;
          }>;
        }>;
      };
    }
  )?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

  if (!Array.isArray(list)) return [];

  return list.slice(0, limit).map((row) => {
    const given = row.Driver?.givenName ?? '';
    const family = row.Driver?.familyName ?? '';
    return {
      position: row.position ?? '—',
      points: row.points ?? '0',
      driverName: `${given} ${family}`.trim() || '—',
      driverCode: (row.Driver?.code ?? '').toLowerCase(),
      driverId: (row.Driver?.driverId ?? '').toLowerCase(),
      constructorName: row.Constructors?.[0]?.name ?? '—',
      constructorId: (row.Constructors?.[0]?.constructorId ?? '').toLowerCase(),
    };
  });
}

export interface ConstructorStandingRow {
  position: string;
  points: string;
  constructorName: string;
  wins: string;
  /** Jolpica/Ergast stable constructorId (e.g. 'red_bull') — profile URL slug. */
  constructorId: string;
}

export function getConstructorStandings(
  data: MrData | null,
  limit = 12,
): ConstructorStandingRow[] {
  const list = (
    data?.MRData as {
      StandingsTable?: {
        StandingsLists?: Array<{
          ConstructorStandings?: Array<{
            position?: string;
            points?: string;
            wins?: string;
            Constructor?: { constructorId?: string; name?: string };
          }>;
        }>;
      };
    }
  )?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;

  if (!Array.isArray(list)) return [];

  return list.slice(0, limit).map((row) => ({
    position: row.position ?? '—',
    points: row.points ?? '0',
    wins: row.wins ?? '0',
    constructorName: row.Constructor?.name ?? '—',
    constructorId: (row.Constructor?.constructorId ?? '').toLowerCase(),
  }));
}

export interface RacePodiumDriver {
  position: string;
  driverName: string;
  driverCode: string;
  constructorName: string;
}

export interface LastRaceRecap {
  raceName: string;
  round: string;
  podium: RacePodiumDriver[];
  fastestLapDriver: string | null;
  fastestLapTime: string | null;
}

function firstRace(data: MrData | null): Record<string, unknown> | null {
  const races = (data?.MRData as { RaceTable?: { Races?: Array<Record<string, unknown>> } })
    ?.RaceTable?.Races;
  return Array.isArray(races) && races.length > 0 ? races[0] : null;
}

/** Build a podium + fastest-lap recap from a round `results` snapshot. */
export function getLastRaceResult(data: MrData | null): LastRaceRecap | null {
  const race = firstRace(data);
  if (!race) return null;

  const results = (race.Results as
    | Array<{
        position?: string;
        Driver?: { givenName?: string; familyName?: string; code?: string };
        Constructor?: { name?: string };
        FastestLap?: { rank?: string; Time?: { time?: string } };
      }>
    | undefined) ?? [];

  if (results.length === 0) return null;

  const podium: RacePodiumDriver[] = results.slice(0, 3).map((r) => {
    const given = r.Driver?.givenName ?? '';
    const family = r.Driver?.familyName ?? '';
    return {
      position: r.position ?? '—',
      driverName: `${given} ${family}`.trim() || '—',
      driverCode: (r.Driver?.code ?? '').toLowerCase(),
      constructorName: r.Constructor?.name ?? '—',
    };
  });

  const flEntry = results.find((r) => r.FastestLap?.rank === '1');
  const fastestLapDriver = flEntry
    ? `${flEntry.Driver?.givenName ?? ''} ${flEntry.Driver?.familyName ?? ''}`.trim() || null
    : null;

  return {
    raceName: (race.raceName as string) ?? 'Grand Prix',
    round: (race.round as string) ?? '—',
    podium,
    fastestLapDriver,
    fastestLapTime: flEntry?.FastestLap?.Time?.time ?? null,
  };
}

export interface PoleInfo {
  driverName: string;
  driverCode: string;
  time: string | null;
}

/** Extract pole position (P1 qualifying) from a round `qualifying` snapshot. */
export function getQualifyingPole(data: MrData | null): PoleInfo | null {
  const race = firstRace(data);
  if (!race) return null;
  const q = (race.QualifyingResults as
    | Array<{ position?: string; Q3?: string; Q2?: string; Q1?: string; Driver?: { givenName?: string; familyName?: string; code?: string } }>
    | undefined) ?? [];
  const pole = q.find((r) => r.position === '1') ?? q[0];
  if (!pole) return null;
  const name = `${pole.Driver?.givenName ?? ''} ${pole.Driver?.familyName ?? ''}`.trim();
  return {
    driverName: name || '—',
    driverCode: (pole.Driver?.code ?? '').toLowerCase(),
    time: pole.Q3 ?? pole.Q2 ?? pole.Q1 ?? null,
  };
}

export interface CountdownParts {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  expired: boolean;
}

export function getCountdownParts(targetMs: number, nowMs: number): CountdownParts {
  const diff = targetMs - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  }
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((diff % (60 * 1000)) / 1000);
  return { days, hours, mins, secs, expired: false };
}

export function formatRaceCountdown(targetMs: number, nowMs: number): string {
  const { days, hours, mins, expired } = getCountdownParts(targetMs, nowMs);
  if (expired) return 'Race underway or finished';
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Current epoch ms. Lives here (a plain lib module, not a component) so callers
 * can read the request-time clock without the react-hooks/purity rule flagging
 * a bare `Date.now()` inside an RSC body.
 */
export function nowMs(): number {
  return Date.now();
}

export function raceStartMs(race: CalendarRace): number {
  const d = race.date;
  if (!d) return NaN;
  const iso = race.time ? `${d}T${race.time}` : `${d}T12:00:00Z`;
  return new Date(iso).getTime();
}

export function findRaceByCircuitId(
  races: CalendarRace[],
  circuitId: string,
): CalendarRace | null {
  const id = circuitId.trim().toLowerCase();
  return races.find((r) => (r.Circuit?.circuitId ?? '').toLowerCase() === id) ?? null;
}

/**
 * The race immediately after the given round (by round number). Used by the
 * homepage hero's "race after next" panel. Returns null when there is no
 * later round on the calendar (e.g. `next` is the season finale).
 */
export function getRaceAfter(
  races: CalendarRace[],
  round: number | string | null | undefined,
): CalendarRace | null {
  const r = Number(round);
  if (!Number.isFinite(r)) return null;
  return (
    races
      .filter((race) => Number(race.round) > r)
      .sort((a, b) => Number(a.round ?? 0) - Number(b.round ?? 0))[0] ?? null
  );
}

export interface RaceWinner {
  driverName: string;
  constructorName: string;
  laps: string | null;
}

/** Extract P1 winner from a round `results` snapshot. */
export function getRaceWinner(data: MrData | null): RaceWinner | null {
  const race = firstRace(data);
  if (!race) return null;

  const results = (race.Results as
    | Array<{
        position?: string;
        laps?: string;
        Driver?: { givenName?: string; familyName?: string };
        Constructor?: { name?: string };
      }>
    | undefined) ?? [];

  const winner = results.find((r) => r.position === '1') ?? results[0];
  if (!winner) return null;

  const given = winner.Driver?.givenName ?? '';
  const family = winner.Driver?.familyName ?? '';
  return {
    driverName: `${given} ${family}`.trim() || '—',
    constructorName: winner.Constructor?.name ?? '—',
    laps: winner.laps ?? null,
  };
}

export interface CircuitWinnerEntry {
  season: number;
  raceName: string;
  driverName: string;
  constructorName: string;
}

export interface SeasonRecord {
  label: string;
  holderName: string;
  value: string;
  teamName?: string;
}

export type DriverSeasonRecord = SeasonRecord;
export type ConstructorSeasonRecord = SeasonRecord;

function extractRoundResults(data: MrData | null): Array<{
  position: string;
  driverName: string;
  constructorName: string;
}> {
  const race = firstRace(data);
  if (!race) return [];
  const results =
    (race.Results as
      | Array<{
          position?: string;
          Driver?: { givenName?: string; familyName?: string };
          Constructor?: { name?: string };
        }>
      | undefined) ?? [];
  return results.map((r) => ({
    position: r.position ?? '',
    driverName: `${r.Driver?.givenName ?? ''} ${r.Driver?.familyName ?? ''}`.trim(),
    constructorName: r.Constructor?.name ?? '',
  }));
}

/** Driver season records from standings + all finished-round results. */
export function getDriverSeasonRecords(
  driverStandings: DriverStandingRow[],
  allRoundResults: MrData[],
): DriverSeasonRecord[] {
  const records: DriverSeasonRecord[] = [];

  const leader = driverStandings[0];
  if (leader) {
    records.push({
      label: 'Most Points',
      holderName: leader.driverName,
      value: leader.points,
      teamName: leader.constructorName,
    });
  }

  const wins = new Map<string, { name: string; team: string; count: number }>();
  const podiums = new Map<string, { name: string; team: string; count: number }>();

  for (const snapshot of allRoundResults) {
    for (const row of extractRoundResults(snapshot)) {
      if (!row.driverName) continue;
      const pos = Number(row.position);
      if (pos === 1) {
        const cur = wins.get(row.driverName) ?? {
          name: row.driverName,
          team: row.constructorName,
          count: 0,
        };
        cur.count++;
        wins.set(row.driverName, cur);
      }
      if (pos >= 1 && pos <= 3) {
        const cur = podiums.get(row.driverName) ?? {
          name: row.driverName,
          team: row.constructorName,
          count: 0,
        };
        cur.count++;
        podiums.set(row.driverName, cur);
      }
    }
  }

  const topWinner = [...wins.values()].sort((a, b) => b.count - a.count)[0];
  if (topWinner && topWinner.count > 0) {
    records.push({
      label: 'Most Wins',
      holderName: topWinner.name,
      value: String(topWinner.count),
      teamName: topWinner.team,
    });
  }

  const topPodium = [...podiums.values()].sort((a, b) => b.count - a.count)[0];
  if (topPodium && topPodium.count > 0) {
    records.push({
      label: 'Most Podiums',
      holderName: topPodium.name,
      value: String(topPodium.count),
      teamName: topPodium.team,
    });
  }

  return records.slice(0, 3);
}

export interface DriverRoundStats {
  wins: number;
  podiums: number;
}

/** Per-driver win and podium counts from all finished-round results. */
export function getPerDriverRoundStats(
  allRoundResults: MrData[],
): Record<string, DriverRoundStats> {
  const wins = new Map<string, number>();
  const podiums = new Map<string, number>();

  for (const snapshot of allRoundResults) {
    for (const row of extractRoundResults(snapshot)) {
      if (!row.driverName) continue;
      const pos = Number(row.position);
      if (pos === 1) {
        wins.set(row.driverName, (wins.get(row.driverName) ?? 0) + 1);
      }
      if (pos >= 1 && pos <= 3) {
        podiums.set(row.driverName, (podiums.get(row.driverName) ?? 0) + 1);
      }
    }
  }

  const names = new Set([...wins.keys(), ...podiums.keys()]);
  const result: Record<string, DriverRoundStats> = {};
  for (const name of names) {
    result[name] = { wins: wins.get(name) ?? 0, podiums: podiums.get(name) ?? 0 };
  }
  return result;
}

export interface DriverCumulativePoints {
  driverName: string;
  driverCode: string;
  constructorName: string;
  /** [round, cumulative points at that round] — sorted ascending */
  data: [number, number][];
}

/**
 * Derives cumulative points per driver per round from all finished-round results.
 * Returns top-N drivers by final points, sorted desc.
 * Points per finishing position follow the standard 25-18-15-12-10-8-6-4-2-1 system.
 */
export function getDriverCumulativePoints(
  allRoundResults: MrData[],
  topN = 5,
): DriverCumulativePoints[] {
  const PTS_MAP: Record<number, number> = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
  };

  interface RoundEntry {
    round: number;
    pts: number;
    driverCode: string;
    constructorName: string;
  }

  const perDriver = new Map<string, RoundEntry[]>();

  for (const snapshot of allRoundResults) {
    const race = firstRace(snapshot);
    if (!race) continue;
    const roundNum = Number(race.round);
    if (!Number.isFinite(roundNum) || roundNum <= 0) continue;

    const results =
      (race.Results as
        | Array<{
            position?: string;
            points?: string;
            Driver?: { givenName?: string; familyName?: string; code?: string };
            Constructor?: { name?: string };
          }>
        | undefined) ?? [];

    for (const r of results) {
      const given = r.Driver?.givenName ?? '';
      const family = r.Driver?.familyName ?? '';
      const driverName = `${given} ${family}`.trim();
      if (!driverName) continue;
      const pos = Number(r.position);
      const pts = r.points ? Number(r.points) : (PTS_MAP[pos] ?? 0);
      const driverCode = (r.Driver?.code ?? '').toLowerCase();
      const constructorName = r.Constructor?.name ?? '';
      if (!perDriver.has(driverName)) perDriver.set(driverName, []);
      perDriver.get(driverName)!.push({ round: roundNum, pts, driverCode, constructorName });
    }
  }

  const series: DriverCumulativePoints[] = [];
  for (const [driverName, entries] of perDriver.entries()) {
    const sorted = entries.slice().sort((a, b) => a.round - b.round);
    let cumPts = 0;
    const data: [number, number][] = sorted.map((e) => {
      cumPts += e.pts;
      return [e.round, cumPts];
    });
    const last = sorted[sorted.length - 1];
    series.push({
      driverName,
      driverCode: last?.driverCode ?? '',
      constructorName: last?.constructorName ?? '',
      data,
    });
  }

  series.sort((a, b) => {
    const aLast = a.data[a.data.length - 1]?.[1] ?? 0;
    const bLast = b.data[b.data.length - 1]?.[1] ?? 0;
    return bLast - aLast;
  });

  return series.slice(0, topN);
}

/** Constructor season records from standings + all finished-round results. */
export function getConstructorSeasonRecords(
  constructorStandings: ConstructorStandingRow[],
  allRoundResults: MrData[],
): ConstructorSeasonRecord[] {
  const records: ConstructorSeasonRecord[] = [];

  const leader = constructorStandings[0];
  if (leader) {
    records.push({
      label: 'Most Points',
      holderName: leader.constructorName,
      value: leader.points,
    });
  }

  const oneTwoFinishes = new Map<string, number>();
  const winCounts = new Map<string, number>();

  for (const snapshot of allRoundResults) {
    const results = extractRoundResults(snapshot);
    const p1 = results.find((r) => r.position === '1');
    const p2 = results.find((r) => r.position === '2');
    if (
      p1?.constructorName &&
      p2?.constructorName &&
      p1.constructorName === p2.constructorName
    ) {
      oneTwoFinishes.set(
        p1.constructorName,
        (oneTwoFinishes.get(p1.constructorName) ?? 0) + 1,
      );
    }
    if (p1?.constructorName) {
      winCounts.set(p1.constructorName, (winCounts.get(p1.constructorName) ?? 0) + 1);
    }
  }

  const topOneTwo = [...oneTwoFinishes.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topOneTwo && topOneTwo[1] > 0) {
    records.push({
      label: 'Most 1-2 Finishes',
      holderName: topOneTwo[0],
      value: String(topOneTwo[1]),
    });
  }

  const topWins = [...winCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topWins && topWins[1] > 0) {
    records.push({
      label: 'Most Wins',
      holderName: topWins[0],
      value: String(topWins[1]),
    });
  }

  return records.slice(0, 3);
}

// ── Round detail extractors (/season/[year]/round/[n]) ───────────────────────

export interface RoundRaceInfo {
  raceName: string;
  date: string | null;
  circuitId: string | null;
  circuitName: string | null;
  locality: string | null;
  country: string | null;
}

/** Header info (race name, date, circuit) from any round-level snapshot. */
export function getRoundRaceInfo(data: MrData | null): RoundRaceInfo | null {
  const race = firstRace(data);
  if (!race) return null;
  const circuit = race.Circuit as
    | { circuitId?: string; circuitName?: string; Location?: { locality?: string; country?: string } }
    | undefined;
  return {
    raceName: (race.raceName as string) ?? 'Grand Prix',
    date: (race.date as string) ?? null,
    circuitId: circuit?.circuitId ?? null,
    circuitName: circuit?.circuitName ?? null,
    locality: circuit?.Location?.locality ?? null,
    country: circuit?.Location?.country ?? null,
  };
}

export interface RaceResultRow {
  position: string;
  driverName: string;
  driverCode: string;
  constructorName: string;
  grid: string | null;
  laps: string | null;
  /** Finishing time for the leader / gap for the rest, or the status (+1 Lap, DNF…). */
  timeOrStatus: string;
  points: string;
  fastestLap: boolean;
}

interface RawSessionResult {
  position?: string;
  grid?: string;
  laps?: string;
  points?: string;
  status?: string;
  Time?: { time?: string };
  FastestLap?: { rank?: string; Time?: { time?: string } };
  Driver?: { givenName?: string; familyName?: string; code?: string };
  Constructor?: { name?: string };
}

function toResultRow(r: RawSessionResult): RaceResultRow {
  const given = r.Driver?.givenName ?? '';
  const family = r.Driver?.familyName ?? '';
  return {
    position: r.position ?? '—',
    driverName: `${given} ${family}`.trim() || '—',
    driverCode: (r.Driver?.code ?? '').toLowerCase(),
    constructorName: r.Constructor?.name ?? '—',
    grid: r.grid ?? null,
    laps: r.laps ?? null,
    timeOrStatus: r.Time?.time ?? r.status ?? '—',
    points: r.points ?? '0',
    fastestLap: r.FastestLap?.rank === '1',
  };
}

/** Full race classification from a round `results` snapshot. */
export function getRaceResultRows(data: MrData | null): RaceResultRow[] {
  const race = firstRace(data);
  const results = (race?.Results as RawSessionResult[] | undefined) ?? [];
  return results.map(toResultRow);
}

/** Full sprint classification from a round `sprint` snapshot. */
export function getSprintResultRows(data: MrData | null): RaceResultRow[] {
  const race = firstRace(data);
  const results = (race?.SprintResults as RawSessionResult[] | undefined) ?? [];
  return results.map(toResultRow);
}

export interface SeasonRaceSummary {
  round: string;
  raceName: string;
  circuitId: string;
  country: string;
  date: string;
  done: boolean;
  winnerCode: string | null;
  winnerName: string | null;
  fastestLapDriver: string | null;
  fastestLapTime: string | null;
  podium: RacePodiumDriver[];
}

export interface SeasonHighlights {
  fastestLapKing: { driverName: string; driverCode: string; count: number } | null;
  dnfRatePercent: number;
  dnfCount: number;
  classifiedCount: number;
}

/** Per-round recap map for the season race strip and micro-summary panel. */
export function buildSeasonRaceSummaries(
  races: import('@/lib/f1Calendar').CalendarRace[],
  roundResults: Array<{ round: number; data: MrData }>,
  isDone: (race: import('@/lib/f1Calendar').CalendarRace) => boolean,
): SeasonRaceSummary[] {
  const recaps = new Map<string, LastRaceRecap>();
  for (const { round, data } of roundResults) {
    const recap = getLastRaceResult(data);
    if (recap) recaps.set(String(round), recap);
  }

  return races.map((race) => {
    const round = String(race.round ?? '');
    const recap = recaps.get(round);
    const winner = recap?.podium[0];
    return {
      round,
      raceName: race.raceName ?? 'Grand Prix',
      circuitId: race.Circuit?.circuitId ?? '',
      country: race.Circuit?.Location?.country ?? '—',
      date: race.date ?? '',
      done: isDone(race),
      winnerCode: winner?.driverCode ?? null,
      winnerName: winner?.driverName ?? null,
      fastestLapDriver: recap?.fastestLapDriver ?? null,
      fastestLapTime: recap?.fastestLapTime ?? null,
      podium: recap?.podium ?? [],
    };
  });
}

/** Fastest-lap king and DNF rate across all finished rounds. */
export function buildSeasonHighlights(allRoundResults: MrData[]): SeasonHighlights {
  const flCounts = new Map<string, { driverName: string; driverCode: string; count: number }>();
  let dnfCount = 0;
  let classifiedCount = 0;

  for (const snapshot of allRoundResults) {
    for (const row of getRaceResultRows(snapshot)) {
      classifiedCount++;
      const status = row.timeOrStatus.toUpperCase();
      if (status.includes('DNF') || status.includes('RETIRED') || status.includes('ACCIDENT')) {
        dnfCount++;
      }
      if (row.fastestLap) {
        const cur = flCounts.get(row.driverName) ?? {
          driverName: row.driverName,
          driverCode: row.driverCode,
          count: 0,
        };
        cur.count++;
        flCounts.set(row.driverName, cur);
      }
    }
  }

  const fastestLapKing =
    [...flCounts.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    fastestLapKing,
    dnfRatePercent: classifiedCount > 0 ? Math.round((dnfCount / classifiedCount) * 100) : 0,
    dnfCount,
    classifiedCount,
  };
}

export interface QualifyingRow {
  position: string;
  driverName: string;
  driverCode: string;
  constructorName: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

/** Full qualifying classification from a round `qualifying` snapshot. */
export function getQualifyingRows(data: MrData | null): QualifyingRow[] {
  const race = firstRace(data);
  const results =
    (race?.QualifyingResults as
      | Array<{
          position?: string;
          Q1?: string;
          Q2?: string;
          Q3?: string;
          Driver?: { givenName?: string; familyName?: string; code?: string };
          Constructor?: { name?: string };
        }>
      | undefined) ?? [];
  return results.map((r) => {
    const given = r.Driver?.givenName ?? '';
    const family = r.Driver?.familyName ?? '';
    return {
      position: r.position ?? '—',
      driverName: `${given} ${family}`.trim() || '—',
      driverCode: (r.Driver?.code ?? '').toLowerCase(),
      constructorName: r.Constructor?.name ?? '—',
      q1: r.Q1 ?? null,
      q2: r.Q2 ?? null,
      q3: r.Q3 ?? null,
    };
  });
}

/** Collect unique circuit IDs from a calendar race list. */
export function getCircuitIdsFromRaces(races: CalendarRace[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const race of races) {
    const id = (race.Circuit?.circuitId ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}
