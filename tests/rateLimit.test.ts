/**
 * rateLimit() in-memory fallback contract (Upstash env unset in the test env, so
 * the limiter degrades to the per-instance window — exactly the path that runs
 * locally and on deploys without Upstash configured).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const OPTS = { prefix: 'test', max: 3, windowMs: 1000 } as const;

async function loadRateLimit() {
  vi.resetModules();
  return import('@/lib/rateLimit');
}

beforeEach(() => {
  // Ensure the in-memory branch is taken regardless of the ambient .env.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('rateLimit — in-memory fallback', () => {
  it('allows up to max requests then blocks with a retryAfter', async () => {
    const { rateLimit } = await loadRateLimit();

    for (let i = 0; i < OPTS.max; i++) {
      const r = await rateLimit('1.2.3.4', OPTS);
      expect(r.success).toBe(true);
    }

    const blocked = await rateLimit('1.2.3.4', OPTS);
    expect(blocked.success).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('isolates separate identifiers', async () => {
    const { rateLimit } = await loadRateLimit();

    for (let i = 0; i < OPTS.max; i++) await rateLimit('a', OPTS);
    expect((await rateLimit('a', OPTS)).success).toBe(false);
    // A different IP has its own bucket.
    expect((await rateLimit('b', OPTS)).success).toBe(true);
  });

  it('resets after the window elapses', async () => {
    const { rateLimit } = await loadRateLimit();

    for (let i = 0; i < OPTS.max; i++) await rateLimit('ip', OPTS);
    expect((await rateLimit('ip', OPTS)).success).toBe(false);

    vi.advanceTimersByTime(OPTS.windowMs + 1);
    expect((await rateLimit('ip', OPTS)).success).toBe(true);
  });
});

describe('getClientIP', () => {
  it('prefers x-real-ip, then the rightmost x-forwarded-for hop', async () => {
    const { getClientIP } = await loadRateLimit();
    expect(getClientIP(new Headers({ 'x-real-ip': ' 1.2.3.4 ', 'x-forwarded-for': '9.9.9.9' }))).toBe('1.2.3.4');
    expect(getClientIP(new Headers({ 'x-forwarded-for': '6.6.6.6, 5.5.5.5' }))).toBe('5.5.5.5');
  });

  it('puts header-less requests in one shared fallback bucket (fail closed)', async () => {
    const { getClientIP } = await loadRateLimit();
    expect(getClientIP(new Headers())).toBe('fallback:unknown');
  });
});

describe('applyRateLimit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('limits header-less requests in one shared bucket at max/5 outside tests', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { applyRateLimit } = await loadRateLimit();
    const opts = { prefix: 'apply', max: 10, windowMs: 1000 };

    expect((await applyRateLimit(new Headers(), opts)).success).toBe(true);
    expect((await applyRateLimit(new Headers(), opts)).success).toBe(true);
    expect((await applyRateLimit(new Headers(), opts)).success).toBe(false);
    // A request with a real IP keeps its own full bucket.
    expect((await applyRateLimit(new Headers({ 'x-real-ip': '1.2.3.4' }), opts)).success).toBe(true);
  });

  it('exempts header-less requests only when NODE_ENV is test', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const { applyRateLimit } = await loadRateLimit();
    const opts = { prefix: 'apply-test', max: 1, windowMs: 1000 };

    for (let i = 0; i < 3; i++) {
      expect((await applyRateLimit(new Headers(), opts)).success).toBe(true);
    }
  });
});
