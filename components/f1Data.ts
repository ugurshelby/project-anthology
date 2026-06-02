import { resolveTeamUiColor } from '@/config/team-colors';

export type DriverStanding = {
  position: number;
  code: string;
  name: string;
  constructor: string;
  points: number;
  wins: number;
};

export type ConstructorStanding = {
  position: number;
  name: string;
  points: number;
};

export type RaceWeekend = {
  round: number;
  raceName: string;
  circuitName: string;
  circuitId: string;
  country: string;
  locality: string;
  date: string;
  time?: string;
  winnerCode?: string;
};

export type SeasonSnapshot = {
  season: number;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  races: RaceWeekend[];
  fetchedAt: string;
};

export type RaceDetail = {
  podium: Array<{ position: number; code: string; team: string }>;
  pole: { code: string; time: string };
  fastestLap: { code: string; time: string };
  sprintWinner?: string;
  tyreCompounds: Array<'soft' | 'medium' | 'hard'>;
};

export type LiveDriver = {
  position: number;
  driverNumber: number;
  code: string;
  fullName: string;
  teamName: string;
  teamColour: string;
  gap: string;
  interval: string;
  tyre: string;
  inPit: boolean;
  drs: boolean;
  sectors: Array<'fastest' | 'personal' | 'slower' | 'neutral'>;
};

export type LiveConstructor = {
  name: string;
  color: string;
  points: number;
};

export type LiveAtmosphere = {
  airTemp: number | null;
  trackTemp: number | null;
  windSpeed: number | null;
  humidity: number | null;
};

type SectorSample = [number | null, number | null, number | null];
type LatestLapSample = {
  date: string;
  sectors: SectorSample;
};

export type LiveTimingSnapshot = {
  active: boolean;
  sessionLabel: string;
  lapLabel: string;
  raceControl: string;
  raceControlStatus: 'none' | 'sc' | 'vsc' | 'red-flag';
  nextRaceLabel: string;
  sessionKey: string | null;
  meetingName: string;
  tower: LiveDriver[];
  constructors: LiveConstructor[];
  atmosphere: LiveAtmosphere | null;
};

const DEFAULT_PROBE_ORDER = [2025, 2024, 2023] as const;
const STORAGE_DEFAULT_SEASON_KEY = 'f1_default_active_season';
const STORAGE_SNAPSHOT_SUFFIX = '_seasonSnapshot';

const seasonMemoryCache = new Map<number, SeasonSnapshot>();
const seasonRevalidateInFlight = new Map<number, Promise<SeasonSnapshot>>();

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function endpointCacheKey(year: number, endpoint: string): string {
  return `f1_${year}_${endpoint}`;
}

function seasonSnapshotKey(year: number): string {
  return endpointCacheKey(year, STORAGE_SNAPSHOT_SUFFIX);
}

function isValidSeasonYear(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1950 && value <= 2100;
}

function parseSeasonYear(raw: unknown): number | null {
  const num = Number(raw);
  return isValidSeasonYear(num) ? num : null;
}

function readStorageJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  return safeJsonParse<T>(raw);
}

function writeStorageJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort cache writes only.
  }
}

function isValidSeasonSnapshot(input: unknown, expectedSeason: number): input is SeasonSnapshot {
  if (!input || typeof input !== 'object') return false;
  const snapshot = input as Partial<SeasonSnapshot>;
  if (snapshot.season !== expectedSeason) return false;
  return (
    Array.isArray(snapshot.drivers) &&
    Array.isArray(snapshot.constructors) &&
    Array.isArray(snapshot.races) &&
    typeof snapshot.fetchedAt === 'string' &&
    snapshot.fetchedAt.length > 0
  );
}

function hasUsableSeasonData(snapshot: SeasonSnapshot): boolean {
  return snapshot.drivers.length > 0 || snapshot.constructors.length > 0 || snapshot.races.length > 0;
}

