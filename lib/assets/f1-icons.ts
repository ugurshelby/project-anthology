import { getTeamByName } from '@/config/team-colors';

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

export function driverIconSrc(driverCode: string | undefined | null): string | null {
  const code = (driverCode ?? '').trim().toLowerCase();
  return code ? `/drivers/${code}.svg` : null;
}

export function teamIconSrc(teamName: string | undefined | null): string | null {
  const team = getTeamByName((teamName ?? '').trim());
  return team ? `/teams/${team.id}.svg` : null;
}

export function circuitIconSrc(
  circuitId: string | undefined | null,
): string | null {
  const id = (circuitId ?? '').trim().toLowerCase();
  if (!id) return null;
  const file = CIRCUIT_ID_TO_SVG[id];
  return file ? `/circuits/${file}` : null;
}
