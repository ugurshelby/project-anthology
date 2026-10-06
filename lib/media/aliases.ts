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

function normName(name: string): string {
  return fold(name).replace(/[^a-z0-9]+/g, ' ').trim();
}

function indexByName(source: Record<string, NamedEntry>, fields: Array<keyof NamedEntry>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [id, entry] of Object.entries(source)) {
    for (const f of fields) {
      const v = entry[f];
      if (!v) continue;
      const k = normName(v);
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

export function driverAliases(key: string, displayName: string | null | undefined): string[] {
  driverByName ??= indexByName(drivers, ['n']);
  const out: string[] = separatorVariants(key);
  if (displayName) {
    out.push(...(driverByName.get(normName(displayName)) ?? []));
    const slug = slugify(displayName);
    out.push(slug, slug.replace(/-/g, '_'));
  }
  return clean(out, key);
}

export function teamAliases(key: string, displayName: string | null | undefined, wikipediaTitle?: string | null): string[] {
  teamByName ??= indexByName(constructors, ['n', 'fn']);
  const out: string[] = separatorVariants(key);
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
