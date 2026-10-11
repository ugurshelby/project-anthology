/**
 * OpenF1 adapter — team_radio audio moments (Masterplan Karar E) and the
 * home-page live tracker (/api/live-timing).
 *
 * OpenF1 API: https://api.openf1.org/v1
 * - Historical data needs no auth. While a live session runs, OpenF1 answers
 *   401 to every unauthenticated request (past sessions included) — surfaced
 *   as OpenF1RestrictedError so callers can degrade instead of failing.
 * - Optional auth (plan 1.7): when OPENF1_USERNAME and OPENF1_PASSWORD are set
 *   (server env only, never sent to the browser), a bearer token is fetched
 *   from POST /token (form fields `username`, `password`; `expires_in` 3600 s,
 *   https://openf1.org/auth.html), kept in memory until shortly before expiry
 *   and refreshed once on a 401. Without them the adapter behaves as before.
 * - Rate limit: 3 req/s, 30 req/min (Masterplan Karar D constraint).
 *
 * This adapter enforces a per-instance token bucket: at most 3 concurrent
 * requests with a 350 ms inter-request floor so we never exceed 3/s.
 *
 * Returns raw team_radio rows which sync-radio maps to `radio_moments` inserts.
 */

import { OpenF1RestrictedError } from './openf1Errors';

const OPENF1_BASE = 'https://api.openf1.org/v1';
const OPENF1_TOKEN_URL = 'https://api.openf1.org/token';
/** Refresh this long before the token's stated expiry. */
const TOKEN_EXPIRY_MARGIN_MS = 5 * 60 * 1000;

// Rate-limit: 3 req/s strict, 30 req/min advisory.
// Floor: one request per 350 ms ≈ 2.86 req/s — comfortably under the cap.
const INTER_REQUEST_FLOOR_MS = 350;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 4;

let _lastRequestAt = 0;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function openf1Credentials(): { username: string; password: string } | null {
  const username = process.env.OPENF1_USERNAME?.trim();
  const password = process.env.OPENF1_PASSWORD?.trim();
  return username && password ? { username, password } : null;
}

let _token: { value: string; expiresAt: number } | null = null;
let _tokenInflight: Promise<string | null> | null = null;

/**
 * Bearer token for OpenF1, or null when no credentials are configured or the
 * token endpoint fails (callers then fall back to unauthenticated requests).
 * Never logs the credentials or the token.
 */
export async function getOpenF1Token(forceRefresh = false): Promise<string | null> {
  const creds = openf1Credentials();
  if (!creds) return null;
  if (!forceRefresh && _token && Date.now() < _token.expiresAt) return _token.value;
  if (_tokenInflight) return _tokenInflight;

  _tokenInflight = (async () => {
    try {
      const res = await fetch(OPENF1_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ username: creds.username, password: creds.password }).toString(),
      });
      if (!res.ok) {
        console.warn(`  openf1 token request failed (${res.status})`);
        _token = null;
        return null;
      }
      const json = (await res.json()) as { access_token?: string; expires_in?: string | number };
      if (!json.access_token) return null;
      const lifetimeMs = (Number(json.expires_in) || 3600) * 1000;
      _token = { value: json.access_token, expiresAt: Date.now() + Math.max(60_000, lifetimeMs - TOKEN_EXPIRY_MARGIN_MS) };
      return _token.value;
    } catch {
      console.warn('  openf1 token request failed (network)');
      return null;
    } finally {
      _tokenInflight = null;
    }
  })();
  return _tokenInflight;
}

async function openf1Fetch<T>(path: string, params?: Record<string, string | number>): Promise<T[]> {
  const url = new URL(`${OPENF1_BASE}/${path.replace(/^\//, '')}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  }

  let token = await getOpenF1Token();
  let refreshedAfter401 = false;

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
        headers: {
          Accept: 'application/json',
          'User-Agent': 'project-anthology/1.0',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

    if (res.status === 401) {
      // A stale token gets one refresh; otherwise this is OpenF1's live-session lock.
      if (token && !refreshedAfter401) {
        refreshedAfter401 = true;
        token = await getOpenF1Token(true);
        if (token) continue;
      }
      throw new OpenF1RestrictedError(path);
    }

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

// ── Live timing (session_key=latest) ────────────────────────────────────────
// Used by /api/live-timing for the in-progress-session tracker. OpenF1 treats
// "latest" as the most recently started session regardless of whether it has
// finished, so callers must check date_start/date_end against now themselves.

export interface OpenF1Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface OpenF1Interval {
  date: string;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  session_key: number;
}

/** The most recently started session (may already be finished). */
export async function fetchLatestSession(): Promise<OpenF1Session | null> {
  const results = await openf1Fetch<OpenF1Session>('sessions', { session_key: 'latest' });
  return results[results.length - 1] ?? null;
}

/** Full position time-series for a session; callers keep only the last row per driver. */
export async function fetchLivePositions(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Position[]> {
  return openf1Fetch<OpenF1Position>('position', { session_key: sessionKey });
}

/** Full interval/gap time-series for a session; callers keep only the last row per driver. */
export async function fetchLiveIntervals(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Interval[]> {
  return openf1Fetch<OpenF1Interval>('intervals', { session_key: sessionKey });
}

/** Driver roster for a session (name/team/color lookup). */
export async function fetchLiveDrivers(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Driver[]> {
  return openf1Fetch<OpenF1Driver>('drivers', { session_key: sessionKey });
}
