/**
 * Jolpica/Ergast adapter (Masterplan Karar E).
 *
 * Used ONLY for current-season live data (cron/sync-f1).
 * Historical data always comes from F1DB — never Jolpica — to avoid rate-limit
 * exhaustion and dependency on a volunteer-hosted service.
 *
 * Retry/backoff mirrors the pattern from old-versions/sync-f1-snapshots.mjs.
 */

export interface MRData {
  MRData: Record<string, unknown>;
}

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const FETCH_DELAY_MS = 1_200; // ~0.8 req/s sustained
const MAX_RETRIES = 6;
const REQUEST_TIMEOUT_MS = 10_000;

let _lastFetchAt = 0;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Rate-limited, retrying fetch to Jolpica.
 * path: relative to /ergast/f1, e.g. "2026.json" or "2026/1/results.json"
 */
export async function fetchJolpica(path: string): Promise<MRData> {
  const url = `${JOLPICA_BASE}/${path.replace(/^\//, '')}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const now = Date.now();
    const wait = Math.max(0, FETCH_DELAY_MS - (now - _lastFetchAt));
    if (wait > 0) await sleep(wait);
    _lastFetchAt = Date.now();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'project-anthology/1.0' },
      });
    } catch (err) {
      clearTimeout(timer);
      if (attempt === MAX_RETRIES) throw new Error(`Jolpica network error for ${path}: ${String(err)}`);
      const backoff = FETCH_DELAY_MS * 2 ** attempt;
      console.warn(`  jolpica retry ${path} (network) in ${backoff}ms`);
      await sleep(backoff);
      continue;
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 404) return { MRData: {} };

    if (res.status === 429 || res.status >= 500) {
      const backoff = FETCH_DELAY_MS * 2 ** attempt;
      console.warn(`  jolpica retry ${path} (${res.status}) in ${backoff}ms`);
      await sleep(backoff);
      continue;
    }

    if (!res.ok) throw new Error(`Jolpica ${res.status} for ${path}`);

    return res.json() as Promise<MRData>;
  }

  throw new Error(`Jolpica exhausted retries for ${path}`);
}

// ── Ergast passthrough — Jolpica already returns MRData shape ─────────────

/** Calendar (race schedule) for a season. */
export async function fetchCalendar(season: number): Promise<MRData> {
  return fetchJolpica(`${season}.json`);
}

/** Driver standings for a season (optionally after a specific round). */
export async function fetchDriverStandings(season: number, round?: number): Promise<MRData> {
  const path = round != null
    ? `${season}/${round}/driverStandings.json`
    : `${season}/driverStandings.json`;
  return fetchJolpica(path);
}

/** Constructor standings for a season. */
export async function fetchConstructorStandings(season: number, round?: number): Promise<MRData> {
  const path = round != null
    ? `${season}/${round}/constructorStandings.json`
    : `${season}/constructorStandings.json`;
  return fetchJolpica(path);
}

/** Race results for a season+round. */
export async function fetchResults(season: number, round: number): Promise<MRData> {
  return fetchJolpica(`${season}/${round}/results.json`);
}

/** Qualifying results for a season+round. */
export async function fetchQualifying(season: number, round: number): Promise<MRData> {
  return fetchJolpica(`${season}/${round}/qualifying.json`);
}

/** Sprint results for a season+round (returns empty MRData if no sprint). */
export async function fetchSprint(season: number, round: number): Promise<MRData> {
  return fetchJolpica(`${season}/${round}/sprint.json`);
}

// ── Shape helpers ──────────────────────────────────────────────────────────

export function hasRaces(data: MRData): boolean {
  const races = (data.MRData as { RaceTable?: { Races?: unknown[] } })?.RaceTable?.Races;
  return Array.isArray(races) && races.length > 0;
}

export function hasDriverStandings(data: MRData): boolean {
  const list = (data.MRData as { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: unknown[] }> } })
    ?.StandingsTable?.StandingsLists?.[0];
  return Array.isArray(list?.DriverStandings) && (list!.DriverStandings!.length > 0);
}

export function hasConstructorStandings(data: MRData): boolean {
  const list = (data.MRData as { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: unknown[] }> } })
    ?.StandingsTable?.StandingsLists?.[0];
  return Array.isArray(list?.ConstructorStandings) && (list!.ConstructorStandings!.length > 0);
}

export function hasResults(data: MRData): boolean {
  const races = (data.MRData as { RaceTable?: { Races?: Array<{ Results?: unknown[] }> } })?.RaceTable?.Races;
  return Array.isArray(races) && races.length > 0 && Array.isArray(races[0]?.Results) && races[0].Results!.length > 0;
}

export function hasQualifyingResults(data: MRData): boolean {
  const races = (data.MRData as { RaceTable?: { Races?: Array<{ QualifyingResults?: unknown[] }> } })?.RaceTable?.Races;
  return Array.isArray(races) && races.length > 0 && Array.isArray(races[0]?.QualifyingResults) && races[0].QualifyingResults!.length > 0;
}

export function hasSprintResults(data: MRData): boolean {
  const races = (data.MRData as { RaceTable?: { Races?: Array<{ SprintResults?: unknown[] }> } })?.RaceTable?.Races;
  return Array.isArray(races) && races.length > 0 && Array.isArray(races[0]?.SprintResults) && races[0].SprintResults!.length > 0;
}
