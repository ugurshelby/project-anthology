import { afterEach, describe, expect, it } from 'vitest';
import { isCronAuthorized } from '@/lib/cronAuth';

function req(authorization?: string) {
  return {
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'authorization' ? (authorization ?? null) : null,
    },
  };
}

const ENV_KEYS = ['CRON_SECRET', 'CRON_SECRET_KEY'] as const;
const saved: Record<string, string | undefined> = {};
for (const k of ENV_KEYS) saved[k] = process.env[k];

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('isCronAuthorized', () => {
  it('fails closed when no secret is configured', () => {
    delete process.env.CRON_SECRET;
    delete process.env.CRON_SECRET_KEY;
    expect(isCronAuthorized(req('Bearer anything'))).toBe(false);
    expect(isCronAuthorized(req())).toBe(false);
  });

  it('accepts the Vercel-standard CRON_SECRET', () => {
    process.env.CRON_SECRET = 's3cret';
    delete process.env.CRON_SECRET_KEY;
    expect(isCronAuthorized(req('Bearer s3cret'))).toBe(true);
  });

  it('accepts the legacy CRON_SECRET_KEY', () => {
    delete process.env.CRON_SECRET;
    process.env.CRON_SECRET_KEY = 'legacy';
    expect(isCronAuthorized(req('Bearer legacy'))).toBe(true);
  });

  it('accepts either secret when both are configured', () => {
    process.env.CRON_SECRET = 'new';
    process.env.CRON_SECRET_KEY = 'old';
    expect(isCronAuthorized(req('Bearer new'))).toBe(true);
    expect(isCronAuthorized(req('Bearer old'))).toBe(true);
  });

  it('rejects wrong, truncated, and missing tokens', () => {
    process.env.CRON_SECRET = 's3cret';
    expect(isCronAuthorized(req('Bearer wrong!'))).toBe(false);
    expect(isCronAuthorized(req('Bearer s3cre'))).toBe(false);
    expect(isCronAuthorized(req('s3cret'))).toBe(false);
    expect(isCronAuthorized(req())).toBe(false);
  });
});
