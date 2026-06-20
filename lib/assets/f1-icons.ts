import { getTeamByName } from '@/config/team-colors';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

/**
 * Strip diacritics and normalize punctuation so a driver's display name maps to
 * its ASCII on-disk asset slug. Cursor renames asset files to ASCII basenames
 * (räikkönen→raikkonen, pérez→perez); the resolver must apply the same transform
 * or it generates slugs that 404. Handles: ä→a é→e ü→u ö→o ñ→n etc. (via Unicode
 * NFD decomposition), German ß→ss, and trailing/internal punctuation (jr.→jr).
 */
function normalizeDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks (accents)
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/đ/g, 'd')
    .replace(/ł/g, 'l')
    .replace(/[.'’]/g, '') // drop dots/apostrophes: jr. → jr, o'ward → oward
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, ''); // trim leading/trailing underscores
}

/** FIA 3-letter driver code → public/drivers SVG basename (surname slug). */
const DRIVER_CODE_TO_SLUG: Record<string, string> = {
  ant: 'antonelli',
  rus: 'russell',
  lec: 'leclerc',
  ham: 'hamilton',
  nor: 'norris',
  pia: 'piastri',
  ver: 'verstappen',
  gas: 'gasly',
  bea: 'bearman',
  law: 'lawson',
  col: 'colapinto',
  had: 'hadjar',
  sai: 'sainz',
  lin: 'lindblad',
  bor: 'bortoleto',
  oco: 'ocon',
  alb: 'albon',
  hul: 'hulkenberg',
  bot: 'bottas',
  per: 'perez',
  str: 'stroll',
  alo: 'alonso',
  tsu: 'tsunoda',
  doo: 'doohan',
};

/** Ergast driverId → current-season asset slug (when code alone is insufficient). */
const DRIVER_ID_TO_SLUG: Record<string, string> = {
  max_verstappen: 'verstappen',
  colapinto: 'colapinto',
  lindblad: 'lindblad',
};

/** Ergast given_family ids that use a shorter on-disk basename in historical seasons. */
const ERGAST_SLUG_ALIASES: Record<string, string> = {
  lewis_hamilton: 'hamilton',
  carlos_sainz: 'sainz',
  charles_leclerc: 'leclerc',
  george_russell: 'russell',
  fernando_alonso: 'alonso',
  lance_stroll: 'stroll',
  pierre_gasly: 'gasly',
  alexander_albon: 'albon',
  nico_hulkenberg: 'hulkenberg',
  valtteri_bottas: 'bottas',
  sergio_perez: 'perez',
  lando_norris: 'norris',
  oscar_piastri: 'piastri',
  yuki_tsunoda: 'tsunoda',
  esteban_ocon: 'ocon',
  daniel_ricciardo: 'ricciardo',
  zhou_guanyu: 'zhou',
  logan_sargeant: 'sargeant',
  // Special-character names: explicit aliases as a safety net for when an upstream
  // source sends a pre-built ergast id carrying diacritics. The resolver also
  // normalizes diacritics generically (normalizeDiacritics), but these pin the
  // exact on-disk surname basename (assets are surname-only: raikkonen.svg etc.).
  kimi_räikkönen: 'raikkonen',
  kimi_raikkonen: 'raikkonen',
  sergio_pérez: 'perez',
  nico_hülkenberg: 'hulkenberg',
  'carlos_sainz_jr.': 'sainz',
  carlos_sainz_jr: 'sainz',
};

const DRIVER_ASSET_SLUGS = new Set(Object.values(DRIVER_CODE_TO_SLUG));

