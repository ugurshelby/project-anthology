import constructorsJson from '@/data/history/constructors.json';
import driversJson from '@/data/history/drivers.json';
import { MEDIA_KEY_PATTERN } from '@/lib/media/keys';
import { fold } from '@/lib/media/score';

/**
 * Id aliases. The site has two id families for the same real-world entity:
 *   live season (Jolpica):   hamilton · max_verstappen · red_bull · albert_park
 *   archive (F1DB index):    lewis-hamilton · max-verstappen · red-bull · albert-park
 * Media rows are keyed by the Jolpica id; aliases let a page that only knows the
 * F1DB id (or a hyphen/underscore variant) still find its image.
 */

interface NamedEntry {
  n?: string;
  fn?: string;
}

const drivers = driversJson as unknown as Record<string, NamedEntry>;
const constructors = constructorsJson as unknown as Record<string, NamedEntry>;

let driverByName: Map<string, string[]> | null = null;
let teamByName: Map<string, string[]> | null = null;

const GENERATIONAL_SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii']);

function normName(name: string): string {
  return fold(name).replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Driver names compare without a trailing generational suffix ("Carlos Sainz Jr." = "Carlos Sainz"). */
function normDriverName(name: string): string {
  const words = normName(name).split(' ');
  while (words.length > 1 && GENERATIONAL_SUFFIXES.has(words[words.length - 1])) words.pop();
  return words.join(' ');
}

function indexByName(
  source: Record<string, NamedEntry>,
  fields: Array<keyof NamedEntry>,
  norm: (name: string) => string = normName,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [id, entry] of Object.entries(source)) {
    for (const f of fields) {
      const v = entry[f];
      if (!v) continue;
      const k = norm(v);
      map.set(k, Array.from(new Set([...(map.get(k) ?? []), id])));
    }
  }
  return map;
}

export function slugify(text: string): string {
  return fold(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** hyphen ↔ underscore variants of an id. */
export function separatorVariants(id: string): string[] {
  return [id, id.replace(/-/g, '_'), id.replace(/_/g, '-')];
}

function clean(list: string[], selfKey: string): string[] {
  return Array.from(new Set(list.map((a) => a.toLowerCase())))
    .filter((a) => a !== selfKey && MEDIA_KEY_PATTERN.test(a))
    .sort();
}

/**
 * Fallback when no F1DB name matches exactly: an F1DB name of at least two words whose words all appear in the
 * Jolpica name and whose last word is the same ("Kimi Antonelli" in "Andrea Kimi Antonelli"). Several matches
 * mean the name is ambiguous, so none is returned.
 */
function subsetDriverIds(index: Map<string, string[]>, displayName: string): string[] {
  const words = normDriverName(displayName).split(' ');
  const last = words[words.length - 1];
  const hits = new Set<string>();
  for (const [name, ids] of index) {
    const parts = name.split(' ');
    if (parts.length < 2 || parts[parts.length - 1] !== last) continue;
    if (parts.every((p) => words.includes(p))) ids.forEach((id) => hits.add(id));
  }
  return hits.size === 1 ? Array.from(hits) : [];
}

export function driverAliases(key: string, displayName: string | null | undefined): string[] {
  driverByName ??= indexByName(drivers, ['n'], normDriverName);
  const out: string[] = separatorVariants(key);
  if (displayName) {
    out.push(...(driverByName.get(normDriverName(displayName)) ?? subsetDriverIds(driverByName, displayName)));
    const slug = slugify(displayName);
    out.push(slug, slug.replace(/-/g, '_'));
  }
  return clean(out, key);
}

export function teamAliases(
  key: string,
  displayName: string | null | undefined,
  wikipediaTitle?: string | null,
  curated: string[] = [],
): string[] {
  teamByName ??= indexByName(constructors, ['n', 'fn']);
  const out: string[] = [...separatorVariants(key), ...curated];
  for (const name of [displayName, wikipediaTitle]) {
    if (!name) continue;
    out.push(...(teamByName.get(normName(name)) ?? []));
    const slug = slugify(name);
    out.push(slug, slug.replace(/-/g, '_'));
  }
  return clean(out, key);
}

/** Circuits: separator variants of the Jolpica id plus curated overrides (F1DB circuit ids differ for a few venues). */
export function circuitAliases(key: string, curated: string[] = []): string[] {
  return clean([...separatorVariants(key), ...curated], key);
}
