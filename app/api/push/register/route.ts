import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { PushSubscriptionInsert } from '@/types/database';

export async function POST(req: NextRequest) {
  const { token, preferences } = await req.json() as {
    token: string;
    preferences: Record<string, boolean>;
  };

  if (!token || typeof token !== 'string' || !Expo.isExpoPushToken(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const safePrefs = preferences && typeof preferences === 'object' ? preferences : {};

  const row: PushSubscriptionInsert = {
    token,
    preferences: safePrefs,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (getSupabaseAdmin().from('push_subscriptions') as any).upsert(
    row,
    { onConflict: 'token' },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
