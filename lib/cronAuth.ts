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
