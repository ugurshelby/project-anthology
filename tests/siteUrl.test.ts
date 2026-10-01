import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROD_SITE_URL, getSiteUrl } from '@/lib/data/siteUrl';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSiteUrl', () => {
  it('prefers NEXT_PUBLIC_SITE_URL and trims trailing slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test//');
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app');
    expect(getSiteUrl()).toBe('https://example.test');
  });

  it('uses VERCEL_URL before the production fallback', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', 'preview.vercel.app');
    vi.stubEnv('NODE_ENV', 'production');
    expect(getSiteUrl()).toBe('https://preview.vercel.app');
  });

  it('falls back to the live production host in production', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('NODE_ENV', 'production');
    expect(getSiteUrl()).toBe(PROD_SITE_URL);
  });

  it('falls back to localhost outside production', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('NODE_ENV', 'development');
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  it('keeps the production constant on the live host', () => {
    expect(PROD_SITE_URL).toBe('https://project-anthology-eight.vercel.app');
  });
});
