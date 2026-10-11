/**
 * Provisional post-race snapshots from OpenF1 (free tier).
 *
 * Why: Jolpica publishes race results and standings 1–3+ hours after the flag
 * (R17 2026: none 1.5 h after the race), while OpenF1 has the official
 * classification and the championship a few minutes after F1 publishes them.
 * The owner wants results and standings "right after the race", so sync-f1
 * writes these as `source='openf1'` rows; Jolpica's own rows replace them as
 * soon as Jolpica has data (only `jolpica` rows ever count as settled).
 *
 * The output is Ergast-shaped, so every existing reader (home winner card,
 * round page, standings) works unchanged. Identities (driverId, constructorId,
 * names) come from Jolpica snapshots the site already has for the SAME weekend
 * (qualifying/sprint entry list), then the previous standings; OpenF1 names are
 * only a last resort.
 */

import type { CalendarRace } from '@/lib/f1Calendar';
import type {
  OpenF1ChampionshipDriver,
  OpenF1ChampionshipTeam,
  OpenF1Driver,
  OpenF1SessionResult,
} from '@/lib/f1/sources/openf1';

export interface ErgastDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  givenName: string;
  familyName: string;
  nationality?: string;
  dateOfBirth?: string;
  url?: string;
}

export interface ErgastConstructor {
  constructorId: string;
  name: string;
  nationality?: string;
  url?: string;
}

export interface EntryIdentity {
  driver: ErgastDriver;
  constructor: ErgastConstructor;
}

/** race number → identity, plus OpenF1-style team name → constructor. */
export interface IdentityMap {
  byNumber: Map<number, EntryIdentity>;
  constructorsByName: Map<string, ErgastConstructor>;
  /** Wins so far this season (from the previous Jolpica standings). */
  driverWins: Map<string, number>;
  constructorWins: Map<string, number>;
}

type Json = unknown;

function teamKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/f1 team|racing|team|scuderia|formula one|\bf1\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function races(snapshot: Json): Array<Record<string, unknown>> {
  return asArray<Record<string, unknown>>(
    (snapshot as { MRData?: { RaceTable?: { Races?: unknown } } } | null)?.MRData?.RaceTable?.Races,
  );
}

function standingsList(snapshot: Json): Record<string, unknown> | null {
  const lists = asArray<Record<string, unknown>>(
    (snapshot as { MRData?: { StandingsTable?: { StandingsLists?: unknown } } } | null)?.MRData?.StandingsTable
      ?.StandingsLists,
  );
  return lists[0] ?? null;
}

/**
 * Build the identity map from Jolpica snapshots, most specific first:
 * entry lists of this weekend (qualifying, sprint), then any previous race
 * results, then the previous driver/constructor standings.
 */
export function buildIdentityMap(input: {
  entryLists: Json[];
  driverStandings?: Json;
  constructorStandings?: Json;
}): IdentityMap {
  const byNumber = new Map<number, EntryIdentity>();
  const constructorsByName = new Map<string, ErgastConstructor>();
  const driverWins = new Map<string, number>();
  const constructorWins = new Map<string, number>();

  const addConstructor = (c: ErgastConstructor | undefined) => {
    if (c?.constructorId && c.name) constructorsByName.set(teamKey(c.name), c);
  };

  for (const snapshot of input.entryLists) {
    for (const race of races(snapshot)) {
      const rows = [
        ...asArray<Record<string, unknown>>(race.QualifyingResults),
        ...asArray<Record<string, unknown>>(race.SprintResults),
        ...asArray<Record<string, unknown>>(race.Results),
      ];
      for (const row of rows) {
        const num = Number(row.number);
        const driver = row.Driver as ErgastDriver | undefined;
        const constructor = row.Constructor as ErgastConstructor | undefined;
        addConstructor(constructor);
        if (!Number.isFinite(num) || !driver?.driverId || !constructor?.constructorId) continue;
        if (!byNumber.has(num)) byNumber.set(num, { driver, constructor });
      }
    }
  }

  const ds = standingsList(input.driverStandings);
  for (const row of asArray<Record<string, unknown>>(ds?.DriverStandings)) {
    const driver = row.Driver as ErgastDriver | undefined;
    const constructor = asArray<ErgastConstructor>(row.Constructors).at(-1);
    addConstructor(constructor);
    if (driver?.driverId) driverWins.set(driver.driverId, Number(row.wins) || 0);
    const num = Number(driver?.permanentNumber);
    if (driver?.driverId && constructor && Number.isFinite(num) && !byNumber.has(num)) {
      byNumber.set(num, { driver, constructor });
    }
  }

  const cs = standingsList(input.constructorStandings);
  for (const row of asArray<Record<string, unknown>>(cs?.ConstructorStandings)) {
    const constructor = row.Constructor as ErgastConstructor | undefined;
    addConstructor(constructor);
    if (constructor?.constructorId) constructorWins.set(constructor.constructorId, Number(row.wins) || 0);
  }

  return { byNumber, constructorsByName, driverWins, constructorWins };
}

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase());
}

