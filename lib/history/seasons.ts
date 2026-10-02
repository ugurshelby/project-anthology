import { driverRowFor, lastTeamOf } from './career';
import { paletteForConstructorId } from './palette';
import { getConstructorRecord, getDriverRecord, getSeasonSummary } from './store';

const NEUTRAL = '#8B93A1';

export interface SeasonChampions {
  year: number;
  final: boolean;
  driver: { id: string; name: string; teamId: string | null; teamName: string | null; points: number } | null;
  constructor: { id: string; name: string; points: number } | null;
}

/** Champions of a season from the history index (null parts when the index has none). */
export function championsOf(year: number): SeasonChampions {
  const summary = getSeasonSummary(year);
  const out: SeasonChampions = { year, final: !!summary?.final, driver: null, constructor: null };
  if (!summary) return out;
  if (summary.driverChampion) {
    const rec = getDriverRecord(summary.driverChampion.id);
    const row = rec ? driverRowFor(rec, year) : null;
    const teamId = row ? lastTeamOf(row) : null;
    out.driver = {
      id: summary.driverChampion.id,
      name: rec?.n ?? summary.driverChampion.id,
      teamId,
      teamName: teamId ? (getConstructorRecord(teamId)?.n ?? null) : null,
      points: summary.driverChampion.pts,
    };
  }
  if (summary.constructorChampion) {
    const rec = getConstructorRecord(summary.constructorChampion.id);
    out.constructor = { id: summary.constructorChampion.id, name: rec?.n ?? summary.constructorChampion.id, points: summary.constructorChampion.pts };
  }
  return out;
}

/** Rail chips for the season picker: coloured by the champion team of each year. */
export function seasonRailYears(years: number[]): { year: number; ui: string; label?: string; champion?: boolean }[] {
  return years.map((year) => {
    const c = championsOf(year);
    const teamId = c.driver?.teamId ?? c.constructor?.id ?? null;
    return {
      year,
      ui: teamId ? paletteForConstructorId(teamId, year).ui : NEUTRAL,
      label: c.driver ? `${c.driver.name}${c.driver.teamName ? ` · ${c.driver.teamName}` : ''}` : undefined,
      champion: false,
    };
  });
}
