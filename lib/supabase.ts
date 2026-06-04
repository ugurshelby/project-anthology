import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Supabase clients — strict client/server separation (Masterplan Karar B/D).
 *
 * - getSupabaseClient(): anon key, safe for client + RSC reads. Subject to RLS
 *   (public read only). NEVER writes.
 * - getSupabaseAdmin(): service_role key, server-side ONLY. Bypasses RLS for
 *   writes (cron/seed). If the service key is missing it THROWS — it must never
 *   silently fall back to the anon key, because anon writes fail RLS and would
 *   surface as confusing "permission denied" rows instead of a clear config error.
 */

type DB = SupabaseClient<Database>;

let cachedAnon: DB | null = null;

/** Anon client for reads (client + RSC). Subject to RLS. */
export function getSupabaseClient(): DB {
  if (cachedAnon) return cachedAnon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  cachedAnon = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAnon;
}

let cachedAdmin: DB | null = null;

/**
 * Service-role client for writes (cron/seed). Server-side only.
 * Throws if SUPABASE_SERVICE_ROLE_KEY is absent — no silent anon fallback.
 */
export function getSupabaseAdmin(): DB {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — service-role client is required for ' +
        'writes; refusing to fall back to the anon key (would fail RLS).',
    );
  }
  cachedAdmin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdmin;
}
