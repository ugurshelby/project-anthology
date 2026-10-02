import type { ConstructorStandingRow, DriverStandingRow } from '@/lib/f1/mrdata';
import { driverRowFor, lastTeamOf, numberOf } from './career';
import { getConstructorRecord, getDriverRecord, getSeasonSummary, resolveConstructorId, resolveDriverId } from './store';

/**
 * Archive standings rows carry no team (the F1DB seed omits it). Fill the
 * team and race number from the history index so every season page can show
 * and colour the right team. Rows that already have a team are left alone.
 */
export function enrichStandingsFromHistory(year: number, rows: DriverStandingRow[]): DriverStandingRow[] {
  return rows.map((row) => {
    if (row.constructorId) return row;
    const id = resolveDriverId(row.driverId, { name: row.driverName });
    const rec = getDriverRecord(id);
    const season = rec ? driverRowFor(rec, year) : null;
    if (!rec || !season) return row;
    const teamId = lastTeamOf(season);
    const team = getConstructorRecord(teamId);
    return {
      ...row,
      constructorId: teamId,
      constructorName: team?.n ?? row.constructorName,
      permanentNumber: row.permanentNumber ?? numberOf(season),
    };
  });
}

/**
 * The archive constructor table carries no win counts (all "0"). For final
 * seasons take wins from the history index so no team shows a false zero.
 */
export function enrichConstructorsFromHistory(year: number, rows: ConstructorStandingRow[]): ConstructorStandingRow[] {
  if (!getSeasonSummary(year)?.final) return rows;
  return rows.map((row) => {
    const id = resolveConstructorId(row.constructorId || row.constructorName, year);
    const rec = getConstructorRecord(id);
    const season = rec?.s.find((r) => r.y === year);
    if (!season) return row;
    return { ...row, wins: String(season.w) };
  });
}

/** Engine suppliers a team used in a season, from the history index (null when unknown). */
export function enginesFor(constructorRef: string, year: number): string | null {
  const id = resolveConstructorId(constructorRef, year);
  const season = getConstructorRecord(id)?.s.find((r) => r.y === year);
  return season && season.en.length > 0 ? season.en.join(' / ') : null;
}