function seasonDataSignature(snapshot: SeasonSnapshot): string {
  return JSON.stringify({
    season: snapshot.season,
    drivers: snapshot.drivers,
    constructors: snapshot.constructors,
    races: snapshot.races,
  });
}

async function fetchFromSeasonProxy(path: string): Promise<any> {
  const response = await fetch(`/api/f1-season?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error(`Season proxy failed for ${path}: ${response.status}`);
  }
  return response.json();
}

async function fetchSeasonEndpoint(year: number, endpoint: string, path: string): Promise<any> {
  const key = endpointCacheKey(year, endpoint);
  const cached = readStorageJson<any>(key);
  if (cached) return cached;
  const payload = await fetchFromSeasonProxy(path);
  writeStorageJson(key, payload);
  return payload;
}

function parseDrivers(data: any): DriverStanding[] {
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  return list
    .map((entry: any) => ({
      position: Number(entry?.position ?? 0),
      code: entry?.Driver?.code ?? entry?.Driver?.familyName ?? 'UNK',
      name: `${entry?.Driver?.givenName ?? ''} ${entry?.Driver?.familyName ?? ''}`.trim() || 'Unknown Driver',
      constructor: entry?.Constructors?.[0]?.name ?? 'Unknown Constructor',
      points: Number(entry?.points ?? 0),
      wins: Number(entry?.wins ?? 0),
    }))
    .filter(
      (entry: DriverStanding) =>
        Number.isFinite(entry.position) &&
        entry.position > 0 &&
        Number.isFinite(entry.points) &&
        Number.isFinite(entry.wins) &&
        Boolean(entry.code),
    );
}

function parseConstructors(data: any): ConstructorStanding[] {
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  return list
    .map((entry: any) => ({
      position: Number(entry?.position ?? 0),
      name: entry?.Constructor?.name ?? 'Unknown Constructor',
      points: Number(entry?.points ?? 0),
    }))
    .filter((entry: ConstructorStanding) => Number.isFinite(entry.position) && entry.position > 0 && Number.isFinite(entry.points) && Boolean(entry.name));
}

function parseRaces(calendarData: any, resultsData: any): RaceWeekend[] {
  const calendarRaces = calendarData?.MRData?.RaceTable?.Races ?? [];
  const resultsRaces = resultsData?.MRData?.RaceTable?.Races ?? [];
  const winnerByRound = new Map<number, string>();

  for (const race of resultsRaces) {
    const round = Number(race?.round ?? 0);
    const winnerCode = race?.Results?.[0]?.Driver?.code ?? race?.Results?.[0]?.Driver?.familyName;
    if (round > 0 && winnerCode) winnerByRound.set(round, winnerCode);
  }

  return calendarRaces
    .map((race: any) => {
      const round = Number(race?.round ?? 0);
      const circuit = race?.Circuit ?? {};
      const location = circuit?.Location ?? {};
      return {
        round,
        raceName: race?.raceName ?? 'Unnamed Grand Prix',
        circuitName: circuit?.circuitName ?? 'Unknown Circuit',
        circuitId: String(circuit?.circuitId ?? '').trim().toLowerCase(),
        country: String(location?.country ?? '').trim(),
        locality: String(location?.locality ?? '').trim(),
        date: race?.date ?? '',
        time: race?.time,
        winnerCode: winnerByRound.get(round),
      };
    })
    .filter(
      (race: RaceWeekend) =>
        Number.isFinite(race.round) && race.round > 0 && Boolean(race.raceName) && Boolean(race.circuitName),
    );
}

async function fetchSeasonSnapshot(year: number): Promise<SeasonSnapshot> {
  const [driversData, constructorsData, calendarData, resultsData] = await Promise.all([
    fetchSeasonEndpoint(year, 'driverStandings', `${year}/driverStandings`),
    fetchSeasonEndpoint(year, 'constructorStandings', `${year}/constructorStandings`),
    fetchSeasonEndpoint(year, 'calendar', `${year}`),
    fetchSeasonEndpoint(year, 'results', `${year}/results`),
  ]);

  const snapshot: SeasonSnapshot = {
    season: year,
    drivers: parseDrivers(driversData),
    constructors: parseConstructors(constructorsData),
    races: parseRaces(calendarData, resultsData),
    fetchedAt: new Date().toISOString(),
  };

  if (!hasUsableSeasonData(snapshot)) {
    throw new Error(`Invalid or empty season payload for ${year}.`);
  }

  seasonMemoryCache.set(year, snapshot);
  writeStorageJson(seasonSnapshotKey(year), snapshot);
  return snapshot;
}

export async function resolveDefaultSeasonYear(): Promise<number> {
  const persisted = parseSeasonYear(readStorageJson<number>(STORAGE_DEFAULT_SEASON_KEY));
  if (persisted && persisted !== 2026) return persisted;

  for (const year of DEFAULT_PROBE_ORDER) {
    try {
      const payload = await fetchSeasonEndpoint(year, 'driverStandings', `${year}/driverStandings`);
      if (parseDrivers(payload).length > 0) {
        writeStorageJson(STORAGE_DEFAULT_SEASON_KEY, year);
        return year;
      }
    } catch {
      // Keep probing older seasons.
    }
  }

  writeStorageJson(STORAGE_DEFAULT_SEASON_KEY, 2025);
  return 2025;
}

export function getDefaultSeasonYear(): number {
  const persisted = parseSeasonYear(readStorageJson<number>(STORAGE_DEFAULT_SEASON_KEY));
  if (persisted && persisted !== 2026) return persisted;
  return 2025;
}

export function getSeasonSnapshotFromCache(season: number): SeasonSnapshot | null {
  const memoryCached = seasonMemoryCache.get(season);
  if (memoryCached && isValidSeasonSnapshot(memoryCached, season)) {
    return memoryCached;
  }

  const persisted = readStorageJson<SeasonSnapshot>(seasonSnapshotKey(season));
  if (persisted && isValidSeasonSnapshot(persisted, season)) {
    seasonMemoryCache.set(season, persisted);
    return persisted;
  }
  return null;
}

type LoadSeasonSnapshotOptions = {
  revalidate?: boolean;
  onRevalidated?: (freshSnapshot: SeasonSnapshot) => void;
};

function queueSeasonRevalidation(
  season: number,
  currentSnapshot: SeasonSnapshot,
  onRevalidated?: (freshSnapshot: SeasonSnapshot) => void,
): void {
  let inFlight = seasonRevalidateInFlight.get(season);
  if (!inFlight) {
    inFlight = fetchSeasonSnapshot(season).finally(() => {
      seasonRevalidateInFlight.delete(season);
    });
    seasonRevalidateInFlight.set(season, inFlight);
  }

  inFlight
    .then((freshSnapshot) => {
      if (!onRevalidated) return;
      if (seasonDataSignature(currentSnapshot) !== seasonDataSignature(freshSnapshot)) {
        onRevalidated(freshSnapshot);
      }
    })
    .catch(() => {
      // Keep stale cache on background refresh failures.
    });
}

export async function loadSeasonSnapshot(
  season: number,
  options: LoadSeasonSnapshotOptions = {},
): Promise<SeasonSnapshot> {
  const { revalidate = true, onRevalidated } = options;
  const cached = getSeasonSnapshotFromCache(season);
  if (cached) {
    if (revalidate) {
      queueSeasonRevalidation(season, cached, onRevalidated);
    }
    return cached;
  }

  const fresh = await fetchSeasonSnapshot(season);
  if (onRevalidated) onRevalidated(fresh);
  return fresh;
}

async function fetchRaceDetailProxy(path: string): Promise<any> {
  const response = await fetch(`/api/f1-season?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error(`Race detail fetch failed for ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadRaceDetail(year: number, round: number): Promise<RaceDetail> {
  const key = endpointCacheKey(year, `raceDetail_${round}`);
  const cached = readStorageJson<RaceDetail>(key);
  if (cached) return cached;

  const [results, qualifying, sprint] = await Promise.all([
    fetchRaceDetailProxy(`${year}/${round}/results`),
    fetchRaceDetailProxy(`${year}/${round}/qualifying`),
    fetchRaceDetailProxy(`${year}/${round}/sprint`).catch(() => null),
  ]);

  const raceEntry = results?.MRData?.RaceTable?.Races?.[0];
  const resultRows = Array.isArray(raceEntry?.Results) ? raceEntry.Results : [];

  const podium = resultRows.slice(0, 3).map((row: any, index: number) => ({
    position: index + 1,
    code: row?.Driver?.code ?? row?.Driver?.familyName ?? 'UNK',
    team: row?.Constructor?.name ?? 'Unknown Team',
  }));

  const poleEntry = qualifying?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0];
  const fastestEntry = resultRows.find((row: any) => String(row?.FastestLap?.rank ?? '') === '1');

  const detail: RaceDetail = {
    podium,
    pole: {
      code: poleEntry?.Driver?.code ?? poleEntry?.Driver?.familyName ?? 'TBA',
      time: poleEntry?.Q3 ?? poleEntry?.Q2 ?? poleEntry?.Q1 ?? '—',
    },
    fastestLap: {
      code: fastestEntry?.Driver?.code ?? fastestEntry?.Driver?.familyName ?? '—',
      time: fastestEntry?.FastestLap?.Time?.time ?? '—',
    },
    sprintWinner:
      sprint?.MRData?.RaceTable?.Races?.[0]?.SprintResults?.[0]?.Driver?.code ??
      sprint?.MRData?.RaceTable?.Races?.[0]?.SprintResults?.[0]?.Driver?.familyName,
    tyreCompounds: ['soft', 'medium', 'hard'],
  };

  writeStorageJson(key, detail);
  return detail;
}

function sortByDateDesc<T extends { date_start?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.date_start ?? '').localeCompare(a.date_start ?? ''));
}

function sortByDateAsc<T extends { date_start?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date_start ?? '').localeCompare(b.date_start ?? ''));
}

function sortByDateValueDesc<T extends { date?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => String(b?.date ?? '').localeCompare(String(a?.date ?? '')));
}

function normalizeTeamColor(input: unknown, teamName?: string): string {
  return resolveTeamUiColor(input, teamName);
}

function toSectorValue(input: unknown): number | null {
  const numeric = Number(input);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function inferRaceControlStatus(message: string): 'none' | 'sc' | 'vsc' | 'red-flag' {
  const upper = message.toUpperCase();
  if (upper.includes('RED FLAG')) return 'red-flag';
  if (upper.includes('VIRTUAL SAFETY CAR') || /\bVSC\b/.test(upper)) return 'vsc';
  if (upper.includes('SAFETY CAR') || /\bSC\b/.test(upper) || upper.includes('FULL COURSE YELLOW')) {
    return 'sc';
  }
  return 'none';
}

function formatNextRaceLabel(session: any): string {
  const meeting = session?.meeting_name ?? session?.country_name ?? 'TBC';
  const dateStart = String(session?.date_start ?? '').slice(0, 10);
  return dateStart ? `${meeting} (${dateStart})` : String(meeting);
}

async function fetchLiveJson(path: string, params: Record<string, string> = {}): Promise<any> {
  const query = new URLSearchParams({ path, ...params });
  const response = await fetch(`/api/f1-live?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Live proxy failed for ${path}: ${response.status}`);
  }
  return response.json();
}

function pickLatestPositions(rows: any[]): Map<number, any> {
  const map = new Map<number, any>();
  for (const row of rows) {
    const driverNumber = Number(row?.driver_number ?? 0);
    if (!driverNumber) continue;
    const prior = map.get(driverNumber);
    if (!prior || String(row?.date ?? '') > String(prior?.date ?? '')) {
      map.set(driverNumber, row);
    }
  }
  return map;
}

export async function loadLiveTimingSnapshot(): Promise<LiveTimingSnapshot> {
  const sessions = await fetchLiveJson('sessions', { session_name: 'Race' });
  const sessionRows = Array.isArray(sessions) ? sessions : [];
  const orderedSessionsDesc = sortByDateDesc(sessionRows);
  const orderedSessionsAsc = sortByDateAsc(sessionRows);
  const now = Date.now();
  const activeSession = orderedSessionsDesc.find((session) => {
    const start = Date.parse(String(session?.date_start ?? ''));
    const end = Date.parse(String(session?.date_end ?? ''));
    if (!Number.isFinite(start)) return false;
    if (Number.isFinite(end)) return start <= now && now <= end;
    return start <= now;
  });
  const upcomingSession = orderedSessionsAsc.find((session) => {
    const start = Date.parse(String(session?.date_start ?? ''));
    return Number.isFinite(start) && start > now;
  });

  if (!activeSession?.session_key) {
    return {
      active: false,
      sessionLabel: 'NO ACTIVE SESSION',
      lapLabel: 'LAP —',
      raceControl: '',
      raceControlStatus: 'none',
      nextRaceLabel: upcomingSession ? formatNextRaceLabel(upcomingSession) : 'TBC',
      sessionKey: null,
      meetingName: '',
      tower: [],
      constructors: [],
      atmosphere: null,
    };
  }

  const sessionKey = String(activeSession.session_key);
  const [positions, drivers, raceControl, weatherRows, lapsRows, sessionResults] = await Promise.all([
    fetchLiveJson('position', { session_key: sessionKey }),
    fetchLiveJson('drivers', { session_key: sessionKey }),
    fetchLiveJson('race_control', { session_key: sessionKey }),
    fetchLiveJson('weather', { session_key: sessionKey }),
    fetchLiveJson('laps', { session_key: sessionKey }),
    fetchLiveJson('session_result', { session_key: sessionKey }),
  ]);

  const driversByNumber = new Map<number, any>();
  for (const row of Array.isArray(drivers) ? drivers : []) {
    driversByNumber.set(Number(row?.driver_number ?? 0), row);
  }

  const latestByDriver = pickLatestPositions(Array.isArray(positions) ? positions : []);
  const sessionBestBySector = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const personalBestByDriver = new Map<number, [number, number, number]>();
  const latestLapByDriver = new Map<number, LatestLapSample>();

  for (const lap of Array.isArray(lapsRows) ? lapsRows : []) {
    const driverNumber = Number(lap?.driver_number ?? 0);
    if (!driverNumber) continue;
    const sectors: SectorSample = [
      toSectorValue(lap?.duration_sector_1),
      toSectorValue(lap?.duration_sector_2),
      toSectorValue(lap?.duration_sector_3),
    ];
    const date = String(lap?.date_start ?? lap?.date ?? '');
    const personal = personalBestByDriver.get(driverNumber) ?? [
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ];

    for (let idx = 0; idx < 3; idx += 1) {
      const value = sectors[idx];
      if (value == null) continue;
      personal[idx] = Math.min(personal[idx], value);
      sessionBestBySector[idx] = Math.min(sessionBestBySector[idx], value);
    }
    personalBestByDriver.set(driverNumber, personal as [number, number, number]);

    const priorDate = String(latestLapByDriver.get(driverNumber)?.date ?? '');
    if (!latestLapByDriver.has(driverNumber) || date >= priorDate) {
      latestLapByDriver.set(driverNumber, { date, sectors });
    }
  }

  const tower: LiveDriver[] = [...latestByDriver.values()]
    .map((row) => {
      const driverNumber = Number(row?.driver_number ?? 0);
      const driver = driversByNumber.get(driverNumber);
      const latestSectors: SectorSample = latestLapByDriver.get(driverNumber)?.sectors ?? [null, null, null];
      const personalBest = personalBestByDriver.get(driverNumber) ?? [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
      ];
      const sectors: Array<'fastest' | 'personal' | 'slower' | 'neutral'> = latestSectors.map((value, idx) => {
        if (value == null) return 'neutral';
        if (Math.abs(value - sessionBestBySector[idx]) <= 0.0001) return 'fastest';
        if (Math.abs(value - personalBest[idx]) <= 0.0001) return 'personal';
        return 'slower';
      });

      return {
        position: Number(row?.position ?? 99),
        driverNumber,
        code: driver?.name_acronym ?? `#${driverNumber}`,
        fullName: `${driver?.first_name ?? ''} ${driver?.last_name ?? ''}`.trim() || driver?.full_name || 'Unknown Driver',
        teamName: driver?.team_name ?? 'Unknown Team',
        teamColour: normalizeTeamColor(driver?.team_colour, driver?.team_name),
        gap: row?.gap_to_leader ? `+${row.gap_to_leader}` : 'LEADER',
        interval: row?.interval ?? '—',
        tyre: String(driver?.compound ?? 'UNK').toUpperCase().slice(0, 1),
        inPit: Boolean(row?.in_pit),
        drs: Boolean(Number(row?.drs ?? 0) >= 10),
        sectors,
      };
    })
    .sort((a, b) => a.position - b.position);

  const constructorPoints = new Map<string, number>();
  for (const resultRow of Array.isArray(sessionResults) ? sessionResults : []) {
    const driverNumber = Number(resultRow?.driver_number ?? 0);
    const driver = driversByNumber.get(driverNumber);
    const teamName = String(driver?.team_name ?? resultRow?.team_name ?? '').trim();
    if (!teamName) continue;
    const points = Number(resultRow?.points ?? resultRow?.score ?? 0);
    constructorPoints.set(teamName, (constructorPoints.get(teamName) ?? 0) + (Number.isFinite(points) ? points : 0));
  }

  const constructorsMap = new Map<string, LiveConstructor>();
  for (const driver of tower) {
    if (!constructorsMap.has(driver.teamName)) {
      constructorsMap.set(driver.teamName, {
        name: driver.teamName,
        color: driver.teamColour,
        points: constructorPoints.get(driver.teamName) ?? 0,
      });
    }
  }
  const constructors = [...constructorsMap.values()].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  const raceControlRows = Array.isArray(raceControl) ? raceControl : [];
  const latestControl = sortByDateValueDesc(raceControlRows)[0];
  const raceControlMessage = latestControl?.message ?? '';
  const raceControlStatus = inferRaceControlStatus(raceControlMessage);
  const weather = sortByDateValueDesc(Array.isArray(weatherRows) ? weatherRows : [])[0];
  const atmosphere: LiveAtmosphere | null = weather
    ? {
        airTemp: Number.isFinite(Number(weather?.air_temperature)) ? Number(weather.air_temperature) : null,
        trackTemp: Number.isFinite(Number(weather?.track_temperature)) ? Number(weather.track_temperature) : null,
        windSpeed: Number.isFinite(Number(weather?.wind_speed)) ? Number(weather.wind_speed) : null,
        humidity: Number.isFinite(Number(weather?.humidity)) ? Number(weather.humidity) : null,
      }
    : null;

  const lapNumber = Number(latestControl?.lap_number ?? latestControl?.lap ?? 0);
  const lapValue = lapNumber > 0 ? `LAP ${lapNumber}` : `LAP ${tower.length > 0 ? 'LIVE' : '—'}`;
  const nextRaceLabel = upcomingSession ? formatNextRaceLabel(upcomingSession) : 'TBC';

  return {
    active: true,
    sessionLabel: activeSession?.session_name ?? 'LIVE SESSION',
    lapLabel: lapValue,
    raceControl: raceControlMessage,
    raceControlStatus,
    nextRaceLabel,
    sessionKey,
    meetingName: String(activeSession?.meeting_name ?? activeSession?.country_name ?? ''),
    tower,
    constructors,
    atmosphere,
  };
}
