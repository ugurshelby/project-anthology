import { getSeasonData, type SeasonData } from '@/lib/data/f1';
import { getDriverLore } from '@/data/drivers';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

export const PROFILE_MIN_SEASON = CURRENT_SEASON;

export function profileSeasons(): number[] {
  return [CURRENT_SEASON];
}

export interface DriverProfile {
  season: number;
  driverId: string;
  driverName: string;
  driverCode: string;
  constructorId: string;
  constructorName: string;
  position: string;
  points: string;
  wins: number;
  podiums: number;
}

export interface TeamProfile {
  season: number;
  constructorId: string;
  constructorName: string;
  position: string;
  points: string;
  wins: string;
  drivers: Array<{
    driverId: string;
    driverName: string;
    driverCode: string;
    position: string;
    points: string;
  }>;
}

function matchDriver(rows: DriverStandingRow[], driverId: string): DriverStandingRow | undefined {
  const id = driverId.toLowerCase();
  // Exact match first (e.g. "hamilton" → "hamilton" in 2026+)
  const exact = rows.find((r) => r.driverId === id);
  if (exact) return exact;
  // Ergast uses hyphenated full-name IDs (e.g. "lewis-hamilton"). Match when the
  // URL slug equals the last hyphen-segment of the stored ID, or is a full prefix.
  return rows.find((r) => {
    const parts = r.driverId.split('-');
    return parts[parts.length - 1] === id || r.driverId.endsWith('-' + id) || r.driverId.startsWith(id + '-');
  });
}

function matchConstructor(
  rows: ConstructorStandingRow[],
  constructorId: string,
): ConstructorStandingRow | undefined {
  const id = constructorId.toLowerCase();
  return rows.find((r) => r.constructorId === id);
}

/** Driver profile for one season. Returns null when the driver isn't in that season's standings. */
export async function getDriverProfile(
  driverId: string,
  season: number,
): Promise<DriverProfile | null> {
  const data = await getSeasonData(season);
  const row = matchDriver(data.standings, driverId);
  if (!row) return null;

  const stats = data.driverStats?.[row.driverName] ?? { wins: 0, podiums: 0 };
  return {
    season,
    driverId: row.driverId,
    driverName: row.driverName,
    driverCode: row.driverCode,
    constructorId: row.constructorId,
    constructorName: row.constructorName,
    position: row.position,
    points: row.points,
    wins: stats.wins,
    podiums: stats.podiums,
  };
}

/** Team profile for one season, including that season's driver lineup. */
export async function getTeamProfile(
  constructorId: string,
  season: number,
): Promise<TeamProfile | null> {
  const data = await getSeasonData(season);
  const row = matchConstructor(data.constructors, constructorId);
  if (!row) return null;

  const drivers = data.standings
    .filter((d) => d.constructorId === row.constructorId)
    .map((d) => ({
      driverId: d.driverId,
      driverName: d.driverName,
      driverCode: d.driverCode,
      position: d.position,
      points: d.points,
    }));

  return {
    season,
    constructorId: row.constructorId,
    constructorName: row.constructorName,
    position: row.position,
    points: row.points,
    wins: row.wins,
    drivers,
  };
}

/**
 * Seasons (within the profile range) in which a driver appears in the
 * standings. Bounded fan-out over the archive range. Newest first.
 */
export async function getDriverSeasons(driverId: string): Promise<number[]> {
  const id = driverId.toLowerCase();
  const years = profileSeasons();
  const checks = await Promise.all(
    years.map(async (y) => {
      const data = await getSeasonData(y);
      return matchDriver(data.standings, id) ? y : null;
    }),
  );
  return checks.filter((y): y is number => y !== null);
}

/** Seasons in which a constructor appears in the standings. Newest first. */
export async function getTeamSeasons(constructorId: string): Promise<number[]> {
  const id = constructorId.toLowerCase();
  const years = profileSeasons();
  const checks = await Promise.all(
    years.map(async (y) => {
      const data = await getSeasonData(y);
      return matchConstructor(data.constructors, id) ? y : null;
    }),
  );
  return checks.filter((y): y is number => y !== null);
}

/** Current-season driver grid (for /drivers). */
export async function getCurrentDrivers(): Promise<{ season: number; rows: DriverStandingRow[] }> {
  const data = await getSeasonData(CURRENT_SEASON);
  return { season: CURRENT_SEASON, rows: data.standings };
}

/** One driver row enriched with a permanent car number (from the lore dataset). */
export interface DriverGridRow extends DriverStandingRow {
  /** Permanent race number ("1", "44"). null when the lore dataset has none. */
  carNumber: string | null;
}

/** A constructor with its driver lineup, for the team-strip drivers layout. */
export interface TeamDriverGroup {
  constructorId: string;
  constructorName: string;
  /** Constructor championship position (string, e.g. "2"). */
  constructorPosition: string;
  /** Drivers in this team, ordered by their driver-standings position. */
  drivers: DriverGridRow[];
}

/** Resolve a driver's permanent car number from the lore dataset (no new API call). */
function carNumberFor(row: DriverStandingRow): string | null {
  const lore = getDriverLore(row.driverId);
  return lore?.number != null ? String(lore.number) : null;
}

