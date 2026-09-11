/**
 * Shared cron-route auth (Council B-5 + B-6).
 *
 * Vercel Cron injects `Authorization: Bearer <CRON_SECRET>` only when the env
 * var is named exactly CRON_SECRET, so that is the primary secret. The legacy
 * CRON_SECRET_KEY keeps existing manual triggers working until the Vercel env
 * is migrated. Fail-closed: no secret configured → never authorized.
 *
 * Comparison is constant-time (timingSafeEqual) to close the string-=== timing
 * side channel.
 */

import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the request's Bearer token matches a configured cron secret. */
export function isCronAuthorized(req: { headers: { get(name: string): string | null } }): boolean {
  const header = req.headers.get('authorization') ?? '';
  const secrets = [process.env.CRON_SECRET, process.env.CRON_SECRET_KEY].filter(
    (s): s is string => Boolean(s),
  );
  if (secrets.length === 0) return false;
  return secrets.some((secret) => safeEqual(header, `Bearer ${secret}`));
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
