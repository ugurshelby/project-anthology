/**
 * Distributed rate limiting for API routes (Council ÖNEMLİ / APEX Faz 0 §2.3).
 *
 * Uses Upstash Redis (sliding window) when UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN are set, so the limit holds ACROSS serverless
 * instances. When those env vars are absent (local dev, or a deploy that hasn't
 * configured Upstash) it degrades to a per-instance in-memory window — the same
 * best-effort behavior we had before — so the endpoint never hard-fails on a
 * missing dependency.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the window resets (for Retry-After). */
  retryAfter: number;
}

/**
 * Resolve a trustworthy client IP for rate-limiting. Prefers Vercel's `x-real-ip`
 * (set from the real connection, not client-spoofable); off-Vercel it uses the
 * rightmost x-forwarded-for hop (infrastructure-appended). Returns 'unknown' when
 * neither is present — callers should skip limiting rather than bucket everyone
 * together under one key.
 */
export function getClientIP(headers: Headers): string {
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    return parts[parts.length - 1]?.trim() || 'unknown';
  }
  return 'unknown';
}

interface RateLimitOptions {
  /** Logical bucket name, namespaces keys (e.g. 'news'). */
  prefix: string;
  /** Max requests per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

// ── Distributed limiter (Upstash) ────────────────────────────────────────────
// One Ratelimit instance per (prefix, max, windowMs) signature, created lazily.
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(opts: RateLimitOptions): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `${opts.prefix}:${opts.max}:${opts.windowMs}`;
  let limiter = upstashLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(opts.max, `${opts.windowMs} ms`),
      prefix: `ratelimit:${opts.prefix}`,
      analytics: false,
    });
    upstashLimiters.set(key, limiter);
  }
  return limiter;
}

// ── In-memory fallback (per instance) ────────────────────────────────────────
const memoryStore = new Map<string, { count: number; resetTime: number }>();

function checkMemory(identifier: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const storeKey = `${opts.prefix}:${identifier}`;

  if (memoryStore.size > 5000) {
    for (const [k, v] of memoryStore.entries()) {
      if (now > v.resetTime) memoryStore.delete(k);
    }
  }

  const record = memoryStore.get(storeKey);
  if (!record || now > record.resetTime) {
    memoryStore.set(storeKey, { count: 1, resetTime: now + opts.windowMs });
    return { success: true, retryAfter: 0 };
  }
  if (record.count >= opts.max) {
    return { success: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  record.count++;
  return { success: true, retryAfter: 0 };
}

/**
 * Consume one token for `identifier` (typically a client IP) in the given
 * bucket. Tries Upstash first; if it's not configured OR the call throws
 * (network blip), falls back to the in-memory window — fail-open on infra
 * errors rather than locking out real users.
 */
export async function rateLimit(
  identifier: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(opts);
  if (limiter) {
    try {
      const { success, reset } = await limiter.limit(identifier);
      return {
        success,
        retryAfter: success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
      };
    } catch {
      // Upstash unreachable → degrade to in-memory rather than 500 the route.
      return checkMemory(identifier, opts);
    }
  }
  return checkMemory(identifier, opts);
}