/** Ergast/Jolpica circuitId → public/circuits SVG basename. */
const CIRCUIT_ID_TO_SVG: Record<string, string> = {
  albert_park: 'au-1953.svg',
  bahrain: 'bh-2002.svg',
  jeddah: 'sa-2021.svg',
  shanghai: 'cn-2004.svg',
  suzuka: 'jp-1962.svg',
  miami: 'us-2022.svg',
  imola: 'it-1922.svg',
  monaco: 'mc-1929.svg',
  villeneuve: 'ca-1978.svg',
  catalunya: 'es-1991.svg',
  red_bull_ring: 'at-1969.svg',
  silverstone: 'gb-1948.svg',
  spa: 'be-1925.svg',
  hungaroring: 'hu-1986.svg',
  zandvoort: 'nl-1948.svg',
  monza: 'it-1922.svg',
  baku: 'az-2016.svg',
  marina_bay: 'sg-2008.svg',
  americas: 'us-2012.svg',
  rodriguez: 'mx-1962.svg',
  interlagos: 'br-1940.svg',
  vegas: 'us-2023.svg',
  las_vegas: 'us-2023.svg',
  losail: 'qa-2004.svg',
  qatar: 'qa-2004.svg',
  yas_marina: 'ae-2009.svg',
  madring: 'es-2026.svg',
};

/** Historical constructor display names → public/teams SVG slug (matches assets/data/constructor-palette.json). */
const CONSTRUCTOR_NAME_TO_SLUG: Record<string, string> = {
  'alfa romeo': 'alfa-romeo',
  'alfa romeo racing': 'alfa-romeo',
  alphatauri: 'alpha-tauri',
  'alpha tauri': 'alpha-tauri',
  'scuderia alphatauri': 'alpha-tauri',
  'aston martin': 'aston-martin',
  'aston martin cognizant': 'aston-martin',
  bar: 'bar',
  benetton: 'benetton',
  bmw: 'bmw-sauber',
  'bmw sauber': 'bmw-sauber',
  brawn: 'brawn',
  caterham: 'caterham',
  'force india': 'force-india',
  'racing point': 'racing-point',
  'racing point f1 team': 'racing-point',
  'bwt racing point': 'racing-point',
  honda: 'honda',
  hrt: 'hrt',
  jaguar: 'jaguar',
  jordan: 'jordan',
  'kick sauber': 'kick-sauber',
  'stake f1 team kick sauber': 'kick-sauber',
  lotus: 'lotus',
  'lotus f1': 'lotus',
  'lotus racing': 'lotus-racing',
  manor: 'manor',
  marussia: 'marussia',
  mf1: 'mf1',
  minardi: 'minardi',
  prost: 'prost',
  renault: 'renault',
  sauber: 'sauber',
  spyker: 'spyker',
  'super aguri': 'super-aguri',
  toro: 'toro-rosso',
  'toro rosso': 'toro-rosso',
  'scuderia toro rosso': 'toro-rosso',
  toyota: 'toyota',
  virgin: 'virgin',
  arrows: 'arrows',
};

function resolveSeason(season?: number): number {
  return season ?? CURRENT_SEASON;
}

function slugFromDriverId(driverId: string): string | null {
  const id = driverId.trim().toLowerCase();
  if (!id) return null;
  if (DRIVER_ID_TO_SLUG[id]) return DRIVER_ID_TO_SLUG[id];
  const collapsed = id.replace(/^max_/, '').replace(/_/g, '');
  if (DRIVER_ASSET_SLUGS.has(collapsed)) return collapsed;
  if (DRIVER_ASSET_SLUGS.has(id)) return id;
  const ascii = normalizeDiacritics(collapsed);
  if (ascii !== collapsed && DRIVER_ASSET_SLUGS.has(ascii)) return ascii;
  return null;
}

function slugFromSurname(driverName: string): string | null {
  const last = driverName.trim().split(/\s+/).pop()?.toLowerCase();
  if (!last) return null;
  if (DRIVER_ASSET_SLUGS.has(last)) return last;
  const normalized = normalizeDiacritics(last);
  if (normalized !== last && DRIVER_ASSET_SLUGS.has(normalized)) return normalized;
  return null;
}

