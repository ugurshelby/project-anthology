/**
 * 14.1: every public API route goes through applyRateLimit, so a header-less
 * request is limited in the shared fallback bucket (max/5) instead of skipping
 * the limiter. push/register used to skip it entirely; this pins the fix.
 * NODE_ENV is stubbed to production because applyRateLimit exempts 'test';
 * Upstash env is empty, so the in-memory limiter is used.
 */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PUSH_MAX = 10;

async function loadPushRegister() {
  vi.resetModules();
  return (await import('@/app/api/push/register/route')).POST;
}

function pushRequest(headers: Record<string, string> = {}) {
  // Invalid JSON: the route answers 400 after the limiter, never touching Supabase.
  return new NextRequest('http://localhost/api/push/register', {
    method: 'POST',
    body: 'not-json',
    headers,
  });
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/push/register rate limit', () => {
  it('limits header-less requests in the shared fallback bucket (max/5)', async () => {
    const POST = await loadPushRegister();
    const fallbackMax = Math.floor(PUSH_MAX / 5);

    for (let i = 0; i < fallbackMax; i++) {
      expect((await POST(pushRequest())).status).toBe(400);
    }
    const blocked = await POST(pushRequest());
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('gives a request with x-real-ip the full quota', async () => {
    const POST = await loadPushRegister();
    const headers = { 'x-real-ip': '203.0.113.7' };

    for (let i = 0; i < PUSH_MAX; i++) {
      expect((await POST(pushRequest(headers))).status).toBe(400);
    }
    expect((await POST(pushRequest(headers))).status).toBe(429);
  });
});
