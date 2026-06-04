/**
 * F1DB GitHub Release adapter (Masterplan Karar E).
 *
 * F1DB publishes CalVer JSON releases at:
 *   https://github.com/f1db/f1db/releases
 * Each release asset is a single large `f1db.json` containing the full
 * historical archive with nested race, qualifying, sprint, standings data.
 *
 * This adapter:
 *  1. Fetches the latest release tag from GitHub API (no auth needed for public repos).
 *  2. Downloads the `f1db.json` asset entirely in-memory — NO disk writes.
 *  3. Exposes per-season extractor functions that return Ergast-shaped MRData
 *     objects so `lib/f1Ingest.ts` can upsert without knowing the source.
 *
 * Rate-limit: GitHub CDN / raw assets have no per-minute limit for anonymous
 * reads at this scale. We fetch exactly once per seed invocation.
 */

export interface MRData {
  MRData: Record<string, unknown>;
}

const RELEASE_API = 'https://api.github.com/repos/f1db/f1db/releases/latest';
const FETCH_TIMEOUT_MS = 60_000; // 60 s — large JSON asset

interface F1DbRace {
  year: number;
  round: number;
  name?: string;
  date?: string;
  time?: string;
  circuitId?: string;
  circuit?: { circuitId?: string; name?: string; country?: string; city?: string };
  driverResults?: F1DbDriverResult[];
  qualifyingResults?: F1DbQualResult[];
  sprintResults?: F1DbDriverResult[];
}

interface F1DbDriverResult {
  driverId?: string;
  position?: number | null;
  points?: number;
  laps?: number;
  status?: string;
  constructor?: { constructorId?: string; name?: string };
  driver?: { code?: string; givenName?: string; familyName?: string; nationality?: string };
  fastestLap?: { rank?: number; time?: string };
  grid?: number;
}

interface F1DbQualResult {
  driverId?: string;
  position?: number | null;
  q1?: string;
  q2?: string;
  q3?: string;
  driver?: { code?: string; givenName?: string; familyName?: string };
  constructor?: { constructorId?: string; name?: string };
}

interface F1DbStanding {
  driverId?: string;
  constructorId?: string;
  position?: number;
  points?: number;
  wins?: number;
  driver?: { code?: string; givenName?: string; familyName?: string; nationality?: string };
  constructor?: { name?: string; nationality?: string };
}

interface F1DbSeasonStandings {
  year: number;
  driverStandings?: F1DbStanding[];
  constructorStandings?: F1DbStanding[];
}

export interface F1DbData {
  races?: F1DbRace[];
  seasons?: Array<{
    year: number;
    rounds?: number;
    driverStandings?: F1DbStanding[];
    constructorStandings?: F1DbStanding[];
  }>;
}

let _cached: F1DbData | null = null;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'project-anthology/1.0' },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch the F1DB JSON. Returns cached instance for the lifetime of the process. */
export async function loadF1Db(): Promise<F1DbData> {
  if (_cached) return _cached;

  // 1) Resolve latest release tag
  const relRes = await fetchWithTimeout(RELEASE_API, 15_000);
  if (!relRes.ok) throw new Error(`F1DB release API ${relRes.status}`);
  const release = (await relRes.json()) as { tag_name?: string; assets?: Array<{ name: string; browser_download_url: string }> };

  const asset = release.assets?.find((a) => a.name === 'f1db.json');
  if (!asset) throw new Error('F1DB release has no f1db.json asset');

  // 2) Download the full JSON asset (in-memory)
  const dataRes = await fetchWithTimeout(asset.browser_download_url, FETCH_TIMEOUT_MS);
  if (!dataRes.ok) throw new Error(`F1DB asset download ${dataRes.status}`);

  _cached = (await dataRes.json()) as F1DbData;
  return _cached;
}

/** Clear in-process cache (for testing). */
export function clearF1DbCache(): void {
  _cached = null;
}

// ── Ergast-shape normalizers ──────────────────────────────────────────────────

function driverResultToErgast(r: F1DbDriverResult): Record<string, unknown> {
  return {
    position: r.position != null ? String(r.position) : null,
    points: String(r.points ?? 0),
    Driver: {
      driverId: r.driverId ?? '',
      code: r.driver?.code ?? '',
      givenName: r.driver?.givenName ?? '',
      familyName: r.driver?.familyName ?? '',
      nationality: r.driver?.nationality ?? '',
    },
    Constructor: {
      constructorId: r.constructor?.constructorId ?? '',
      name: r.constructor?.name ?? '',
    },
    laps: String(r.laps ?? 0),
    grid: String(r.grid ?? 0),
    status: r.status ?? '',
    FastestLap: r.fastestLap
      ? { rank: String(r.fastestLap.rank ?? ''), Time: { time: r.fastestLap.time ?? '' } }
      : undefined,
  };
}

