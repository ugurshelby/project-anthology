/**
 * Integration tests for the cron routes' request guard (auth + throttle).
 *
 * isCronAuthorized() has its own unit tests (cronAuth.test.ts); what's pinned
 * here is the wiring: an unauthorized caller must be turned away with 401 before
 * any work happens, and an authorized caller must still be throttled — a leaked
 * CRON_SECRET should not let anyone re-trigger these 300s, external-API-hitting
 * routes in a loop.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const SECRET = 'test-cron-secret';

/** The routes reach for these once past the guard; stub them so nothing real runs. */
vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => {
    throw new Error('stubbed: no DB in tests');
  },
}));

// sync-f1 hits Jolpica before it touches the DB, so stub the upstream too —
// otherwise an authorized call would make a real network request and hang.
vi.mock('@/lib/f1/sources/jolpica', () => ({
  fetchCalendar: async () => {
    throw new Error('stubbed: no upstream in tests');
  },
  fetchDriverStandings: async () => ({}),
  fetchConstructorStandings: async () => ({}),
  fetchResults: async () => ({}),
  fetchQualifying: async () => ({}),
  fetchSprint: async () => ({}),
  hasRaces: () => false,
  hasDriverStandings: () => false,
  hasConstructorStandings: () => false,
  hasResults: () => false,
  hasQualifyingResults: () => false,
  hasSprintResults: () => false,
}));

// sync-radio hits OpenF1 the same way.
vi.mock('@/lib/f1/sources/openf1', () => ({
  fetchRaceSessions: async () => {
    throw new Error('stubbed: no upstream in tests');
  },
  fetchTeamRadio: async () => [],
  fetchSessionDrivers: async () => [],
  fetchMeeting: async () => null,
}));

// sync-news hits RSS feeds the same way.
vi.mock('@/lib/news/aggregate', () => ({
  aggregate: async () => {
    throw new Error('stubbed: no upstream in tests');
  },
}));

function request(authorization?: string): NextRequest {
  const headers = new Headers();
  if (authorization) headers.set('authorization', authorization);
  return new NextRequest('http://localhost/api/cron/sync-f1', { headers });
}

const ROUTES = [
  ['sync-f1', '@/app/api/cron/sync-f1/route'],
  ['sync-news', '@/app/api/cron/sync-news/route'],
  ['sync-radio', '@/app/api/cron/sync-radio/route'],
] as const;

/** Cached handlers — sync-f1 cold import is heavy; auth tests reuse the same module. */
const cachedHandlers = new Map<string, (req: NextRequest) => Promise<Response>>();

async function routeHandler(path: string): Promise<(req: NextRequest) => Promise<Response>> {
  const cached = cachedHandlers.get(path);
  if (cached) return cached;
  const mod = (await import(path)) as { GET: (req: NextRequest) => Promise<Response> };
  cachedHandlers.set(path, mod.GET);
  return mod.GET;
}

/**
 * The throttle keeps its state in a module-level Map, so each throttle test needs a fresh
 * module registry — otherwise the first test's call would throttle the next one.
 */
async function freshRoute(path: string): Promise<(req: NextRequest) => Promise<Response>> {
  vi.resetModules();
  cachedHandlers.delete(path);
  const mod = (await import(path)) as { GET: (req: NextRequest) => Promise<Response> };
  cachedHandlers.set(path, mod.GET);
  return mod.GET;
}

beforeAll(async () => {
  for (const [, path] of ROUTES) {
    await routeHandler(path);
  }
}, 60_000);

beforeEach(() => {
  process.env.CRON_SECRET = SECRET;
  delete process.env.CRON_SECRET_KEY;
  // Silence the routes' own error logging on the paths that do run.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  delete process.env.CRON_SECRET;
  vi.restoreAllMocks();
});

describe.each(ROUTES)('/api/cron/%s — auth gate', (_name, path) => {
  it('rejects a request with no Authorization header', async () => {
    const GET = await routeHandler(path);
    const res = await GET(request());
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('rejects a wrong secret', async () => {
    const GET = await routeHandler(path);
    const res = await GET(request('Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('rejects a bare token without the Bearer scheme', async () => {
    const GET = await routeHandler(path);
    const res = await GET(request(SECRET));
    expect(res.status).toBe(401);
  });

  it('fails closed when no secret is configured at all', async () => {
    delete process.env.CRON_SECRET;
    const GET = await routeHandler(path);
    const res = await GET(request('Bearer anything'));
    expect(res.status).toBe(401);
  });
});

describe.each(ROUTES)('/api/cron/%s — trigger throttle', (_name, path) => {
  it('throttles a second authorized call within the interval', async () => {
    const GET = await freshRoute(path);

    // First authorized call gets past the guard. It will fail downstream (the
    // Supabase mock throws), but that's fine — we only care that it wasn't a 429.
    const first = await GET(request(`Bearer ${SECRET}`));
    expect(first.status).not.toBe(429);
    expect(first.status).not.toBe(401);

    const second = await GET(request(`Bearer ${SECRET}`));
    expect(second.status).toBe(429);
    await expect(second.json()).resolves.toEqual({ error: 'Too many requests' });
  }, 15_000);

  it('checks auth before the throttle (an unauthorized flood never consumes it)', async () => {
    const GET = await freshRoute(path);

    for (let i = 0; i < 5; i++) {
      const res = await GET(request('Bearer wrong'));
      expect(res.status).toBe(401);
    }

    // The throttle is still unspent, so a legitimate call goes through.
    const authorized = await GET(request(`Bearer ${SECRET}`));
    expect(authorized.status).not.toBe(429);
  }, 15_000);
});
