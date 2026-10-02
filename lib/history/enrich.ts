import type { DriverStandingRow } from '@/lib/f1/mrdata';
import { driverRowFor, lastTeamOf, numberOf } from './career';
import { getConstructorRecord, getDriverRecord, resolveDriverId } from './store';

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
