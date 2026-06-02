import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as dotenvConfig } from 'dotenv';

/** Load `.env.local` (and optional `.env`) into `process.env` for CLI scripts. */
export function loadEnvLocal(): void {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envLocalPath)) {
    dotenvConfig({ path: envLocalPath, override: false });
  }

  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    dotenvConfig({ path: envPath, override: false });
  }
}

export function requireSupabaseAdminConfig(): { url: string; serviceKey: string } {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    );
  }

  return { url, serviceKey };
}
