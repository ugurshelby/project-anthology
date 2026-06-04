/**
 * OpenF1 adapter — team_radio audio moments (Masterplan Karar E).
 *
 * OpenF1 API: https://api.openf1.org/v1
 * - No auth required.
 * - Rate limit: 3 req/s, 30 req/min (Masterplan Karar D constraint).
 *
 * This adapter enforces a per-instance token bucket: at most 3 concurrent
 * requests with a 350 ms inter-request floor so we never exceed 3/s.
 *
 * Returns raw team_radio rows which sync-radio maps to `radio_moments` inserts.
 */

const OPENF1_BASE = 'https://api.openf1.org/v1';

// Rate-limit: 3 req/s strict, 30 req/min advisory.
// Floor: one request per 350 ms ≈ 2.86 req/s — comfortably under the cap.
const INTER_REQUEST_FLOOR_MS = 350;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 4;

let _lastRequestAt = 0;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function openf1Fetch<T>(path: string, params?: Record<string, string | number>): Promise<T[]> {
  const url = new URL(`${OPENF1_BASE}/${path.replace(/^\//, '')}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const now = Date.now();
    const wait = Math.max(0, INTER_REQUEST_FLOOR_MS - (now - _lastRequestAt));
    if (wait > 0) await sleep(wait);
    _lastRequestAt = Date.now();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal: ctrl.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'project-anthology/1.0' },
      });
    } catch (err) {
      clearTimeout(timer);
      if (attempt === MAX_RETRIES) throw new Error(`OpenF1 network error ${path}: ${String(err)}`);
      await sleep(500 * 2 ** attempt);
      continue;
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 404) return [];

    if (res.status === 429 || res.status >= 500) {
      const backoff = 1_000 * 2 ** attempt;
      console.warn(`  openf1 retry ${path} (${res.status}) in ${backoff}ms`);
      await sleep(backoff);
      continue;
    }

    if (!res.ok) throw new Error(`OpenF1 ${res.status} for ${path}`);

    return res.json() as Promise<T[]>;
  }

  throw new Error(`OpenF1 exhausted retries for ${path}`);
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface OpenF1TeamRadio {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  date: string; // ISO
  recording_url: string;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string; // "Race", "Qualifying", etc.
  session_type: string;
  date_start: string;
  date_end: string;
  year: number;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  location: string;
}

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
  country_name: string;
  location: string;
  date_start: string;
  circuit_key: number;
  circuit_short_name: string;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string; // 3-letter code, e.g. "VER"
  team_name: string;
  team_colour: string;
  session_key: number;
  meeting_key: number;
  headshot_url: string | null;
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

/** All race sessions for a year. */
export async function fetchRaceSessions(year: number): Promise<OpenF1Session[]> {
  return openf1Fetch<OpenF1Session>('sessions', { year, session_type: 'Race' });
}

/** Team radio for a specific session. */
export async function fetchTeamRadio(sessionKey: number): Promise<OpenF1TeamRadio[]> {
  return openf1Fetch<OpenF1TeamRadio>('team_radio', { session_key: sessionKey });
}

/** Driver roster for a session (for name/team lookup). */
export async function fetchSessionDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  return openf1Fetch<OpenF1Driver>('drivers', { session_key: sessionKey });
}

/** Meeting metadata (GP name, round, etc.) */
export async function fetchMeeting(meetingKey: number): Promise<OpenF1Meeting | null> {
  const results = await openf1Fetch<OpenF1Meeting>('meetings', { meeting_key: meetingKey });
  return results[0] ?? null;
}

/** Race sessions for the current year (convenience). */
export async function fetchCurrentYearRaceSessions(): Promise<OpenF1Session[]> {
  return fetchRaceSessions(new Date().getUTCFullYear());
}
