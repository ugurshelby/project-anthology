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
 * Triggered by Upstash QStash every 5 min (lib/cron/qstashSchedules.ts) with
 * GitHub Actions (.github/workflows/notify-sessions.yml) as a best-effort
 * fallback — NOT a vercel.json cron entry (Vercel Hobby-plan crons are limited
 * to once/day; this needs 5-10min granularity). Both callers may overlap: the
 * claim-first insert below keeps that safe.
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
import type { Json, NotifiedSessionInsert, PushSubscriptionRow } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NOTIFY_WINDOW_MS = 30 * 60 * 1000;
const NOTIFY_WINDOW_TOLERANCE_MS = 5 * 60 * 1000;
const MIN_TRIGGER_INTERVAL_MS = 60_000;
/** Postgres unique_violation: the session was already claimed by an earlier run. */
const UNIQUE_VIOLATION = '23505';

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
/** `preferences` is free-form JSON from /api/push/register; only `true` opts in. */
function isSubscribedTo(preferences: Json, sessionType: SessionType): boolean {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return false;
  return (preferences as Record<string, Json | undefined>)[sessionType] === true;
}

type DbError = { code?: string; message: string } | null;

/**
 * Narrow views of the two tables this route touches. supabase-js mis-infers the
 * table generics for this schema (rows resolve to `never`), so the route casts
 * to exactly the calls it makes — same workaround as /api/push/register.
 */
interface NotifyDb {
  from(table: 'push_subscriptions'): {
    select(columns: 'token, preferences'): {
      not(column: 'token', op: 'is', value: null): Promise<{
        data: Pick<PushSubscriptionRow, 'token' | 'preferences'>[] | null;
        error: DbError;
      }>;
    };
  };
  from(table: 'notified_sessions'): {
    insert(row: NotifiedSessionInsert): Promise<{ error: DbError }>;
  };
}

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
  if (!(await isCronTriggerAllowed('notify-sessions', MIN_TRIGGER_INTERVAL_MS))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const startedAt = Date.now();

  try {
    const now = Date.now();
    const calendarData = await fetchCalendar(CURRENT_SEASON);
    const races = (
      (calendarData.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable?.Races ?? []
    );

    const upcoming = findUpcomingSessions(races, now);
    if (upcoming.length === 0) {
      return NextResponse.json({ notified: 0, reason: 'no sessions in window' });
    }

    const db = getSupabaseAdmin() as unknown as NotifyDb;

    // Load subscribers BEFORE claiming any session: if this read fails nothing
    // is claimed, so the next run (still inside the ±5 min window) retries.
    const { data: subs, error: subsError } = await db
      .from('push_subscriptions')
      .select('token, preferences')
      .not('token', 'is', null);
    if (subsError) {
      console.error('[cron notify-sessions] push_subscriptions read failed:', subsError.message);
      return NextResponse.json(
        { error: 'Subscriber read failed', durationMs: Date.now() - startedAt },
        { status: 500 },
      );
    }

    let notifiedCount = 0;
    let claimed = 0;
    let deduped = 0;
    const failed: string[] = [];

    for (const session of upcoming) {
      // Claim first, send second. The unique (season, round, session_type)
      // constraint makes the insert the dedupe check, atomic across overlapping
      // callers (QStash + GitHub fallback). If the claim fails for any other
      // reason the session is NOT sent: a missed notification is better than
      // re-sending it on every run because the dedupe row never got written.
      const { error: claimError } = await db.from('notified_sessions').insert({
        season: CURRENT_SEASON,
        round: session.round,
        session_type: session.sessionType,
      });
      if (claimError) {
        if (claimError.code === UNIQUE_VIOLATION) {
          deduped += 1;
          continue;
        }
        const label = `${CURRENT_SEASON}/${session.round}/${session.sessionType}`;
        console.error(`[cron notify-sessions] claim ${label} failed:`, claimError.message);
        failed.push(label);
        continue;
      }
      claimed += 1;

      const targets = (subs ?? []).filter((s) => isSubscribedTo(s.preferences, session.sessionType));
      if (targets.length === 0) continue;

      const messages: ExpoPushMessage[] = targets.map((s) => ({
        to: s.token,
        sound: 'default',
        title: `${session.raceName} — ${session.sessionType.toUpperCase()} in 30 minutes`,
        body: 'Session starts soon. Tap to open Apex.',
        data: { round: session.round, sessionType: session.sessionType },
      }));
      const tickets = await sendExpoPushNotifications(messages);
      notifiedCount += tickets.filter((t) => t.status === 'ok').length;
    }

    return NextResponse.json(
      {
        sessionsChecked: upcoming.length,
        claimed,
        deduped,
        notified: notifiedCount,
        failed,
        durationMs: Date.now() - startedAt,
      },
      // A failed claim makes the run visible as failed (GitHub/QStash logs).
      { status: failed.length > 0 ? 500 : 200 },
    );
  } catch (err) {
    console.error('[cron notify-sessions] failed:', err);
    return NextResponse.json(
      { error: 'Notification sync failed', durationMs: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
