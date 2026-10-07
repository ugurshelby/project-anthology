/**
 * Master-plan 1.4 / 8.7 — notify-sessions claims a session in
 * `notified_sessions` before sending, so a failed or duplicate claim can never
 * turn into a notification on every cron run.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockFetchCalendar = vi.fn();
const mockSend = vi.fn();
const mockInsert = vi.fn();
const mockSubsRead = vi.fn();

vi.mock('@/lib/cronAuth', () => ({
  isCronAuthorized: () => true,
  isCronTriggerAllowed: async () => true,
}));

vi.mock('@/lib/f1/sources/jolpica', () => ({
  fetchCalendar: (...a: unknown[]) => mockFetchCalendar(...a),
}));

vi.mock('@/lib/push/sendExpoPush', () => ({
  sendExpoPushNotifications: (...a: unknown[]) => mockSend(...a),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) =>
      table === 'push_subscriptions'
        ? { select: () => ({ not: () => mockSubsRead() }) }
        : { insert: (row: unknown) => mockInsert(row) },
  }),
}));

const { GET } = await import('@/app/api/cron/notify-sessions/route');

const SUBSCRIBER = 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]';

/** A race whose start is exactly 30 minutes from now (inside the notify window). */
function calendarWithRaceIn30Min() {
  const start = new Date(Date.now() + 30 * 60 * 1000);
  const [date, time] = start.toISOString().split('T');
  return {
    MRData: {
      RaceTable: {
        Races: [{ round: '17', raceName: 'Singapore Grand Prix', date, time: time.replace(/\.\d+Z$/, 'Z') }],
      },
    },
  };
}

function request() {
  return new NextRequest('http://localhost/api/cron/notify-sessions', {
    headers: { authorization: 'Bearer test' },
  });
}

beforeEach(() => {
  mockFetchCalendar.mockResolvedValue(calendarWithRaceIn30Min());
  mockSubsRead.mockResolvedValue({
    data: [
      { token: SUBSCRIBER, preferences: { race: true } },
      { token: 'ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]', preferences: { race: false } },
      { token: 'ExponentPushToken[cccccccccccccccccccccc]', preferences: ['race'] },
    ],
    error: null,
  });
  mockInsert.mockResolvedValue({ error: null });
  mockSend.mockResolvedValue([{ status: 'ok', id: 'ticket-1' }]);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('/api/cron/notify-sessions', () => {
  it('claims the session, then sends only to subscribers who opted in', async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ sessionsChecked: 1, claimed: 1, deduped: 0, notified: 1, failed: [] });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ round: 17, session_type: 'race' }),
    );
    expect(mockSend).toHaveBeenCalledTimes(1);
    const messages = mockSend.mock.calls[0][0] as Array<{ to: string }>;
    expect(messages.map((m) => m.to)).toEqual([SUBSCRIBER]);
    // Claim happens before the send.
    expect(mockInsert.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
  });

  it('skips silently when an earlier run already claimed the session (unique violation)', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } });
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ claimed: 0, deduped: 1, notified: 0, failed: [] });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not send and reports 500 when the claim fails for another reason', async () => {
    mockInsert.mockResolvedValue({ error: { code: '42501', message: 'permission denied' } });
    const res = await GET(request());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.failed).toHaveLength(1);
    expect(body.failed[0]).toMatch(/\/17\/race$/);
    expect(mockSend).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain('permission denied');
  });

  it('claims nothing when the subscriber read fails, so the next run can retry', async () => {
    mockSubsRead.mockResolvedValue({ data: null, error: { message: 'permission denied' } });
    const res = await GET(request());
    expect(res.status).toBe(500);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('still claims the session when nobody is subscribed', async () => {
    mockSubsRead.mockResolvedValue({ data: [], error: null });
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ claimed: 1, notified: 0 });
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('counts only accepted tickets as notified', async () => {
    mockSend.mockResolvedValue([{ status: 'error', message: 'DeviceNotRegistered' }]);
    const res = await GET(request());
    expect(await res.json()).toMatchObject({ claimed: 1, notified: 0 });
  });

  it('does nothing outside the notify window', async () => {
    mockFetchCalendar.mockResolvedValue({ MRData: { RaceTable: { Races: [] } } });
    const res = await GET(request());
    expect(await res.json()).toEqual({ notified: 0, reason: 'no sessions in window' });
    expect(mockSubsRead).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
