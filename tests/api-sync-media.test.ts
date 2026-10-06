/**
 * sync-media stays inert (200 skipped) until the media_assets migration is applied,
 * so the hourly GitHub workflow is not red; every other failure is still a 500.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { isMissingMediaTables } from '@/lib/media/errors';

const mockRun = vi.fn();

vi.mock('@/lib/cronAuth', () => ({
  isCronAuthorized: () => true,
  isCronTriggerAllowed: async () => true,
}));
vi.mock('@/lib/media/sync', () => ({ runMediaSync: (...a: unknown[]) => mockRun(...a) }));

async function call() {
  const { GET } = await import('@/app/api/cron/sync-media/route');
  const res = await GET(new NextRequest('http://localhost/api/cron/sync-media'));
  return { res, body: await res.json() };
}

describe('isMissingMediaTables', () => {
  it('matches the PostgREST / Postgres wording for our own tables only', () => {
    expect(isMissingMediaTables("media_sync_state get: Could not find the table 'public.media_sync_state' in the schema cache")).toBe(true);
    expect(isMissingMediaTables('media_assets discover insert: relation "public.media_assets" does not exist')).toBe(true);
    expect(isMissingMediaTables('media_assets claimDue: permission denied for table media_assets')).toBe(false);
    expect(isMissingMediaTables('relation "f1_snapshots" does not exist')).toBe(false);
    expect(isMissingMediaTables('network error')).toBe(false);
  });
});

describe('GET /api/cron/sync-media — failure handling', () => {
  beforeEach(() => {
    mockRun.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns 200 skipped when the media tables are not migrated', async () => {
    mockRun.mockRejectedValue(new Error("media_sync_state get: Could not find the table 'public.media_sync_state' in the schema cache"));
    const { res, body } = await call();
    expect(res.status).toBe(200);
    expect(body).toEqual({ skipped: true, reason: 'media tables not migrated yet' });
  });

  it('still answers 500 (generic body) for any other failure', async () => {
    mockRun.mockRejectedValue(new Error('media_assets claimDue: permission denied for table media_assets'));
    const { res, body } = await call();
    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'sync-media failed' });
  });

  it('returns the sync report on success', async () => {
    mockRun.mockResolvedValue({ resolved: 3, unchanged: 0, missing: 1, errors: 0, due: 4, stopReason: null, durationMs: 10 });
    const { res, body } = await call();
    expect(res.status).toBe(200);
    expect(body.resolved).toBe(3);
  });
});
