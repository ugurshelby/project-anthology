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
}

export function getDriverStandings(data: MrData | null, limit = 22): DriverStandingRow[] {
  const list = (
    data?.MRData as {
      StandingsTable?: {
        StandingsLists?: Array<{
          DriverStandings?: Array<{
            position?: string;
            points?: string;
            Driver?: { givenName?: string; familyName?: string; code?: string };
            Constructors?: Array<{ name?: string }>;
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
      constructorName: row.Constructors?.[0]?.name ?? '—',
    };
  });
}

export interface ConstructorStandingRow {
  position: string;
  points: string;
  constructorName: string;
  wins: string;
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
            Constructor?: { name?: string };
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

export function formatRaceCountdown(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  if (!Number.isFinite(diff) || diff <= 0) return 'Race underway or finished';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
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
