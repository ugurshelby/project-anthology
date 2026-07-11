/**
 * Integration tests for /api/f1-season — the SSRF-hardened Jolpica proxy.
 *
 * The `path` query param is the ONLY user input, and it is the security-critical
 * surface: it gets appended to a hardcoded upstream host. These tests pin the
 * whitelist behaviour (what gets through, what is rejected) and the upstream
 * error mapping, so a future regex "cleanup" can't silently widen it.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/f1-season/route';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

function request(path: string | null): NextRequest {
  const url = new URL('http://localhost/api/f1-season');
  if (path !== null) url.searchParams.set('path', path);
  // No x-real-ip / x-forwarded-for → getClientIP() returns 'unknown', so the
  // route skips rate limiting. That keeps these tests focused on the whitelist.
  return new NextRequest(url);
}

/** Last URL passed to the mocked global fetch. */
let fetchedUrl: string | null = null;

beforeEach(() => {
  fetchedUrl = null;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      fetchedUrl = String(input);
      return new Response(JSON.stringify({ MRData: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/api/f1-season — path whitelist (SSRF guard)', () => {
  const allowed = [
    '2024',
    '2024.json',
    '2024/driverStandings',
    '2024/constructorStandings',
    '2024/5/results',
    '2024/5/qualifying',
    '2024/5/sprint',
    '2024/12/results.json',
  ];

  it.each(allowed)('allows %s', async (path) => {
    const res = await GET(request(path));
    expect(res.status).toBe(200);
    // Whatever the input shape, the upstream host is never user-controlled.
    expect(fetchedUrl).toMatch(/^https:\/\/api\.jolpi\.ca\/ergast\/f1\//);
  });

  const rejected = [
    // absolute URLs / scheme injection
    'https://evil.example.com/steal',
    '//evil.example.com/steal',
    'http://169.254.169.254/latest/meta-data',
    // path traversal
    '2024/../../../etc/passwd',
    '../2024',
    // unlisted endpoints
    '2024/pitstops',
    '2024/5/laps',
    'drivers',
    // malformed seasons/rounds
    '20',
    '20245',
    '2024/999/results',
    // empty / missing
    '',
  ];

  it.each(rejected)('rejects %s with 400', async (path) => {
    const res = await GET(request(path));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: 'Invalid or disallowed path parameter',
    });
    // Critically: a rejected path must never reach the network.
    expect(fetchedUrl).toBeNull();
  });

  it('rejects a missing path param entirely', async () => {
    const res = await GET(request(null));
    expect(res.status).toBe(400);
    expect(fetchedUrl).toBeNull();
  });

  it('strips leading slashes before validating', async () => {
    const res = await GET(request('/2024/driverStandings'));
    expect(res.status).toBe(200);
    expect(fetchedUrl).toBe('https://api.jolpi.ca/ergast/f1/2024/driverStandings.json');
  });

  it('appends .json exactly once', async () => {
    await GET(request('2024/5/results.json'));
    expect(fetchedUrl).toBe('https://api.jolpi.ca/ergast/f1/2024/5/results.json');
  });
});

describe('/api/f1-season — caching', () => {
  it('caches historical seasons aggressively', async () => {
    const res = await GET(request(String(CURRENT_SEASON - 1)));
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400');
  });

  it('uses a short window for the current season', async () => {
    const res = await GET(request(String(CURRENT_SEASON)));
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=300');
  });
});

describe('/api/f1-season — upstream failures', () => {
  it('maps upstream 404 to an empty MRData 200 (not an error)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    const res = await GET(request('2024/5/results'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ MRData: {} });
  });

  it('maps other upstream errors to 502 without leaking upstream detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('internal db exploded at /var/lib/pg', { status: 500 })),
    );
    const res = await GET(request('2024'));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Upstream 500');
    expect(JSON.stringify(body)).not.toContain('/var/lib/pg');
  });

  it('maps an aborted (timed-out) fetch to 504', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('The operation was aborted');
      }),
    );
    const res = await GET(request('2024'));
    expect(res.status).toBe(504);
    await expect(res.json()).resolves.toEqual({ error: 'Proxy fetch failed' });
  });

  it('maps a network error to 502 without leaking the raw message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED 10.0.0.5:5432');
      }),
    );
    const res = await GET(request('2024'));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain('10.0.0.5');
  });
});
