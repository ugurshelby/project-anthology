/**
 * Cron: notify-sessions
 *
 * Checks upcoming session start times (qualifying / sprint / race — FP1-3
 * excluded, no practice-session data exists in the ingest pipeline) and
 * pushes a notification ~30 minutes before each starts, to subscribers who
 * opted into that session type. Dedupes via notified_sessions so repeated
 * 5-10min cron invocations never double-notify the same session.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (same as sync-f1/sync-news).
 * Triggered by a Railway scheduler, NOT a vercel.json cron entry (Vercel
 * Hobby-plan crons are limited to once/day; this needs 5-10min granularity).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import {
  CURRENT_SEASON,
  raceStartMs,
  sessionStartMs,
  type CalendarRace,
} from '@/lib/f1Calendar';
import { fetchCalendar } from '@/lib/f1/sources/jolpica';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendExpoPushNotifications } from '@/lib/push/sendExpoPush';
import type { ExpoPushMessage } from 'expo-server-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NOTIFY_WINDOW_MS = 30 * 60 * 1000;
const NOTIFY_WINDOW_TOLERANCE_MS = 5 * 60 * 1000;
const MIN_TRIGGER_INTERVAL_MS = 60_000;

type SessionType = 'qualifying' | 'sprint' | 'race';

interface UpcomingSession {
  round: number;
  sessionType: SessionType;
  startMs: number;
  raceName: string;
}

/**
 * Sessions whose start falls inside the ~30-minutes-from-now window. Uses the
 * shared `sessionStartMs`/`raceStartMs` helpers so the `12:00:00Z` fallback and
 * ISO parsing stay in one place (`lib/f1Calendar.ts`).
 */
function findUpcomingSessions(races: CalendarRace[], now: number): UpcomingSession[] {
  const out: UpcomingSession[] = [];
  for (const race of races) {
    const round = Number(race.round);
    if (!round) continue;

    const raceName = race.raceName ?? `Round ${round}`;
    const checks: Array<[SessionType, number | null]> = [
      ['qualifying', sessionStartMs(race.Qualifying)],
      ['sprint', sessionStartMs(race.Sprint)],
      ['race', raceStartMs(race)],
    ];

    for (const [sessionType, startMs] of checks) {
      if (startMs == null) continue;
      const untilStart = startMs - now;
      if (untilStart > 0 && Math.abs(untilStart - NOTIFY_WINDOW_MS) <= NOTIFY_WINDOW_TOLERANCE_MS) {
        out.push({ round, sessionType, startMs, raceName });
      }
    }
  }
  return out;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isCronTriggerAllowed('notify-sessions', MIN_TRIGGER_INTERVAL_MS)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const now = Date.now();
  const calendarData = await fetchCalendar(CURRENT_SEASON);
  const races = (
    (calendarData.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable?.Races ?? []
  );

  const upcoming = findUpcomingSessions(races, now);
  if (upcoming.length === 0) {
    return NextResponse.json({ notified: 0, reason: 'no sessions in window' });
  }

  const db = getSupabaseAdmin();
  let notifiedCount = 0;

  for (const session of upcoming) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: already } = await (db.from('notified_sessions') as any)
      .select('id')
      .eq('season', CURRENT_SEASON)
      .eq('round', session.round)
      .eq('session_type', session.sessionType)
      .maybeSingle();
    if (already) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subs } = await (db.from('push_subscriptions') as any)
      .select('token, preferences')
      .not('token', 'is', null);

    const targets = (subs ?? []).filter(
      (s: { preferences: Record<string, boolean> }) => s.preferences?.[session.sessionType] === true,
    );

    if (targets.length > 0) {
      const messages: ExpoPushMessage[] = targets.map((s: { token: string }) => ({
        to: s.token,
        sound: 'default',
        title: `${session.raceName} — ${session.sessionType.toUpperCase()} in 30 minutes`,
        body: 'Session starts soon. Tap to open Apex.',
        data: { round: session.round, sessionType: session.sessionType },
      }));
      await sendExpoPushNotifications(messages);
      notifiedCount += messages.length;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.from('notified_sessions') as any).insert({
      season: CURRENT_SEASON,
      round: session.round,
      session_type: session.sessionType,
    });
  }

  return NextResponse.json({ sessionsChecked: upcoming.length, notified: notifiedCount });
}
