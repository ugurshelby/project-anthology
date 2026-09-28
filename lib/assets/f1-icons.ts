/**
 * Visual asset resolution — Apex is photo-free by policy (2026-09-28).
 *
 * Driver portraits, team logos, and car renders were previously real
 * photographs / official marks dropped into `assets/asset-package/` with no
 * documented license or source — a genuine copyright/likeness risk for a
 * production site. They've been removed. `driverIconSrc`, `teamIconSrc`, and
 * `carSrc` now always return null so every caller falls through to
 * `components/media/ApexFallback`, which renders a data-driven badge (driver
 * code/number, team colors already in hand from the live standings — no
 * photo, no external asset, so no missing-asset gap ever exists for a new
 * driver or team either).
 *
 * The one exception is `circuitIconSrc`: track outline geometry from
 * `assets/f1-circuits/` (MIT-licensed, github.com/svemir/f1-circuits) is not
 * photography and carries a clear, compatible license, so it stays.
 */

/** Ergast/Jolpica circuitId → public/circuits SVG basename (track map outline, MIT-licensed geometry). */
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

/** @deprecated Always null — no driver photography is used. Kept as a stable no-op API so call sites don't need to change; ApexFallback renders the badge instead. */
export function driverIconSrc(
  _driverCode?: string | null,
  _driverIdOrName?: string | null,
  _season?: number,
): string | null {
  return null;
}

/** @deprecated Always null — no team marks/logos are used. Kept as a stable no-op API; ApexFallback renders the badge instead. */
export function teamIconSrc(_teamName: string | undefined | null, _season?: number): string | null {
  return null;
}

/** Track map outline (MIT-licensed geometry, not photography) — the one real asset lookup left. */
export function circuitIconSrc(circuitId: string | undefined | null): string | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const file = CIRCUIT_ID_TO_SVG[id];
  return file ? `/circuits/${file}` : null;
}

/** @deprecated Always null — no aerial/photographic circuit covers are used. WeekendHero's existing gradient fallback renders instead. */
export function circuitCoverSrc(_circuitId: string | undefined | null): string | null {
  return null;
}

/** @deprecated Always null — no car renders are used. Kept as a stable no-op API; ApexFallback renders the badge instead. */
export function carSrc(_constructorId: string | undefined | null, _teamName?: string | null): string | null {
  return null;
}
