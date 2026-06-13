/**
 * Driver & team profile data layer (Faz 3 — MVP, season-data only).
 *
 * All data is derived from getSeasonData() (DB-first Jolpica snapshots), so no
 * new external source or cache is introduced. Career aggregates (total wins,
 * championships) are intentionally out of scope for the MVP — see
 * docs/plans/PLAN_FAZ3_PROFILE_PAGES_2026-06-13.md.
 */

import { getSeasonData, type SeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

/** Profile season range — mirrors the season archive (2018 → current). */
export const PROFILE_MIN_SEASON = Math.max(F1_SEASON_MIN, 2018);

/** Inclusive [PROFILE_MIN_SEASON, CURRENT_SEASON], newest first. */
export function profileSeasons(): number[] {
  const out: number[] = [];
  for (let y = CURRENT_SEASON; y >= PROFILE_MIN_SEASON; y--) out.push(y);
  return out;
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
  return rows.find((r) => r.driverId === id);
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

/** Current-season constructor grid (for /teams). */
export async function getCurrentTeams(): Promise<{
  season: number;
  rows: ConstructorStandingRow[];
  data: SeasonData;
}> {
  const data = await getSeasonData(CURRENT_SEASON);
  return { season: CURRENT_SEASON, rows: data.constructors, data };
}
