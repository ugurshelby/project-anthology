import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function resolveSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL
  );
}

function resolveSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY
  );
}

function resolveSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const supabaseUrl = resolveSupabaseUrl()!;
const supabaseAnonKey = resolveSupabaseAnonKey()!;
const supabaseServiceKey = resolveSupabaseServiceKey()!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/** Service-role client with Vite/env fallbacks (API routes, scripts). */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = resolveSupabaseUrl();
  const key =
    resolveSupabaseServiceKey() ||
    resolveSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
