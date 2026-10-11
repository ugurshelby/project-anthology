import { createHash, createHmac } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { isCronAuthorized, verifyQStashSignature } from '@/lib/cronAuth';

function req(authorization?: string, extra: Record<string, string> = {}, url = 'https://apex.example/api/cron/sync-f1') {
  const headers: Record<string, string> = { ...extra };
  if (authorization) headers.authorization = authorization;
  return {
    url,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  };
}

const ENV_KEYS = ['CRON_SECRET', 'CRON_SECRET_KEY', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY'] as const;
const saved: Record<string, string | undefined> = {};
for (const k of ENV_KEYS) saved[k] = process.env[k];

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function clearEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

describe('isCronAuthorized — Bearer secret', () => {
  it('fails closed when no secret is configured', async () => {
    clearEnv();
    expect(await isCronAuthorized(req('Bearer anything'))).toBe(false);
    expect(await isCronAuthorized(req())).toBe(false);
  });

  it('accepts the Vercel-standard CRON_SECRET', async () => {
    clearEnv();
    process.env.CRON_SECRET = 's3cret';
    expect(await isCronAuthorized(req('Bearer s3cret'))).toBe(true);
  });

  it('accepts the legacy CRON_SECRET_KEY', async () => {
    clearEnv();
    process.env.CRON_SECRET_KEY = 'legacy';
    expect(await isCronAuthorized(req('Bearer legacy'))).toBe(true);
  });

  it('accepts either secret when both are configured', async () => {
    clearEnv();
    process.env.CRON_SECRET = 'new';
    process.env.CRON_SECRET_KEY = 'old';
    expect(await isCronAuthorized(req('Bearer new'))).toBe(true);
    expect(await isCronAuthorized(req('Bearer old'))).toBe(true);
  });

  it('rejects wrong, truncated, and missing tokens', async () => {
    clearEnv();
    process.env.CRON_SECRET = 's3cret';
    expect(await isCronAuthorized(req('Bearer wrong!'))).toBe(false);
    expect(await isCronAuthorized(req('Bearer s3cre'))).toBe(false);
    expect(await isCronAuthorized(req('s3cret'))).toBe(false);
    expect(await isCronAuthorized(req())).toBe(false);
  });
});

// ── QStash signature (plan 1.6) ──────────────────────────────────────────────

const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64url');
const NOW = 1_791_700_000;

/** Same token shape QStash sends (HS256; claims per sdk-qstash-ts Receiver). */
function sign(key: string, claims: Record<string, unknown>, alg = 'HS256'): string {
  const h = b64url(JSON.stringify({ alg, typ: 'JWT' }));
  const p = b64url(JSON.stringify(claims));
  const s = createHmac('sha256', key).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}

const emptyBodyHash = createHash('sha256').update('').digest('base64url');
const claims = (over: Record<string, unknown> = {}) => ({
  iss: 'Upstash',
  sub: 'https://apex.example/api/cron/sync-f1',
  iat: NOW,
  nbf: NOW,
  exp: NOW + 300,
  jti: 'jwt_1',
  body: emptyBodyHash,
  ...over,
});
const verify = (token: string, over: Partial<Parameters<typeof verifyQStashSignature>[0]> = {}) =>
  verifyQStashSignature({ token, keys: ['current-key', 'next-key'], pathname: '/api/cron/sync-f1', body: '', nowSec: NOW + 5, ...over });

describe('verifyQStashSignature', () => {
  it('accepts a token signed with the current or the next key', () => {
    expect(verify(sign('current-key', claims()))).toBe(true);
    expect(verify(sign('next-key', claims()))).toBe(true);
  });

  it('rejects a foreign key, a non-HS256 header and a malformed token', () => {
    expect(verify(sign('attacker', claims()))).toBe(false);
    expect(verify(sign('current-key', claims(), 'none'))).toBe(false);
    expect(verify('not.a.jwt.at.all')).toBe(false);
    expect(verify('')).toBe(false);
  });

  it('checks issuer, expiry and not-before (30 s tolerance)', () => {
    expect(verify(sign('current-key', claims({ iss: 'Someone' })))).toBe(false);
    expect(verify(sign('current-key', claims({ exp: NOW - 60 })))).toBe(false);
    expect(verify(sign('current-key', claims({ exp: NOW - 10 })))).toBe(true);
    expect(verify(sign('current-key', claims({ nbf: NOW + 120 })))).toBe(false);
  });

  it('binds the signature to the route path (no replay against another cron)', () => {
    const token = sign('current-key', claims());
    expect(verify(token, { pathname: '/api/cron/sync-news' })).toBe(false);
    expect(verify(token, { pathname: '/api/cron/sync-f1/' })).toBe(true);
  });

  it('checks the body hash', () => {
    expect(verify(sign('current-key', claims({ body: b64url('x') })))).toBe(false);
    expect(verify(sign('current-key', claims()), { body: 'tampered' })).toBe(false);
  });
});

describe('isCronAuthorized — QStash signature', () => {
  it('accepts a valid Upstash-Signature for this route without any Bearer secret', async () => {
    clearEnv();
    process.env.QSTASH_CURRENT_SIGNING_KEY = 'current-key';
    process.env.QSTASH_NEXT_SIGNING_KEY = 'next-key';
    const now = Math.floor(Date.now() / 1000);
    const token = sign('current-key', claims({ iat: now, nbf: now, exp: now + 300 }));
    expect(await isCronAuthorized(req(undefined, { 'upstash-signature': token }))).toBe(true);
  });

  it('fails closed when the signing keys are not configured', async () => {
    clearEnv();
    const now = Math.floor(Date.now() / 1000);
    const token = sign('current-key', claims({ iat: now, nbf: now, exp: now + 300 }));
    expect(await isCronAuthorized(req(undefined, { 'upstash-signature': token }))).toBe(false);
  });
});
