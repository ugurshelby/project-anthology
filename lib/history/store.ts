import constructorsJson from '@/data/history/constructors.json';
import driversJson from '@/data/history/drivers.json';
import seasonsJson from '@/data/history/seasons.json';
import metaJson from '@/data/history/meta.json';
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

export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

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

const CONSTRUCTOR_ALIASES: Record<string, string> = {
  alfa: 'alfa-romeo',
  'red-bull-racing': 'red-bull',
  'scuderia-ferrari': 'ferrari',
  'mercedes-amg': 'mercedes',
  'mercedes-benz': 'mercedes',
  'aston-martin-aramco': 'aston-martin',
};

/** Ergast/Jolpica ids whose F1DB id depends on the season. */
function yearAware(id: string, year: number | undefined): string | null {
  if (id === 'sauber') return year != null && year >= 2024 && year <= 2025 ? 'kick-sauber' : 'sauber';
  if (id === 'rb') return year != null && year >= 2025 ? 'racing-bulls' : 'rb';
  if (id === 'alpha-tauri') return 'alphatauri';
  return null;
}

let constructorByName: Map<string, string[]> | null = null;

function buildConstructorMap(): void {
  constructorByName = new Map();
  for (const [id, c] of Object.entries(CONSTRUCTORS)) {
    for (const key of [normalizeText(c.n), normalizeText(c.fn)]) {
      constructorByName.set(key, [...(constructorByName.get(key) ?? []), id]);
    }
  }
}

function constructorActiveIn(id: string, year: number): boolean {
  const rows = CONSTRUCTORS[id]?.s ?? [];
  return rows.some((r) => r.y === year);
}

/**
 * Map any team reference to an F1DB constructor id: F1DB ids, Ergast/Jolpica
 * ids ("red_bull", "rb", "sauber"), or display names ("Oracle Red Bull Racing").
 * `year` disambiguates names that changed (Sauber / Kick Sauber / Audi).
 */
export function resolveConstructorId(input: string | null | undefined, year?: number): string | null {
  if (!input) return null;
  if (!constructorByName) buildConstructorMap();
  const raw = input.trim().toLowerCase();
  const kebab = raw.replace(/[\s_]+/g, '-');

  const aware = yearAware(kebab, year);
  if (aware && CONSTRUCTORS[aware]) return aware;
  if (CONSTRUCTORS[raw]) return raw;
  if (CONSTRUCTORS[kebab]) return kebab;
  if (CONSTRUCTOR_ALIASES[kebab] && CONSTRUCTORS[CONSTRUCTOR_ALIASES[kebab]]) return CONSTRUCTOR_ALIASES[kebab];

  const text = normalizeText(raw);
  const exact = constructorByName!.get(text);
  if (exact?.length) {
    return year != null ? (exact.find((id) => constructorActiveIn(id, year)) ?? exact[0]) : exact[0];
  }

  // longest constructor name that appears as whole words inside the input
  let best: { id: string; len: number } | null = null;
  for (const [name, ids] of constructorByName!) {
    if (name.length < 2) continue;
    if (` ${text} `.includes(` ${name} `)) {
      const id = year != null ? (ids.find((i) => constructorActiveIn(i, year)) ?? null) : ids[0];
      if (id && (!best || name.length > best.len)) best = { id, len: name.length };
    }
  }
  return best?.id ?? null;
}
