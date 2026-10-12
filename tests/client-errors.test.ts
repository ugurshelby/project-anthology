import { describe, expect, it, vi } from 'vitest';

describe('browser Sentry loader', () => {
  it('loads nothing without NEXT_PUBLIC_SENTRY_DSN (production today)', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    const mod = await import('@/lib/monitoring/clientErrors');
    expect(mod.sentryEnabled).toBe(false);
    expect(mod.loadSentry()).toBeNull();
    expect(() => mod.captureClientError(new Error('x'))).not.toThrow();
    vi.unstubAllEnvs();
  });
});
