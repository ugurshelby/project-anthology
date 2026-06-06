import { getTeamByName } from '@/config/team-colors';

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

/** Ergast driverId → asset slug (when code alone is insufficient). */
const DRIVER_ID_TO_SLUG: Record<string, string> = {
  max_verstappen: 'verstappen',
  colapinto: 'colapinto',
  lindblad: 'lindblad',
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

function slugFromDriverId(driverId: string): string | null {
  const id = driverId.trim().toLowerCase();
  if (!id) return null;
  if (DRIVER_ID_TO_SLUG[id]) return DRIVER_ID_TO_SLUG[id];
  const normalized = id.replace(/^max_/, '').replace(/_/g, '');
  if (DRIVER_ASSET_SLUGS.has(normalized)) return normalized;
  if (DRIVER_ASSET_SLUGS.has(id)) return id;
  return null;
}

function slugFromSurname(driverName: string): string | null {
  const last = driverName.trim().split(/\s+/).pop()?.toLowerCase();
  if (!last || !DRIVER_ASSET_SLUGS.has(last)) return null;
  return last;
}

/**
 * Resolve a driver portrait path. Returns null when no asset exists (avoids 404).
 * Accepts FIA code, Ergast driverId, or full driver name (surname fallback).
 */
export function driverIconSrc(
  driverCode?: string | null,
  driverIdOrName?: string | null,
): string | null {
  const code = (driverCode ?? '').trim().toLowerCase();
  if (code && DRIVER_CODE_TO_SLUG[code]) {
    return `/drivers/${DRIVER_CODE_TO_SLUG[code]}.svg`;
  }

  const secondary = (driverIdOrName ?? '').trim();
  if (!secondary) return null;

  const fromId = slugFromDriverId(secondary);
  if (fromId) return `/drivers/${fromId}.svg`;

  const fromName = slugFromSurname(secondary);
  if (fromName) return `/drivers/${fromName}.svg`;

  return null;
}

export function teamIconSrc(teamName: string | undefined | null): string | null {
  const team = getTeamByName((teamName ?? '').trim());
  return team ? `/teams/${team.id}.svg` : null;
}

export function circuitIconSrc(circuitId: string | undefined | null): string | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const file = CIRCUIT_ID_TO_SVG[id];
  return file ? `/circuits/${file}` : null;
}
