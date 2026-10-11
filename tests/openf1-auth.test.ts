/**
 * OpenF1 adapter: live-session lock and optional bearer auth (plan 1.7).
 * fetch is stubbed; the module is re-imported per test because the token
 * cache is module-scoped (so the error class is matched by shape, not identity).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';


type Call = { url: string; init?: RequestInit };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function stubFetch(handler: (url: string, init?: RequestInit) => Response) {
  const calls: Call[] = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    return handler(url, init);
  }));
  return calls;
}

const authHeader = (c: Call) => (c.init?.headers as Record<string, string> | undefined)?.Authorization;
const tokenCalls = (calls: Call[]) => calls.filter((c) => c.url.endsWith('/token'));
const apiCalls = (calls: Call[]) => calls.filter((c) => c.url.includes('/v1/'));

async function loadAdapter() {
  vi.resetModules();
  return import('@/lib/f1/sources/openf1');
}

describe('OpenF1 adapter — live-session lock and optional auth', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('without credentials: no token request, no Authorization header, 401 → OpenF1RestrictedError', async () => {
    vi.stubEnv('OPENF1_USERNAME', '');
    vi.stubEnv('OPENF1_PASSWORD', '');
    const calls = stubFetch(() => jsonResponse(401, { detail: 'Live F1 session in progress.' }));
    const { fetchLatestSession } = await loadAdapter();

    await expect(fetchLatestSession()).rejects.toMatchObject({ name: 'OpenF1RestrictedError', restricted: true });
    expect(tokenCalls(calls)).toHaveLength(0);
    expect(apiCalls(calls)).toHaveLength(1); // a 401 is not retried
    expect(authHeader(apiCalls(calls)[0])).toBeUndefined();
  });

  it('with credentials: posts a form to /token once and reuses the bearer token', async () => {
    vi.stubEnv('OPENF1_USERNAME', 'user@example.test');
    vi.stubEnv('OPENF1_PASSWORD', 'test-password');
    const calls = stubFetch((url) =>
      url.endsWith('/token')
        ? jsonResponse(200, { expires_in: '3600', access_token: 'tok-1', token_type: 'bearer' })
        : jsonResponse(200, [{ session_key: 1 }]),
    );
    const { fetchLatestSession, fetchLiveDrivers } = await loadAdapter();

    await fetchLatestSession();
    await fetchLiveDrivers(1);

    const tokens = tokenCalls(calls);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].init?.method).toBe('POST');
    expect((tokens[0].init?.headers as Record<string, string>)['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(String(tokens[0].init?.body)).toBe('username=user%40example.test&password=test-password');
    expect(apiCalls(calls).map(authHeader)).toEqual(['Bearer tok-1', 'Bearer tok-1']);
  });

  it('refreshes the token once on a 401, then succeeds', async () => {
    vi.stubEnv('OPENF1_USERNAME', 'u');
    vi.stubEnv('OPENF1_PASSWORD', 'p');
    let issued = 0;
    const calls = stubFetch((url, init) => {
      if (url.endsWith('/token')) {
        issued += 1;
        return jsonResponse(200, { expires_in: '3600', access_token: `tok-${issued}` });
      }
      const auth = (init?.headers as Record<string, string>).Authorization;
      return auth === 'Bearer tok-2' ? jsonResponse(200, [{ session_key: 7 }]) : jsonResponse(401, { detail: 'expired' });
    });
    const { fetchLatestSession } = await loadAdapter();

    expect(await fetchLatestSession()).toEqual({ session_key: 7 });
    expect(tokenCalls(calls)).toHaveLength(2);
  });

  it('still reports the lock when the refreshed token is also refused', async () => {
    vi.stubEnv('OPENF1_USERNAME', 'u');
    vi.stubEnv('OPENF1_PASSWORD', 'p');
    const calls = stubFetch((url) =>
      url.endsWith('/token') ? jsonResponse(200, { expires_in: '3600', access_token: 'tok' }) : jsonResponse(401, {}),
    );
    const { fetchLatestSession } = await loadAdapter();

    await expect(fetchLatestSession()).rejects.toMatchObject({ name: 'OpenF1RestrictedError', restricted: true });
    expect(tokenCalls(calls)).toHaveLength(2);
    expect(apiCalls(calls)).toHaveLength(2);
  });

  it('falls back to unauthenticated requests when the token endpoint fails', async () => {
    vi.stubEnv('OPENF1_USERNAME', 'u');
    vi.stubEnv('OPENF1_PASSWORD', 'wrong');
    const calls = stubFetch((url) =>
      url.endsWith('/token') ? jsonResponse(401, { detail: 'bad credentials' }) : jsonResponse(200, [{ session_key: 3 }]),
    );
    const { fetchLatestSession } = await loadAdapter();

    expect(await fetchLatestSession()).toEqual({ session_key: 3 });
    expect(authHeader(apiCalls(calls)[0])).toBeUndefined();
  });
});
