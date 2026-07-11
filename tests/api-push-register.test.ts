/**
 * Integration tests for /api/push/register.
 *
 * This is the only public write endpoint, so its input handling is the thing
 * worth pinning: malformed JSON, non-Expo tokens, and arbitrary `preferences`
 * payloads must all be rejected/sanitized before they reach the DB. It also
 * must not echo Supabase's error text back to the caller.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/** Captures what the route tried to upsert, and lets a test force a DB error. */
const upsert = vi.fn(async () => ({ error: null as { message: string } | null }));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ upsert }) }),
}));

const { POST } = await import('@/app/api/push/register/route');

/** A structurally valid Expo push token (Expo.isExpoPushToken accepts this shape). */
const VALID_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

function request(body: unknown, { raw = false }: { raw?: boolean } = {}): NextRequest {
  return new NextRequest('http://localhost/api/push/register', {
    method: 'POST',
    // No x-real-ip / x-forwarded-for → getClientIP() is 'unknown' → rate limiting
    // is skipped, keeping these tests focused on validation.
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  upsert.mockClear();
  upsert.mockResolvedValue({ error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/push/register — input validation', () => {
  it('rejects malformed JSON with 400', async () => {
    const res = await POST(request('{ not json', { raw: true }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Invalid JSON body' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['missing token', {}],
    ['empty token', { token: '' }],
    ['non-string token', { token: 12345 }],
    ['non-Expo token', { token: 'just-some-string' }],
    ['FCM-looking token', { token: 'fcm:APA91bHun4MxP5egoKMwt2K' }],
  ])('rejects %s with 400', async (_label, body) => {
    const res = await POST(request(body));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Invalid token' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('accepts a valid Expo token', async () => {
    const res = await POST(request({ token: VALID_TOKEN, preferences: {} }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledOnce();
  });
});

describe('/api/push/register — preferences sanitization', () => {
  async function prefsSentToDb(preferences: unknown): Promise<Record<string, unknown>> {
    await POST(request({ token: VALID_TOKEN, preferences }));
    const [row] = upsert.mock.calls[0] as unknown as [{ preferences: Record<string, unknown> }];
    return row.preferences;
  }

  it('keeps boolean-valued keys', async () => {
    expect(await prefsSentToDb({ raceStart: true, news: false })).toEqual({
      raceStart: true,
      news: false,
    });
  });

  it('drops non-boolean values (strings, numbers, objects, null)', async () => {
    expect(
      await prefsSentToDb({
        good: true,
        aString: 'yes',
        aNumber: 1,
        anObject: { nested: 'payload' },
        aNull: null,
      }),
    ).toEqual({ good: true });
  });

  it('caps the number of keys at 20', async () => {
    const many = Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`key${i}`, true]),
    );
    expect(Object.keys(await prefsSentToDb(many))).toHaveLength(20);
  });

  it.each([
    ['an array', []],
    ['a string', 'nope'],
    ['a number', 42],
    ['null', null],
    ['undefined', undefined],
  ])('coerces %s to an empty object', async (_label, value) => {
    expect(await prefsSentToDb(value)).toEqual({});
  });
});

describe('/api/push/register — DB errors', () => {
  it('returns a generic 500 and does not leak the Supabase error text', async () => {
    upsert.mockResolvedValue({
      error: { message: 'duplicate key value violates unique constraint "push_subscriptions_pkey"' },
    });

    const res = await POST(request({ token: VALID_TOKEN, preferences: {} }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Registration failed' });
    expect(JSON.stringify(body)).not.toContain('push_subscriptions_pkey');
    // The detail should still reach the server logs.
    expect(console.error).toHaveBeenCalled();
  });
});
