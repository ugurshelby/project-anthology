import constructorsJson from '@/data/history/constructors.json';
import driversJson from '@/data/history/drivers.json';
import seasonsJson from '@/data/history/seasons.json';
import metaJson from '@/data/history/meta.json';
import { normalizeText } from './ids';
import type {
  ConstructorRecord,
  DriverRecord,
  HistoryMeta,
  SeasonSummary,
} from './types';

/**
 * Read access to the committed F1DB history index (see
 * scripts/build-f1-history-index.ts). Pure, synchronous, no network.
 */

const CONSTRUCTORS = constructorsJson as unknown as Record<string, ConstructorRecord>;
const DRIVERS = driversJson as unknown as Record<string, DriverRecord>;
const SEASONS = seasonsJson as unknown as Record<string, SeasonSummary>;
export const HISTORY_META = metaJson as unknown as HistoryMeta;

export function getConstructorRecord(id: string | null | undefined): ConstructorRecord | null {
  return id ? (CONSTRUCTORS[id] ?? null) : null;
}

export function getDriverRecord(id: string | null | undefined): DriverRecord | null {
  return id ? (DRIVERS[id] ?? null) : null;
}

export function getSeasonSummary(year: number): SeasonSummary | null {
  return SEASONS[String(year)] ?? null;
}

export function allConstructorIds(): string[] {
  return Object.keys(CONSTRUCTORS);
}

export function allDriverIds(): string[] {
  return Object.keys(DRIVERS);
}

/** Every season year in the index, ascending. */
export function historyYears(): number[] {
  return Object.keys(SEASONS)
    .map(Number)
    .sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ */
/* id resolution                                                       */
/* ------------------------------------------------------------------ */

let driverByName: Map<string, string[]> | null = null;
let driverByLast: Map<string, string[]> | null = null;

function buildDriverMaps(): void {
  driverByName = new Map();
  driverByLast = new Map();
  for (const [id, d] of Object.entries(DRIVERS)) {
    const full = normalizeText(d.n);
    driverByName.set(full, [...(driverByName.get(full) ?? []), id]);
    const parts = full.split(' ');
    const last = parts[parts.length - 1];
    driverByLast.set(last, [...(driverByLast.get(last) ?? []), id]);
  }
}

function newestSeason(id: string): number {
  const rows = DRIVERS[id]?.s ?? [];
  return rows.length ? rows[rows.length - 1].y : 0;
}

/**
 * Map any driver reference to an F1DB driver id. Accepts F1DB ids
 * ("lewis-hamilton"), Ergast/Jolpica ids ("max_verstappen", "hamilton") and
 * display names. Returns null when nothing matches.
 */
export function resolveDriverId(
  input: string | null | undefined,
  hint?: { name?: string; code?: string },
): string | null {
  if (!input && !hint?.name) return null;
  if (!driverByName || !driverByLast) buildDriverMaps();
  const raw = (input ?? '').trim().toLowerCase();
  if (raw && DRIVERS[raw]) return raw;
  const kebab = raw.replace(/_/g, '-');
  if (kebab && DRIVERS[kebab]) return kebab;

  const byName = (name: string): string | null => {
    const hits = driverByName!.get(normalizeText(name));
    if (!hits?.length) return null;
    return [...hits].sort((a, b) => newestSeason(b) - newestSeason(a))[0];
  };
  if (hint?.name) {
    const found = byName(hint.name);
    if (found) return found;
  }
  // Ergast-style ids are one token or given_family; a hyphenated unknown id is not a driver
  if (raw && !raw.includes('-')) {
    const asName = byName(raw.replace(/[-_]/g, ' '));
    if (asName) return asName;
    const last = normalizeText(raw.replace(/_/g, ' ')).split(' ').pop() ?? '';
    const hits = driverByLast!.get(last);
    if (hits?.length) {
      const code = hint?.code?.toUpperCase();
      const coded = code ? hits.filter((id) => DRIVERS[id].code === code) : [];
      const pool = coded.length ? coded : hits;
      return [...pool].sort((a, b) => newestSeason(b) - newestSeason(a))[0];
    }
  }
  return null;
}

export { resolveConstructorId } from './ids';