/**
 * Current-season drivers grouped by constructor, for the /drivers team-strip
 * layout. Groups are ordered by constructor-standings position; drivers inside
 * a group keep their driver-standings order. Also returns the flat standings
 * list (already enriched with car numbers) for the mobile single-column view.
 * Derived entirely from the existing season snapshot — no new API calls.
 */
export async function getDriversByTeam(): Promise<{
  season: number;
  groups: TeamDriverGroup[];
  flat: DriverGridRow[];
}> {
  const data = await getSeasonData(CURRENT_SEASON);

  const flat: DriverGridRow[] = data.standings.map((row) => ({
    ...row,
    carNumber: carNumberFor(row),
  }));

  // Constructor order = constructor-standings position; fall back to first
  // appearance in the driver standings for any team missing from that table.
  const constructorOrder = new Map<string, number>();
  data.constructors.forEach((c, i) => {
    constructorOrder.set(c.constructorId || c.constructorName, i);
  });

  const byTeam = new Map<string, TeamDriverGroup>();
  for (const row of flat) {
    const key = row.constructorId || row.constructorName;
    let group = byTeam.get(key);
    if (!group) {
      const constructorRow = data.constructors.find(
        (c) => (c.constructorId || c.constructorName) === key,
      );
      group = {
        constructorId: row.constructorId,
        constructorName: row.constructorName,
        constructorPosition: constructorRow?.position ?? '—',
        drivers: [],
      };
      byTeam.set(key, group);
    }
    group.drivers.push(row);
  }

  const groups = [...byTeam.values()].sort((a, b) => {
    const ai = constructorOrder.get(a.constructorId || a.constructorName) ?? Number.MAX_SAFE_INTEGER;
    const bi = constructorOrder.get(b.constructorId || b.constructorName) ?? Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });

  // Drivers inside each team keep driver-standings order (flat is already sorted).
  for (const group of groups) {
    group.drivers.sort((a, b) => Number(a.position) - Number(b.position));
  }

  return { season: CURRENT_SEASON, groups, flat };
}

/** Current-season constructor grid (for /teams). */
export async function getCurrentTeams(): Promise<{
  season: number;
  rows: ConstructorStandingRow[];
  data: SeasonData;
}> {
  const data = await getSeasonData(CURRENT_SEASON);
  return { season: CURRENT_SEASON, rows: data.constructors, data };
}

// ── Career aggregate ─────────────────────────────────────────────────────────

export interface DriverCareer {
  seasons: number;
  championships: number;
  wins: number;
  podiums: number;
  points: number;
  /** Chronological list: { season, constructorId, constructorName } */
  teams: Array<{ season: number; constructorId: string; constructorName: string }>;
  /** Best finishing position across all seasons (1 = champion). */
  bestPosition: number | null;
}

export interface TeamCareer {
  seasons: number;
  championships: number;
  wins: number;
  bestPosition: number | null;
}

/**
 * Career aggregate for a driver across the full profile archive.
 * Derived entirely from existing DB snapshots — no new API calls.
 */
export async function getDriverCareer(driverId: string): Promise<DriverCareer> {
  const years = profileSeasons();
  const results = await Promise.all(
    years.map(async (y) => {
      const data = await getSeasonData(y);
      const row = matchDriver(data.standings, driverId);
      if (!row) return null;
      const stats = data.driverStats?.[row.driverName] ?? { wins: 0, podiums: 0 };
      return { season: y, row, stats };
    }),
  );

  let championships = 0;
  let wins = 0;
  let podiums = 0;
  let points = 0;
  let bestPosition: number | null = null;
  const teams: DriverCareer['teams'] = [];

  for (const entry of results) {
    if (!entry) continue;
    const { season, row, stats } = entry;
    const pos = Number(row.position);

    if (pos === 1) championships++;
    wins += stats.wins;
    podiums += stats.podiums;
    points += Number(row.points) || 0;

    if (Number.isFinite(pos) && (bestPosition === null || pos < bestPosition)) {
      bestPosition = pos;
    }

    if (row.constructorId) {
      teams.push({ season, constructorId: row.constructorId, constructorName: row.constructorName });
    }
  }

  return {
    seasons: results.filter(Boolean).length,
    championships,
    wins,
    podiums,
    points: Math.round(points),
    teams: teams.sort((a, b) => a.season - b.season),
    bestPosition,
  };
}

/**
 * Career aggregate for a constructor across the full profile archive.
 * Derived entirely from existing DB snapshots — no new API calls.
 */
export async function getTeamCareer(constructorId: string): Promise<TeamCareer> {
  const years = profileSeasons();
  const results = await Promise.all(
    years.map(async (y) => {
      const data = await getSeasonData(y);
      const row = matchConstructor(data.constructors, constructorId);
      if (!row) return null;
      return { season: y, row };
    }),
  );

  let championships = 0;
  let wins = 0;
  let bestPosition: number | null = null;

  for (const entry of results) {
    if (!entry) continue;
    const { row } = entry;
    const pos = Number(row.position);

    if (pos === 1) championships++;
    wins += Number(row.wins) || 0;

    if (Number.isFinite(pos) && (bestPosition === null || pos < bestPosition)) {
      bestPosition = pos;
    }
  }

  return {
    seasons: results.filter(Boolean).length,
    championships,
    wins,
    bestPosition,
  };
}
