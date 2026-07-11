import { NextRequest, NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { PushSubscriptionInsert } from '@/types/database';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_PREFERENCE_KEYS = 20;

/** Keep only boolean-valued keys, bounded in count — reject arbitrary/oversized payloads. */
function sanitizePreferences(input: unknown): Record<string, boolean> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const entries = Object.entries(input as Record<string, unknown>)
    .filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
    .slice(0, MAX_PREFERENCE_KEYS);
  return Object.fromEntries(entries);
}

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'push-register',
      max: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } },
      );
    }
  }

  let body: { token: string; preferences: Record<string, boolean> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { token, preferences } = body;

  if (!token || typeof token !== 'string' || !Expo.isExpoPushToken(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const safePrefs = sanitizePreferences(preferences);

  const row: PushSubscriptionInsert = {
    token,
    preferences: safePrefs,
    updated_at: new Date().toISOString(),
  };

  // supabase-js's generic overload resolution mis-infers the upsert() payload
  // type here (unrelated to Database completeness — push_subscriptions is
  // fully typed above); cast is the pragmatic workaround, same as elsewhere
  // in the codebase (lib/f1Ingest.ts, sync-news, sync-radio).
  const { error } = await (getSupabaseAdmin().from('push_subscriptions') as unknown as {
    upsert: (row: PushSubscriptionInsert, opts: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
  }).upsert(row, { onConflict: 'token' });

  if (error) {
    console.error('[push/register] upsert failed:', error.message);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
