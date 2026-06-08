/**
 * F1DB GitHub Release adapter (Masterplan Karar E).
 *
 * F1DB publishes CalVer JSON releases at:
 *   https://github.com/f1db/f1db/releases
 * As of v2026, the asset is `f1db-json-single.zip` containing `f1db.json`.
 *
 * This adapter:
 *  1. Fetches the latest release tag from GitHub API (no auth needed for public repos).
 *  2. Downloads the `f1db-json-single.zip` asset in-memory and extracts `f1db.json` — NO disk writes.
 *  3. Exposes per-season extractor functions that return Ergast-shaped MRData
 *     objects so `lib/f1Ingest.ts` can upsert without knowing the source.
 *
 * Rate-limit: GitHub CDN / raw assets have no per-minute limit for anonymous
 * reads at this scale. We fetch exactly once per seed invocation.
 */

import { unzipSync } from 'fflate';

export interface MRData {
  MRData: Record<string, unknown>;
}

const RELEASE_API = 'https://api.github.com/repos/f1db/f1db/releases/latest';
const FETCH_TIMEOUT_MS = 120_000; // 120 s — zip download

// F1DB is fully normalized: result/standing items carry only IDs; driver and
// constructor names live in top-level `drivers[]` / `constructors[]` lookups.

interface F1DbRace {
  year: number;
  round: number;
  name?: string;
  date?: string;
  time?: string;
  circuitId?: string;
  circuit?: { circuitId?: string; name?: string; country?: string; city?: string };
  raceResults?: F1DbDriverResult[];
  qualifyingResults?: F1DbQualResult[];
  sprintRaceResults?: F1DbDriverResult[];
}

interface F1DbDriverResult {
  driverId?: string;
  constructorId?: string;
  positionNumber?: number | null;
  positionText?: string | null;
  points?: number;
  laps?: number;
  gridPositionNumber?: number | null;
  reasonRetired?: string | null;
  fastestLap?: boolean;
}

interface F1DbQualResult {
  driverId?: string;
  constructorId?: string;
  positionNumber?: number | null;
  positionText?: string | null;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
}

interface F1DbStanding {
  driverId?: string;
  constructorId?: string;
  positionNumber?: number | null;
  positionText?: string | null;
  points?: number;
}

interface F1DbSeasonStandings {
  year: number;
  driverStandings?: F1DbStanding[];
  constructorStandings?: F1DbStanding[];
}

interface F1DbDriver {
  id?: string;
  firstName?: string;
  lastName?: string;
  abbreviation?: string;
  nationalityCountryId?: string;
}

interface F1DbConstructor {
  id?: string;
  name?: string;
  fullName?: string;
}

export interface F1DbData {
  races?: F1DbRace[];
  drivers?: F1DbDriver[];
  constructors?: F1DbConstructor[];
  seasons?: Array<{
    year: number;
    rounds?: number;
    driverStandings?: F1DbStanding[];
    constructorStandings?: F1DbStanding[];
  }>;
}

/** Lookup maps from id → name records, built once per loaded F1DB instance. */
export interface F1DbLookups {
  drivers: Map<string, F1DbDriver>;
  constructors: Map<string, F1DbConstructor>;
}

let _lookups: F1DbLookups | null = null;

/** Build (and memoize) id→record lookups from the loaded F1DB data. */
export function getF1DbLookups(db: F1DbData): F1DbLookups {
  if (_lookups) return _lookups;
  const drivers = new Map<string, F1DbDriver>();
  for (const d of db.drivers ?? []) if (d.id) drivers.set(d.id, d);
  const constructors = new Map<string, F1DbConstructor>();
  for (const c of db.constructors ?? []) if (c.id) constructors.set(c.id, c);
  _lookups = { drivers, constructors };
  return _lookups;
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

  // Accept both the old bare JSON and the current zip packaging
  const jsonAsset = release.assets?.find((a) => a.name === 'f1db.json');
  const zipAsset = release.assets?.find((a) => a.name === 'f1db-json-single.zip');
  const asset = jsonAsset ?? zipAsset;
  if (!asset) throw new Error('F1DB release: neither f1db.json nor f1db-json-single.zip found');

  // 2) Download the asset in-memory
  const dataRes = await fetchWithTimeout(asset.browser_download_url, FETCH_TIMEOUT_MS);
  if (!dataRes.ok) throw new Error(`F1DB asset download ${dataRes.status}`);

  if (asset.name.endsWith('.zip')) {
    const buf = await dataRes.arrayBuffer();
    const files = unzipSync(new Uint8Array(buf));
    const jsonEntry = Object.keys(files).find((k) => k.endsWith('f1db.json'));
    if (!jsonEntry) throw new Error('f1db.json not found inside zip');
    const text = new TextDecoder().decode(files[jsonEntry]);
    _cached = JSON.parse(text) as F1DbData;
  } else {
    _cached = (await dataRes.json()) as F1DbData;
  }
  return _cached;
}