/** Identity for a race number; falls back to OpenF1's roster when Jolpica has never seen the driver. */
export function identityFor(num: number, ids: IdentityMap, roster: Map<number, OpenF1Driver>): EntryIdentity | null {
  const known = ids.byNumber.get(num);
  if (known) return known;
  const d = roster.get(num);
  if (!d) return null;
  const given = d.first_name ? titleCase(d.first_name) : titleCase(d.full_name.split(' ')[0] ?? '');
  const family = d.last_name ? titleCase(d.last_name) : titleCase(d.full_name.split(' ').slice(1).join(' '));
  const constructor = ids.constructorsByName.get(teamKey(d.team_name)) ?? {
    constructorId: slug(d.team_name),
    name: d.team_name,
  };
  return {
    driver: { driverId: slug(family || d.full_name), permanentNumber: String(num), code: d.name_acronym, givenName: given, familyName: family },
    constructor,
  };
}

function formatRaceTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = s.toFixed(3).padStart(6, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function lapsBehind(gap: string): string | null {
  const m = /\+?\s*(\d+)\s*LAPS?/i.exec(gap);
  if (!m) return null;
  return Number(m[1]) === 1 ? '+1 Lap' : `+${m[1]} Laps`;
}

/**
 * OpenF1 session_result → Ergast `results` snapshot for one round.
 * Classified finishers keep their position; unclassified cars follow, ordered
 * by laps completed, with positionText R (retired), D (disqualified) or W (did
 * not start). Duplicate rows (OpenF1 occasionally repeats one) are dropped.
 */
export function buildProvisionalResults(input: {
  season: number;
  race: CalendarRace;
  results: OpenF1SessionResult[];
  roster: OpenF1Driver[];
  ids: IdentityMap;
}): Json | null {
  const roster = new Map(input.roster.map((d) => [d.driver_number, d]));
  const seen = new Set<number>();
  const rows = input.results.filter((r) => (seen.has(r.driver_number) ? false : (seen.add(r.driver_number), true)));
  if (rows.length === 0) return null;

  const classified = rows
    .filter((r) => typeof r.position === 'number' && !r.dsq && !r.dns)
    .sort((a, b) => (a.position as number) - (b.position as number));
  const unclassified = rows
    .filter((r) => !classified.includes(r))
    .sort((a, b) => (b.number_of_laps ?? 0) - (a.number_of_laps ?? 0));

  const winnerLaps = classified[0]?.number_of_laps ?? null;
  const Results: Array<Record<string, unknown>> = [];
  for (const [i, r] of [...classified, ...unclassified].entries()) {
    const id = identityFor(r.driver_number, input.ids, roster);
    if (!id) continue;
    const isClassified = i < classified.length;
    const gap = typeof r.gap_to_leader === 'string' ? r.gap_to_leader : null;
    const status = r.dsq
      ? 'Disqualified'
      : r.dns
        ? 'Did not start'
        : !isClassified || r.dnf
          ? 'Retired'
          : (gap && lapsBehind(gap)) ??
            (winnerLaps !== null && r.number_of_laps !== null && r.number_of_laps < winnerLaps
              ? lapsBehind(`+${winnerLaps - r.number_of_laps} LAP`)
              : null) ??
            'Finished';
    let time: { time: string } | undefined;
    if (isClassified && i === 0 && typeof r.duration === 'number') time = { time: formatRaceTime(r.duration) };
    else if (isClassified && typeof r.gap_to_leader === 'number') time = { time: `+${r.gap_to_leader.toFixed(3)}` };

    Results.push({
      number: String(r.driver_number),
      position: String(i + 1),
      positionText: isClassified ? String(i + 1) : r.dsq ? 'D' : r.dns ? 'W' : 'R',
      points: String(r.points ?? 0),
      Driver: id.driver,
      Constructor: id.constructor,
      laps: String(r.number_of_laps ?? 0),
      status,
      ...(time ? { Time: time } : {}),
    });
  }
  if (Results.length === 0) return null;

  const race = input.race;
  return {
    MRData: {
      series: 'f1',
      total: String(Results.length),
      RaceTable: {
        season: String(input.season),
        round: String(race.round),
        Races: [
          {
            season: String(input.season),
            round: String(race.round),
            raceName: race.raceName,
            Circuit: race.Circuit,
            date: race.date,
            ...(race.time ? { time: race.time } : {}),
            Results,
          },
        ],
      },
    },
  };
}

/**
 * Team name as OpenF1 writes it → Jolpica constructor, learned from the
 * roster: a driver's OpenF1 team_name maps to the constructor Jolpica lists for
 * the same race number (OpenF1 "Racing Bulls" ↔ Jolpica "RB F1 Team" share no
 * name, but they share drivers).
 */
function constructorResolver(roster: OpenF1Driver[], ids: IdentityMap): (teamName: string) => ErgastConstructor {
  const fromRoster = new Map<string, ErgastConstructor>();
  for (const d of roster) {
    const known = ids.byNumber.get(d.driver_number);
    if (known && d.team_name) fromRoster.set(teamKey(d.team_name), known.constructor);
  }
  return (teamName) =>
    fromRoster.get(teamKey(teamName)) ??
    ids.constructorsByName.get(teamKey(teamName)) ?? { constructorId: slug(teamName), name: teamName };
}

/** OpenF1 championship → Ergast `standings_drivers` / `standings_constructors` snapshots. */
export function buildProvisionalStandings(input: {
  season: number;
  round: number;
  drivers: OpenF1ChampionshipDriver[];
  teams: OpenF1ChampionshipTeam[];
  roster: OpenF1Driver[];
  ids: IdentityMap;
  /** Race number of the winner of this round (adds one win to driver and team). */
  winnerNumber: number | null;
}): { drivers: Json; constructors: Json } | null {
  const roster = new Map(input.roster.map((d) => [d.driver_number, d]));
  const resolveConstructor = constructorResolver(input.roster, input.ids);
  const winner = input.winnerNumber !== null ? identityFor(input.winnerNumber, input.ids, roster) : null;

  const driverRows = [...input.drivers]
    .filter((d) => typeof d.position_current === 'number')
    .sort((a, b) => (a.position_current as number) - (b.position_current as number))
    .map((d) => {
      const id = identityFor(d.driver_number, input.ids, roster);
      if (!id) return null;
      const wins = (input.ids.driverWins.get(id.driver.driverId) ?? 0) + (winner?.driver.driverId === id.driver.driverId ? 1 : 0);
      return {
        position: String(d.position_current),
        positionText: String(d.position_current),
        points: String(d.points_current ?? 0),
        wins: String(wins),
        Driver: id.driver,
        Constructors: [id.constructor],
      };
    })
    .filter(Boolean);

  const teamRows = [...input.teams]
    .filter((t) => typeof t.position_current === 'number')
    .sort((a, b) => (a.position_current as number) - (b.position_current as number))
    .map((t) => {
      const constructor = resolveConstructor(t.team_name);
      const wins =
        (input.ids.constructorWins.get(constructor.constructorId) ?? 0) +
        (winner?.constructor.constructorId === constructor.constructorId ? 1 : 0);
      return {
        position: String(t.position_current),
        positionText: String(t.position_current),
        points: String(t.points_current ?? 0),
        wins: String(wins),
        Constructor: constructor,
      };
    });

  if (driverRows.length === 0 || teamRows.length === 0) return null;
  const envelope = (key: 'DriverStandings' | 'ConstructorStandings', rows: unknown[]) => ({
    MRData: {
      series: 'f1',
      total: String(rows.length),
      StandingsTable: {
        season: String(input.season),
        round: String(input.round),
        StandingsLists: [{ season: String(input.season), round: String(input.round), [key]: rows }],
      },
    },
  });
  return { drivers: envelope('DriverStandings', driverRows), constructors: envelope('ConstructorStandings', teamRows) };
}
