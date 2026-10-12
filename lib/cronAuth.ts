/**
 * Shared cron-route auth (Council B-5 + B-6).
 *
 * Two ways in, both fail-closed:
 *  1. `Authorization: Bearer <secret>` — Vercel Cron injects it when the env
 *     var is named exactly CRON_SECRET; GitHub Actions and manual triggers use
 *     it too (legacy CRON_SECRET_KEY still accepted).
 *  2. A QStash request signature (`Upstash-Signature`, HS256 JWT) verified with
 *     QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY. QStash schedules
 *     therefore carry no shared secret at all (plan 1.6). Checked like
 *     Upstash's own Receiver (sdk-qstash-ts src/receiver.ts): issuer "Upstash",
 *     exp/nbf, body = base64url(SHA-256(raw body)); additionally the `sub` URL
 *     must name the same route path, so a signature for one route cannot be
 *     replayed against another.
 *
 * Comparisons are constant-time (timingSafeEqual).
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

interface CronRequest {
  headers: { get(name: string): string | null };
  /** Absolute request URL (NextRequest.url); needed for the QStash `sub` check. */
  url?: string;
}

/** True when the request's Bearer token matches a configured cron secret. */
function hasCronBearer(req: CronRequest): boolean {
  const header = req.headers.get('authorization') ?? '';
  const secrets = [process.env.CRON_SECRET, process.env.CRON_SECRET_KEY].filter(
    (s): s is string => Boolean(s),
  );
  return secrets.some((secret) => safeEqual(header, `Bearer ${secret}`));
}

/** Allowed clock skew for exp/nbf, seconds. */
const QSTASH_CLOCK_TOLERANCE_S = 30;

function base64urlToBuffer(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/**
 * Verify a QStash `Upstash-Signature` JWT against the signing keys. Pure, so
 * it can be unit-tested with a self-signed token. Returns false on any doubt.
 */
export function verifyQStashSignature(input: {
  token: string;
  keys: string[];
  /** Pathname of the route being called, e.g. /api/cron/sync-f1. */
  pathname: string;
  /** Raw request body ("" for GET). */
  body?: string;
  nowSec?: number;
}): boolean {
  const parts = input.token.split('.');
  if (parts.length !== 3) return false;
  const [h, p, sig] = parts;

  let header: { alg?: string };
  let payload: { iss?: string; sub?: string; exp?: number; nbf?: number; body?: string };
  try {
    header = JSON.parse(base64urlToBuffer(h).toString('utf8'));
    payload = JSON.parse(base64urlToBuffer(p).toString('utf8'));
  } catch {
    return false;
  }
  if (header.alg !== 'HS256') return false;

  const given = base64urlToBuffer(sig);
  const signedBy = input.keys.some((key) => {
    const expected = createHmac('sha256', key).update(`${h}.${p}`).digest();
    return expected.length === given.length && timingSafeEqual(expected, given);
  });
  if (!signedBy) return false;

  const now = input.nowSec ?? Math.floor(Date.now() / 1000);
  if (payload.iss !== 'Upstash') return false;
  if (typeof payload.exp !== 'number' || now > payload.exp + QSTASH_CLOCK_TOLERANCE_S) return false;
  if (typeof payload.nbf === 'number' && now + QSTASH_CLOCK_TOLERANCE_S < payload.nbf) return false;

  let subPath: string;
  try {
    subPath = new URL(payload.sub ?? '').pathname.replace(/\/+$/, '');
  } catch {
    return false;
  }
  if (subPath !== input.pathname.replace(/\/+$/, '')) return false;

  const bodyHash = createHash('sha256').update(input.body ?? '', 'utf8').digest('base64url');
  return (payload.body ?? '').replace(/=+$/, '') === bodyHash.replace(/=+$/, '');
}

function hasQStashSignature(req: CronRequest): boolean {
  const token = req.headers.get('upstash-signature');
  const keys = [process.env.QSTASH_CURRENT_SIGNING_KEY, process.env.QSTASH_NEXT_SIGNING_KEY].filter(
    (k): k is string => Boolean(k?.trim()),
  );
  if (!token || keys.length === 0 || !req.url) return false;
  let pathname: string;
  try {
    pathname = new URL(req.url).pathname;
  } catch {
    return false;
  }
  // Cron routes take GET (script-made schedules) or POST (Upstash MCP schedules); both carry an empty body.
  return verifyQStashSignature({ token, keys, pathname, body: '' });
}

/**
 * True when the request carries a valid cron Bearer secret or a valid QStash
 * signature. Async so a future body-carrying route can read its raw body.
 */
export async function isCronAuthorized(req: CronRequest): Promise<boolean> {
  return hasCronBearer(req) || hasQStashSignature(req);
}

// ── Per-route trigger throttle ───────────────────────────────────────────────
// A leaked CRON_SECRET would otherwise let an attacker re-trigger these
// expensive (maxDuration=300s, external API-calling) routes without limit.
//
// When Upstash Redis is configured (UPSTASH_REDIS_REST_URL +
// UPSTASH_REDIS_REST_TOKEN) a distributed SET-NX lock is used so the throttle
// holds across ALL serverless containers — not just within one warm instance.
// Without Upstash the Map-based in-memory floor is kept as a best-effort
// fallback (same behaviour as before).

const lastTriggerAt = new Map<string, number>();

/** True when at least `minIntervalMs` has passed since the last call for `routeName`. */
export async function isCronTriggerAllowed(
  routeName: string,
  minIntervalMs: number,
): Promise<boolean> {
  // ── Distributed lock via Upstash Redis ────────────────────────────────────
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const lockKey = `cron:lock:${routeName}`;
      const ttlSeconds = Math.ceil(minIntervalMs / 1000);

      // SET <key> 1 NX EX <ttl> — atomic; only the first container succeeds.
      const res = await fetch(`${url}/set/${encodeURIComponent(lockKey)}/1/nx/ex/${ttlSeconds}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Upstash ${res.status}`);
      const body = (await res.json()) as { result: string | null };

      // "OK" = lock acquired (first caller). null = already locked (reject).
      return body.result === 'OK';
    } catch (err) {
      // Redis unreachable → fall through to in-memory floor rather than
      // blocking all cron runs. Log and degrade gracefully.
      console.warn(`[cronAuth] Upstash lock unavailable, using in-memory fallback: ${String(err)}`);
    }
  }

  // ── In-memory fallback (single-container only) ────────────────────────────
  const now = Date.now();
  const last = lastTriggerAt.get(routeName);
  if (last !== undefined && now - last < minIntervalMs) return false;
  lastTriggerAt.set(routeName, now);
  return true;
}
