/**
 * Licensed archive image for a news item without a usable publisher photo (master-plan 8.9).
 * Pure: the caller supplies the entities (current-season drivers, teams and calendar circuits,
 * from the snapshot readers), so nothing here is a fixed list.
 */

export type NewsEntityType = 'driver' | 'team' | 'circuit';

export interface NewsEntity {
  type: NewsEntityType;
  /** Media key (driverId, constructorId, circuitId). */
  key: string;
  /** Names to look for: surname and full name, team name, circuit locality and race name. */
  names: string[];
}

/** Same position in the text: a driver beats a team, a team beats a circuit. */
const TYPE_RANK: Record<NewsEntityType, number> = { driver: 0, team: 1, circuit: 2 };

/** Lower case, accents removed, so "Pérez" matches "Perez" and "İstanbul" matches "Istanbul". */
function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Index of the first whole-word occurrence of `name` in `text` (both folded), or -1. */
function wordIndex(text: string, name: string): number {
  const n = fold(name).trim();
  if (n.length < 3) return -1;
  const m = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRe(n)})(?=$|[^\\p{L}\\p{N}])`, 'u').exec(text);
  return m ? m.index + m[1].length : -1;
}

function earliest(text: string, entities: readonly NewsEntity[]): { type: NewsEntityType; key: string } | null {
  let best: { type: NewsEntityType; key: string; at: number } | null = null;
  for (const e of entities) {
    for (const name of e.names) {
      const at = wordIndex(text, name);
      if (at < 0) continue;
      if (!best || at < best.at || (at === best.at && TYPE_RANK[e.type] < TYPE_RANK[best.type])) {
        best = { type: e.type, key: e.key, at };
      }
    }
  }
  return best ? { type: best.type, key: best.key } : null;
}

/**
 * The entity the item is about: the earliest name in the title; when the title has none,
 * the earliest in the summary. Null when nothing matches.
 */
export function pickNewsEntity(
  title: string,
  summary: string,
  entities: readonly NewsEntity[],
): { type: NewsEntityType; key: string } | null {
  return earliest(fold(title), entities) ?? earliest(fold(summary), entities);
}
