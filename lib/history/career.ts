import type { DriverRecord, DriverSeasonRow } from './types';

/** Career totals through a given season (inclusive). */
export interface Totals {
  seasons: number;
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  points: number;
  titles: number;
  titleYears: number[];
  bestPosition: number | null;
}

export function emptyTotals(): Totals {
  return { seasons: 0, starts: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, points: 0, titles: 0, titleYears: [], bestPosition: null };
}

/** Sum of a driver's season rows with year <= `year`. */
export function driverTotalsAsOf(record: DriverRecord, year: number): Totals {
  const out = emptyTotals();
  for (const r of record.s) {
    if (r.y > year) break;
    out.seasons += 1;
    out.starts += r.st;
    out.wins += r.w;
    out.podiums += r.pd;
    out.poles += r.pl;
    out.fastestLaps += r.fl;
    out.points += r.pts;
    if (r.ch) {
      out.titles += 1;
      out.titleYears.push(r.y);
    }
    if (r.p != null && (out.bestPosition == null || r.p < out.bestPosition)) out.bestPosition = r.p;
  }
  return out;
}

export function driverRowFor(record: DriverRecord, year: number): DriverSeasonRow | null {
  return record.s.find((r) => r.y === year) ?? null;
}

/** The team a driver finished the season with (last one listed). */
export function lastTeamOf(row: DriverSeasonRow): string {
  return row.t[row.t.length - 1];
}

/** Race number to show for a season row: the one on the car at the end of the year. */
export function numberOf(row: DriverSeasonRow): string | null {
  for (let i = row.n.length - 1; i >= 0; i -= 1) if (row.n[i]) return row.n[i];
  return null;
}

export interface Stint {
  constructorId: string;
  from: number;
  to: number;
  /** Seasons in this stint (years in which the driver raced for the team). */
  years: number[];
}

/** Consecutive-season runs with the same team, oldest first. Mid-season switches split into separate stints. */
export function driverStints(record: DriverRecord): Stint[] {
  const stints: Stint[] = [];
  for (const row of record.s) {
    for (const id of row.t) {
      const last = stints[stints.length - 1];
      if (last && last.constructorId === id && row.y - last.to <= 1) {
        last.to = row.y;
        if (!last.years.includes(row.y)) last.years.push(row.y);
      } else {
        stints.push({ constructorId: id, from: row.y, to: row.y, years: [row.y] });
      }
    }
  }
  return stints;
}
