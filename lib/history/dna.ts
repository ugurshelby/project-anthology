import { TEAM_DNA_NOTES, type TeamDnaNote } from '@/data/history/team-dna';
import { paletteForConstructorId, type TeamPalette } from './palette';
import { HISTORY_META, getConstructorRecord } from './store';
import type { ConstructorSeasonRow } from './types';

/** One chapter of a team's story: a name it raced under and the years it did so. */
export interface DnaStage {
  constructorId: string;
  name: string;
  fullName: string;
  from: number;
  /** null while the team still races under this name. */
  to: number | null;
  /** Entrant names used (most frequent first), e.g. "Red Bull Racing". */
  entrants: string[];
  engines: string[];
  seasons: number;
  wins: number;
  titles: number[];
  bestPosition: number | null;
  palette: TeamPalette;
}

export interface TeamDna {
  /** Id of the most recent name in the lineage. */
  headId: string;
  stages: DnaStage[];
  /** Separate earlier appearances of the same name (e.g. Mercedes 1954-55). */
  priorSpells: DnaStage[];
  firstSeason: number;
  lastSeason: number;
  seasonsEntered: number;
  /** Raced every season between first and last. */
  continuous: boolean;
  /** Has entered every championship season since 1950 (Ferrari). */
  founder: boolean;
  active: boolean;
  country: string;
  totals: { wins: number; titles: number[]; seasons: number };
  note: TeamDnaNote | null;
}

function tally(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
}

function stageFrom(
  constructorId: string,
  rows: ConstructorSeasonRow[],
  open: boolean,
): DnaStage | null {
  const rec = getConstructorRecord(constructorId);
  if (!rec || rows.length === 0) return null;
  const first = rows[0].y;
  const last = rows[rows.length - 1].y;
  const positions = rows.map((r) => r.p).filter((p): p is number => p != null);
  return {
    constructorId,
    name: rec.n,
    fullName: rec.fn,
    from: first,
    to: open ? null : last,
    entrants: tally(rows.flatMap((r) => r.e)).slice(0, 3),
    engines: tally(rows.flatMap((r) => r.en)).slice(0, 3),
    seasons: rows.length,
    wins: rows.reduce((s, r) => s + r.w, 0),
    titles: rows.filter((r) => r.ch).map((r) => r.y),
    bestPosition: positions.length ? Math.min(...positions) : null,
    palette: paletteForConstructorId(constructorId, Math.round((first + last) / 2)),
  };
}

/**
 * The full lineage of a team: every name it has raced under (F1DB
 * chronology), with the seasons, entrants, engines and results of each.
 */
export function buildTeamDna(constructorId: string): TeamDna | null {
  const rec = getConstructorRecord(constructorId);
  if (!rec) return null;

  const chain = rec.chron.length ? rec.chron : [{ id: constructorId, from: rec.s[0].y, to: null as number | null }];
  const head = chain[chain.length - 1];

  const stages: DnaStage[] = [];
  const used = new Map<string, Set<number>>();
  for (const link of chain) {
    const linkRec = getConstructorRecord(link.id);
    if (!linkRec) continue;
    const rows = linkRec.s.filter((r) => r.y >= link.from && (link.to === null || r.y <= link.to));
    const stage = stageFrom(link.id, rows, link.to === null);
    if (!stage) continue;
    stages.push(stage);
    const set = used.get(link.id) ?? new Set<number>();
    rows.forEach((r) => set.add(r.y));
    used.set(link.id, set);
  }
  if (stages.length === 0) return null;

  // rows of a lineage id that fall outside every chronology range: separate spells
  const priorSpells: DnaStage[] = [];
  for (const id of new Set(chain.map((c) => c.id))) {
    const linkRec = getConstructorRecord(id);
    if (!linkRec) continue;
    const taken = used.get(id) ?? new Set<number>();
    const leftover = linkRec.s.filter((r) => !taken.has(r.y));
    let group: ConstructorSeasonRow[] = [];
    const flush = () => {
      const s = stageFrom(id, group, false);
      if (s) priorSpells.push(s);
      group = [];
    };
    for (const r of leftover) {
      if (group.length && r.y - group[group.length - 1].y > 1) flush();
      group.push(r);
    }
    flush();
  }
  priorSpells.sort((a, b) => a.from - b.from);

  const years = new Set<number>();
  for (const id of used.keys()) getConstructorRecord(id)!.s.forEach((r) => used.get(id)!.has(r.y) && years.add(r.y));
  const sorted = [...years].sort((a, b) => a - b);
  const firstSeason = sorted[0];
  const lastSeason = sorted[sorted.length - 1];
  const continuous = sorted.length === lastSeason - firstSeason + 1;
  const active = lastSeason >= HISTORY_META.newestSeason;

  const noteKey = [head.id, ...chain.map((c) => c.id).reverse()].find((k) => TEAM_DNA_NOTES[k]);
  const headRec = getConstructorRecord(head.id);

  return {
    headId: head.id,
    stages,
    priorSpells,
    firstSeason,
    lastSeason,
    seasonsEntered: sorted.length,
    continuous,
    founder: firstSeason === 1950 && continuous && active,
    active,
    country: headRec?.cn ?? rec.cn,
    totals: {
      wins: stages.reduce((s, x) => s + x.wins, 0),
      titles: stages.flatMap((x) => x.titles).sort((a, b) => a - b),
      seasons: sorted.length,
    },
    note: noteKey ? TEAM_DNA_NOTES[noteKey] : null,
  };
}