function ergastIdFromName(driverName: string): string | null {
  const parts = driverName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    const single = parts[0]?.toLowerCase();
    return single ? normalizeDiacritics(single) : null;
  }
  const family = parts[parts.length - 1].toLowerCase();
  const given = parts.slice(0, -1).join('_').toLowerCase();
  const ergast = `${given}_${family}`;
  // Try alias on the raw id first (covers explicit diacritic keys), then fall
  // back to the ASCII-normalized id (covers files renamed to plain basenames).
  if (ERGAST_SLUG_ALIASES[ergast]) return ERGAST_SLUG_ALIASES[ergast];
  const normalized = normalizeDiacritics(ergast);
  return ERGAST_SLUG_ALIASES[normalized] ?? normalized;
}

function resolveDriverSlug(
  driverCode?: string | null,
  driverIdOrName?: string | null,
  season?: number,
): string | null {
  const effectiveSeason = resolveSeason(season);
  const isCurrentSeason = effectiveSeason >= CURRENT_SEASON;
  const code = (driverCode ?? '').trim().toLowerCase();
  const secondary = (driverIdOrName ?? '').trim();

  if (isCurrentSeason && code && DRIVER_CODE_TO_SLUG[code]) {
    return DRIVER_CODE_TO_SLUG[code];
  }

  if (secondary) {
    const lowered = secondary.toLowerCase();
    if (lowered.includes('_')) {
      if (isCurrentSeason) {
        const fromId = slugFromDriverId(lowered);
        if (fromId) return fromId;
      }
      if (ERGAST_SLUG_ALIASES[lowered]) return ERGAST_SLUG_ALIASES[lowered];
      const normalized = normalizeDiacritics(lowered);
      return ERGAST_SLUG_ALIASES[normalized] ?? normalized;
    }

    const fromId = slugFromDriverId(lowered);
    if (fromId && isCurrentSeason) return fromId;

    const ergast = ergastIdFromName(secondary);
    if (ergast) return ergast;

    const fromName = slugFromSurname(secondary);
    if (fromName) return fromName;
  }

  if (code && DRIVER_CODE_TO_SLUG[code]) {
    return DRIVER_CODE_TO_SLUG[code];
  }

  return null;
}

function teamSlugFromName(teamName: string): string | null {
  const key = teamName.trim().toLowerCase();
  if (!key) return null;

  const current = getTeamByName(teamName);
  if (current) return current.id;

  const exact = CONSTRUCTOR_NAME_TO_SLUG[key];
  if (exact) return exact;

  for (const [alias, slug] of Object.entries(CONSTRUCTOR_NAME_TO_SLUG)) {
    if (key.includes(alias) || alias.includes(key)) return slug;
  }

  return null;
}

/**
 * Resolve a driver portrait path. Returns null when no slug can be derived (avoids guessing 404s).
 * Accepts FIA code, Ergast driverId, or full driver name (surname / ergast fallback).
 */
export function driverIconSrc(
  driverCode?: string | null,
  driverIdOrName?: string | null,
  season?: number,
): string | null {
  const slug = resolveDriverSlug(driverCode, driverIdOrName, season);
  if (!slug) return null;
  return `/drivers/${resolveSeason(season)}/${slug}.svg`;
}

export function teamIconSrc(
  teamName: string | undefined | null,
  season?: number,
): string | null {
  const slug = teamSlugFromName((teamName ?? '').trim());
  if (!slug) return null;
  return `/teams/${resolveSeason(season)}/${slug}.svg`;
}

export function circuitIconSrc(circuitId: string | undefined | null): string | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const file = CIRCUIT_ID_TO_SVG[id];
  return file ? `/circuits/${file}` : null;
}

/** Resolve a team car SVG path. constructorId is used as-is (underscore preserved). */
export function carSrc(
  constructorId: string | undefined | null,
  teamName?: string | null,
): string | null {
  const id = (constructorId ?? '').trim().toLowerCase();
  if (id) return `/cars/${id}.svg`;
  const slug = teamSlugFromName((teamName ?? '').trim());
  return slug ? `/cars/${slug.replace(/-/g, '_')}.svg` : null;
}
