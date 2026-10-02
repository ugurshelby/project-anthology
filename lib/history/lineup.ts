import { allDriverIds, getDriverRecord } from './store';
import type { DriverSeasonRow } from './types';

export interface LineupEntry {
  driverId: string;
  name: string;
  code: string | null;
  row: DriverSeasonRow;
  /** Race number for this team that season. */
  number: string | null;
}

let index: Map<string, LineupEntry[]> | null = null;

function build(): Map<string, LineupEntry[]> {
  const map = new Map<string, LineupEntry[]>();
  for (const id of allDriverIds()) {
    const d = getDriverRecord(id)!;
    for (const row of d.s) {
      row.t.forEach((teamId, i) => {
        const key = `${teamId}|${row.y}`;
        const list = map.get(key) ?? [];
        list.push({ driverId: id, name: d.n, code: d.code, row, number: row.n[i] ?? null });
        map.set(key, list);
      });
    }
  }
  return map;
}

/** Drivers who raced for a constructor in a season, best championship finish first. */
export function lineupFor(constructorId: string, year: number): LineupEntry[] {
  if (!index) index = build();
  const list = index.get(`${constructorId}|${year}`) ?? [];
  return [...list].sort((a, b) => {
    const pa = a.row.p ?? 999;
    const pb = b.row.p ?? 999;
    return pa !== pb ? pa - pb : b.row.pts - a.row.pts;
  });
}
