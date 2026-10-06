import { fetchJolpica } from '@/lib/f1/sources/jolpica';
import { carKey, iconicCarKey } from '@/lib/media/keys';
import { circuitAliases, driverAliases, teamAliases } from '@/lib/media/aliases';
import { wikipediaTitleFromUrl } from '@/lib/media/wikimedia';
import type { MediaEntity } from '@/lib/media/types';
import { CIRCUIT_ALIASES, EXTRA_CIRCUITS, ICONIC_CARS, LOGO_OVERRIDES } from '@/data/media/curated';

/**
 * The set of things that need an image, derived from live data (Jolpica) so a
 * new season/driver/team/circuit appears automatically — nothing here lists
 * seasons, drivers or teams by hand. Curated extras come from data/media/curated.ts.
 */

interface MrDriver { driverId?: string; givenName?: string; familyName?: string; url?: string }
interface MrConstructor { constructorId?: string; name?: string; url?: string }
interface MrCircuit { circuitId?: string; circuitName?: string; url?: string; Location?: { locality?: string; country?: string } }

interface MrTable {
  MRData?: {
    DriverTable?: { Drivers?: MrDriver[] };
    ConstructorTable?: { Constructors?: MrConstructor[] };
    CircuitTable?: { Circuits?: MrCircuit[] };
  };
}

/** The Wikipedia article title often carries the team's current name ('Racing Bulls' for constructor 'RB F1 Team'). */
function hintsFor(url: string | undefined): string[] {
  const t = wikipediaTitleFromUrl(url);
  return t ? [t] : [];
}

function lower(id: string | undefined): string {
  return (id ?? '').trim().toLowerCase();
}

/** Discover all entities that took part in `season`. Returns [] for seasons Jolpica does not have. */
export async function discoverSeason(season: number): Promise<MediaEntity[]> {
  const [drivers, constructors, circuits] = (await Promise.all([
    fetchJolpica(`${season}/drivers.json?limit=100`),
    fetchJolpica(`${season}/constructors.json?limit=100`),
    fetchJolpica(`${season}/circuits.json?limit=100`),
  ])) as MrTable[];

  const out: MediaEntity[] = [];
  for (const d of drivers.MRData?.DriverTable?.Drivers ?? []) {
    const key = lower(d.driverId);
    if (!key) continue;
    const displayName = `${d.givenName ?? ''} ${d.familyName ?? ''}`.trim() || null;
    out.push({
      type: 'driver',
      key,
      season,
      displayName,
      wikipediaUrl: d.url ?? null,
      aliases: driverAliases(key, displayName),
    });
  }
  for (const c of constructors.MRData?.ConstructorTable?.Constructors ?? []) {
    const key = lower(c.constructorId);
    if (!key) continue;
    const override = LOGO_OVERRIDES.find((o) => o.constructorId === key);
    const aliases = teamAliases(key, c.name, wikipediaTitleFromUrl(c.url));
    out.push({
      type: 'team',
      key,
      season,
      displayName: c.name ?? null,
      wikipediaUrl: c.url ?? null,
      aliases,
      extra: {
        nameHints: hintsFor(c.url),
        ...(override ? { curatedFiles: override.files, logoQueries: override.queries ?? [] } : {}),
      },
    });
    // One car image per team per season; seasons never borrow each other's car.
    out.push({
      type: 'car',
      key: carKey(key, season),
      season,
      displayName: c.name ?? null,
      // A page that knows the team only by its F1DB id ('red-bull') asks for 'red-bull:2025'.
      aliases: aliases.map((a) => carKey(a, season)),
      extra: { constructorId: key, constructorName: c.name ?? null, nameHints: hintsFor(c.url) },
    });
  }
  for (const c of circuits.MRData?.CircuitTable?.Circuits ?? []) {
    const key = lower(c.circuitId);
    if (!key) continue;
    out.push({
      type: 'circuit',
      key,
      season,
      displayName: c.circuitName ?? null,
      wikipediaUrl: c.url ?? null,
      aliases: circuitAliases(key, CIRCUIT_ALIASES[key]),
      extra: { locality: c.Location?.locality ?? null, country: c.Location?.country ?? null },
    });
  }
  return out;
}

/** Curated iconic cars (season-independent keys). Pure, no network. */
export function curatedCarEntities(): MediaEntity[] {
  return ICONIC_CARS.map((car) => ({
    type: 'car' as const,
    key: iconicCarKey(car.slug),
    season: car.season,
    displayName: car.name,
    extra: { constructorId: car.constructorId, curatedFiles: car.files, curatedQuery: car.query ?? null, iconic: true },
  }));
}

/**
 * Historic/iconic circuits outside the discovered seasons. One Jolpica call lists every circuit
 * ever used; we keep the curated ids so names and Wikipedia links are never typed by hand.
 */
export async function extraCircuitEntities(): Promise<MediaEntity[]> {
  if (EXTRA_CIRCUITS.length === 0) return [];
  const all = (await fetchJolpica('circuits.json?limit=200')) as MrTable;
  const byId = new Map<string, MrCircuit>();
  for (const c of all.MRData?.CircuitTable?.Circuits ?? []) byId.set(lower(c.circuitId), c);
  const out: MediaEntity[] = [];
  for (const extra of EXTRA_CIRCUITS) {
    const id = extra.circuitId.toLowerCase();
    const c = byId.get(id);
    if (!c) continue;
    out.push({
      type: 'circuit',
      key: id,
      displayName: c.circuitName ?? null,
      wikipediaUrl: c.url ?? null,
      aliases: circuitAliases(id, CIRCUIT_ALIASES[id]),
      extra: { locality: c.Location?.locality ?? null, country: c.Location?.country ?? null, curatedFiles: extra.files ?? [], historic: true },
    });
  }
  return out;
}

/**
 * Collapse duplicates (a driver appears in many seasons): keep one entity per
 * (type,key), with the newest season and the richest metadata.
 */
export function mergeEntities(list: MediaEntity[]): MediaEntity[] {
  const map = new Map<string, MediaEntity>();
  for (const e of list) {
    const id = `${e.type}|${e.key}`;
    const prev = map.get(id);
    if (!prev) {
      map.set(id, e);
      continue;
    }
    map.set(id, {
      ...prev,
      ...e,
      season: Math.max(prev.season ?? 0, e.season ?? 0) || null,
      displayName: e.displayName ?? prev.displayName,
      wikipediaUrl: e.wikipediaUrl ?? prev.wikipediaUrl,
      aliases: Array.from(new Set([...(prev.aliases ?? []), ...(e.aliases ?? [])])).sort(),
      extra: { ...(prev.extra ?? {}), ...(e.extra ?? {}) },
    });
  }
  return Array.from(map.values());
}