function qualResultToErgast(r: F1DbQualResult): Record<string, unknown> {
  return {
    position: r.position != null ? String(r.position) : null,
    Driver: {
      driverId: r.driverId ?? '',
      code: r.driver?.code ?? '',
      givenName: r.driver?.givenName ?? '',
      familyName: r.driver?.familyName ?? '',
    },
    Constructor: {
      constructorId: r.constructor?.constructorId ?? '',
      name: r.constructor?.name ?? '',
    },
    Q1: r.q1 ?? '',
    Q2: r.q2 ?? '',
    Q3: r.q3 ?? '',
  };
}

/** Build MRData calendar envelope for a single season. */
export function toMRDataCalendar(season: number, races: F1DbRace[]): MRData {
  const seasonRaces = races.filter((r) => r.year === season);
  return {
    MRData: {
      xmlns: 'http://ergast.com/mrd/1.5',
      series: 'f1',
      url: '',
      limit: String(seasonRaces.length),
      offset: '0',
      total: String(seasonRaces.length),
      RaceTable: {
        season: String(season),
        Races: seasonRaces.map((r) => ({
          season: String(season),
          round: String(r.round),
          raceName: r.name ?? '',
          date: r.date ?? '',
          time: r.time ?? '',
          Circuit: {
            circuitId: r.circuit?.circuitId ?? r.circuitId ?? '',
            circuitName: r.circuit?.name ?? '',
            Location: {
              country: r.circuit?.country ?? '',
              locality: r.circuit?.city ?? '',
            },
          },
        })),
      },
    },
  };
}

/** Build MRData results envelope for a specific season+round. */
export function toMRDataResults(season: number, round: number, races: F1DbRace[]): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const raceArr = race
    ? [
        {
          season: String(season),
          round: String(round),
          raceName: race.name ?? '',
          date: race.date ?? '',
          Circuit: { circuitId: race.circuit?.circuitId ?? '' },
          Results: (race.driverResults ?? []).map(driverResultToErgast),
        },
      ]
    : [];
  return {
    MRData: {
      RaceTable: { season: String(season), round: String(round), Races: raceArr },
    },
  };
}

/** Build MRData qualifying envelope for a specific season+round. */
export function toMRDataQualifying(season: number, round: number, races: F1DbRace[]): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const raceArr = race
    ? [
        {
          season: String(season),
          round: String(round),
          raceName: race.name ?? '',
          date: race.date ?? '',
          Circuit: { circuitId: race.circuit?.circuitId ?? '' },
          QualifyingResults: (race.qualifyingResults ?? []).map(qualResultToErgast),
        },
      ]
    : [];
  return {
    MRData: {
      RaceTable: { season: String(season), round: String(round), Races: raceArr },
    },
  };
}

/** Build MRData sprint envelope for a specific season+round. */
export function toMRDataSprint(season: number, round: number, races: F1DbRace[]): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const sprintResults = race?.sprintResults ?? [];
  const raceArr =
    sprintResults.length > 0
      ? [
          {
            season: String(season),
            round: String(round),
            raceName: race?.name ?? '',
            SprintResults: sprintResults.map(driverResultToErgast),
          },
        ]
      : [];
  return {
    MRData: {
      RaceTable: { season: String(season), round: String(round), Races: raceArr },
    },
  };
}

/** Build MRData driver standings envelope for a season. */
export function toMRDataDriverStandings(season: number, standings: F1DbSeasonStandings): MRData {
  const list = standings.driverStandings ?? [];
  return {
    MRData: {
      StandingsTable: {
        season: String(season),
        StandingsLists: [
          {
            season: String(season),
            round: null,
            DriverStandings: list.map((s) => ({
              position: String(s.position ?? ''),
              positionText: String(s.position ?? ''),
              points: String(s.points ?? 0),
              wins: String(s.wins ?? 0),
              Driver: {
                driverId: s.driverId ?? '',
                code: s.driver?.code ?? '',
                givenName: s.driver?.givenName ?? '',
                familyName: s.driver?.familyName ?? '',
                nationality: s.driver?.nationality ?? '',
              },
              Constructors: s.constructor
                ? [{ constructorId: s.constructorId ?? '', name: s.constructor.name ?? '' }]
                : [],
            })),
          },
        ],
      },
    },
  };
}

/** Build MRData constructor standings envelope for a season. */
export function toMRDataConstructorStandings(
  season: number,
  standings: F1DbSeasonStandings,
): MRData {
  const list = standings.constructorStandings ?? [];
  return {
    MRData: {
      StandingsTable: {
        season: String(season),
        StandingsLists: [
          {
            season: String(season),
            round: null,
            ConstructorStandings: list.map((s) => ({
              position: String(s.position ?? ''),
              positionText: String(s.position ?? ''),
              points: String(s.points ?? 0),
              wins: String(s.wins ?? 0),
              Constructor: {
                constructorId: s.constructorId ?? '',
                name: s.constructor?.name ?? '',
                nationality: s.constructor?.nationality ?? '',
              },
            })),
          },
        ],
      },
    },
  };
}