/** Clear in-process cache (for testing). */
export function clearF1DbCache(): void {
  _cached = null;
  _lookups = null;
}

// ── Ergast-shape normalizers ──────────────────────────────────────────────────

/** Ergast-shape Driver block resolved from an id via the lookup map. */
function ergastDriver(driverId: string | undefined, lk: F1DbLookups): Record<string, unknown> {
  const d = driverId ? lk.drivers.get(driverId) : undefined;
  return {
    driverId: driverId ?? '',
    code: d?.abbreviation ?? '',
    givenName: d?.firstName ?? '',
    familyName: d?.lastName ?? '',
    nationality: d?.nationalityCountryId ?? '',
  };
}

/** Ergast-shape Constructor block resolved from an id via the lookup map. */
function ergastConstructor(
  constructorId: string | undefined,
  lk: F1DbLookups,
): Record<string, unknown> {
  const c = constructorId ? lk.constructors.get(constructorId) : undefined;
  return {
    constructorId: constructorId ?? '',
    name: c?.name ?? c?.fullName ?? '',
  };
}

/** A position string Ergast consumers expect ("1", "R", …). */
function ergastPosition(r: { positionNumber?: number | null; positionText?: string | null }): string | null {
  if (r.positionNumber != null) return String(r.positionNumber);
  if (r.positionText) return r.positionText;
  return null;
}

function driverResultToErgast(r: F1DbDriverResult, lk: F1DbLookups): Record<string, unknown> {
  return {
    position: ergastPosition(r),
    points: String(r.points ?? 0),
    Driver: ergastDriver(r.driverId, lk),
    Constructor: ergastConstructor(r.constructorId, lk),
    laps: String(r.laps ?? 0),
    grid: String(r.gridPositionNumber ?? 0),
    status: r.reasonRetired ?? '',
    // F1DB exposes the fastest lap only as a boolean flag (no time/rank).
    FastestLap: r.fastestLap ? { rank: '1' } : undefined,
  };
}

function qualResultToErgast(r: F1DbQualResult, lk: F1DbLookups): Record<string, unknown> {
  return {
    position: ergastPosition(r),
    Driver: ergastDriver(r.driverId, lk),
    Constructor: ergastConstructor(r.constructorId, lk),
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
export function toMRDataResults(
  season: number,
  round: number,
  races: F1DbRace[],
  lk: F1DbLookups,
): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const raceArr = race
    ? [
        {
          season: String(season),
          round: String(round),
          raceName: race.name ?? '',
          date: race.date ?? '',
          Circuit: { circuitId: race.circuit?.circuitId ?? race.circuitId ?? '' },
          Results: (race.raceResults ?? []).map((r) => driverResultToErgast(r, lk)),
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
export function toMRDataQualifying(
  season: number,
  round: number,
  races: F1DbRace[],
  lk: F1DbLookups,
): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const raceArr = race
    ? [
        {
          season: String(season),
          round: String(round),
          raceName: race.name ?? '',
          date: race.date ?? '',
          Circuit: { circuitId: race.circuit?.circuitId ?? race.circuitId ?? '' },
          QualifyingResults: (race.qualifyingResults ?? []).map((r) => qualResultToErgast(r, lk)),
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
export function toMRDataSprint(
  season: number,
  round: number,
  races: F1DbRace[],
  lk: F1DbLookups,
): MRData {
  const race = races.find((r) => r.year === season && r.round === round);
  const sprintResults = race?.sprintRaceResults ?? [];
  const raceArr =
    sprintResults.length > 0
      ? [
          {
            season: String(season),
            round: String(round),
            raceName: race?.name ?? '',
            SprintResults: sprintResults.map((r) => driverResultToErgast(r, lk)),
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
export function toMRDataDriverStandings(
  season: number,
  standings: F1DbSeasonStandings,
  lk: F1DbLookups,
): MRData {
  const list = standings.driverStandings ?? [];
  return {
    MRData: {
      StandingsTable: {
        season: String(season),
        StandingsLists: [
          {
            season: String(season),
            round: null,
            DriverStandings: list.map((s) => {
              const pos = ergastPosition(s) ?? '';
              return {
                position: pos,
                positionText: pos,
                points: String(s.points ?? 0),
                wins: '0', // F1DB season standings don't carry a win count.
                Driver: ergastDriver(s.driverId, lk),
                Constructors: s.constructorId
                  ? [ergastConstructor(s.constructorId, lk)]
                  : [],
              };
            }),
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
  lk: F1DbLookups,
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
            ConstructorStandings: list.map((s) => {
              const pos = ergastPosition(s) ?? '';
              return {
                position: pos,
                positionText: pos,
                points: String(s.points ?? 0),
                wins: '0', // F1DB season standings don't carry a win count.
                Constructor: ergastConstructor(s.constructorId, lk),
              };
            }),
          },
        ],
      },
    },
  };
}
