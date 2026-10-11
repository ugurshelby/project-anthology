/**
 * sync-radio during OpenF1's live-session lock (plan 1.7): the run stops at
 * the first 401 and reports `deferred` with HTTP 200 instead of failing or
 * spending one locked request per session.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { OpenF1RestrictedError } from '@/lib/f1/sources/openf1Errors';

const mockSessions = vi.fn();
const mockDrivers = vi.fn();
const mockRadio = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/cronAuth', () => ({
  isCronAuthorized: () => true,
  isCronTriggerAllowed: async () => true,
}));

vi.mock('@/lib/f1/sources/openf1', () => ({
  fetchRaceSessions: (...a: unknown[]) => mockSessions(...a),
  fetchSessionDrivers: (...a: unknown[]) => mockDrivers(...a),
  fetchTeamRadio: (...a: unknown[]) => mockRadio(...a),
  fetchMeeting: async () => null,
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ upsert: (row: unknown) => mockUpsert(row) }) }),
}));

const { GET } = await import('@/app/api/cron/sync-radio/route');
const request = () => new NextRequest('http://localhost/api/cron/sync-radio');

const session = (key: number) => ({ session_key: key, meeting_key: 1, location: 'Marina Bay' });

beforeEach(() => {
  mockSessions.mockReset();
  mockDrivers.mockReset();
  mockRadio.mockReset();
  mockUpsert.mockReset();
  mockUpsert.mockResolvedValue({ error: null });
});

describe('GET /api/cron/sync-radio — OpenF1 live-session lock', () => {
  it('defers with 200 when the session list itself is locked', async () => {
    mockSessions.mockRejectedValue(new OpenF1RestrictedError('sessions'));
    const res = await GET(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ deferred: 'openf1-live-session', upserted: 0, errors: [] });
  });

  it('stops at the first locked session instead of trying every other one', async () => {
    mockSessions.mockResolvedValue([session(1), session(2), session(3)]);
    mockDrivers.mockRejectedValue(new OpenF1RestrictedError('drivers'));
    mockRadio.mockResolvedValue([]);
    const res = await GET(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ deferred: 'openf1-live-session', sessions: 1, errors: [] });
    expect(mockDrivers).toHaveBeenCalledTimes(1);
  });

  it('still records ordinary per-session failures and carries on', async () => {
    mockSessions.mockResolvedValue([session(1), session(2)]);
    mockDrivers.mockRejectedValueOnce(new Error('OpenF1 500 for drivers')).mockResolvedValue([]);
    mockRadio.mockResolvedValue([]);
    const body = await (await GET(request())).json();

    expect(body.deferred).toBeUndefined();
    expect(body.sessions).toBe(2);
    expect(body.errors).toEqual(['session 1: OpenF1 500 for drivers']);
  });
});
