import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  const text = readFileSync('.env.local', 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('CONFIG_MISSING');
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await sb
  .from('f1_season_snapshots')
  .select('year')
  .limit(1);

if (error) {
  console.log('QUERY_ERROR:', error.message);
  process.exit(2);
}
console.log('QUERY_OK:', data?.length ?? 0, 'row(s)');
