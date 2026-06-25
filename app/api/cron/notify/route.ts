import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Expo } from 'expo-server-sdk';
import type { ExpoPushMessage } from 'expo-server-sdk';
import { isCronAuthorized } from '@/lib/cronAuth';
import { CalendarRace } from '@/lib/f1Calendar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const expo = new Expo();

type Session = { type: string; label: string };

function getUpcomingSessions(races: CalendarRace[]): Session[] {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);
  const sessions: Session[] = [];

  for (const race of races) {
    const name = race.raceName ?? 'Race';

    const candidates: Array<{ type: string; date?: string; time?: string; label: string }> = [
      { type: 'qualifying', date: race.Qualifying?.date, time: race.Qualifying?.time, label: `Qualifying — ${name}` },
      { type: 'sprint', date: race.Sprint?.date, time: race.Sprint?.time, label: `Sprint — ${name}` },
      { type: 'race', date: race.date, time: race.time, label: `Race — ${name}` },
    ];

    for (const c of candidates) {
      if (!c.date) continue;
      const d = new Date(`${c.date}T${c.time ?? '12:00:00Z'}`);
      if (d >= now && d <= in30) {
        sessions.push({ type: c.type, label: c.label });
      }
    }
  }

  return sessions;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch current season's calendar races from the data layer
  const { getSeasonData } = await import('@/lib/data/f1');
  const { CURRENT_SEASON } = await import('@/lib/f1Calendar');
  const seasonData = await getSeasonData(CURRENT_SEASON);
  const races: CalendarRace[] = seasonData.races ?? [];

  const sessions = getUpcomingSessions(races);
  if (sessions.length === 0) return NextResponse.json({ sent: 0 });

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('token, preferences');

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const messages: ExpoPushMessage[] = [];

  for (const session of sessions) {
    for (const sub of subs) {
      const prefs = (sub.preferences ?? {}) as Record<string, boolean>;
      if (prefs[session.type] && Expo.isExpoPushToken(sub.token)) {
        messages.push({
          to: sub.token,
          title: 'APEX',
          body: `${session.label} starts in 30 minutes`,
          data: { sessionType: session.type },
        });
      }
    }
  }

  if (messages.length === 0) return NextResponse.json({ sent: 0 });

  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
    sent += chunk.length;
  }

  return NextResponse.json({ sent });
}
