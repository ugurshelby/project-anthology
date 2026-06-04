/** Public circuit SVG assets (Phase 5 — filenames stable). */
export const CIRCUIT_SVG_FILES = [
  'ae-2009.svg',
  'at-1969.svg',
  'au-1953.svg',
  'az-2016.svg',
  'be-1925.svg',
  'bh-2002.svg',
  'br-1940.svg',
  'ca-1978.svg',
  'cn-2004.svg',
  'es-1991.svg',
  'es-2026.svg',
  'gb-1948.svg',
  'hu-1986.svg',
  'it-1922.svg',
  'jp-1962.svg',
  'mc-1929.svg',
  'mx-1962.svg',
  'nl-1948.svg',
  'qa-2004.svg',
  'sa-2021.svg',
  'sg-2008.svg',
  'us-2012.svg',
  'us-2022.svg',
  'us-2023.svg',
] as const;

export function circuitLabelFromFile(filename: string): string {
  const base = filename.replace(/\.svg$/i, '');
  const [country] = base.split('-');
  return country.toUpperCase();
}
