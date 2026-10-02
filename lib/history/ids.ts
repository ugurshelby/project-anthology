import constructorIndexJson from '@/data/history/constructor-index.json';

/**
 * Browser-safe team identity: names, country and active years only (about 16 KB).
 * The heavy per-season history lives in store.ts and is only imported on the
 * server. Colour code (palette.ts) depends on this file, not on store.ts.
 */

export interface ConstructorMeta {
  n: string;
  fn: string;
  /** F1DB country id, e.g. "united-kingdom". */
  c: string;
  /** Active year ranges, inclusive. */
  r: [number, number][];
}

const INDEX = constructorIndexJson as unknown as Record<string, ConstructorMeta>;

export function constructorMeta(id: string | null | undefined): ConstructorMeta | null {
  return id ? (INDEX[id] ?? null) : null;
}

export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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

let byName: Map<string, string[]> | null = null;

function buildNameMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [id, c] of Object.entries(INDEX)) {
    for (const key of [normalizeText(c.n), normalizeText(c.fn)]) {
      map.set(key, [...(map.get(key) ?? []), id]);
    }
  }
  return map;
}

function activeIn(id: string, year: number): boolean {
  return (INDEX[id]?.r ?? []).some(([from, to]) => year >= from && year <= to);
}

/**
 * Map any team reference to an F1DB constructor id: F1DB ids, Ergast/Jolpica
 * ids ("red_bull", "rb", "sauber"), or display names ("Oracle Red Bull Racing").
 * `year` disambiguates names that changed (Sauber / Kick Sauber / Audi).
 */
export function resolveConstructorId(input: string | null | undefined, year?: number): string | null {
  if (!input) return null;
  const names = (byName ??= buildNameMap());
  const raw = input.trim().toLowerCase();
  const kebab = raw.replace(/[\s_]+/g, '-');

  const aware = yearAware(kebab, year);
  if (aware && INDEX[aware]) return aware;
  if (INDEX[raw]) return raw;
  if (INDEX[kebab]) return kebab;
  if (CONSTRUCTOR_ALIASES[kebab] && INDEX[CONSTRUCTOR_ALIASES[kebab]]) return CONSTRUCTOR_ALIASES[kebab];

  const text = normalizeText(raw);
  const exact = names.get(text);
  if (exact?.length) {
    return year != null ? (exact.find((id) => activeIn(id, year)) ?? exact[0]) : exact[0];
  }

  // longest constructor name that appears as whole words inside the input
  let best: { id: string; len: number } | null = null;
  for (const [name, ids] of names) {
    if (name.length < 2) continue;
    if (` ${text} `.includes(` ${name} `)) {
      const id = year != null ? (ids.find((i) => activeIn(i, year)) ?? null) : ids[0];
      if (id && (!best || name.length > best.len)) best = { id, len: name.length };
    }
  }
  return best?.id ?? null;
}
