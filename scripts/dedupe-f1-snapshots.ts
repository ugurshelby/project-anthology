/**
 * One-shot maintenance: remove duplicate f1_snapshots rows.
 *
 * Root cause: `UNIQUE(season, round, type)` does NOT prevent duplicates when
 * `round IS NULL`, because Postgres treats NULLs as distinct. Ingestion therefore
 * wrote multiple rows for the same (season, NULL, type), which broke the read
 * layer's `.maybeSingle()` (now hardened to take the freshest row).
 *
 * This script keeps the freshest row (max fetched_at) per (season, round, type)
 * group and deletes the rest. Idempotent: re-running after cleanup deletes nothing.
 *
 * Run: npx tsx scripts/dedupe-f1-snapshots.ts          (apply)
 *      npx tsx scripts/dedupe-f1-snapshots.ts --dry-run (report only)
 */

import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');

type Row = {
  id: number;
  season: number;
  round: number | null;
  type: string;
  fetched_at: string;
};

async function main(): Promise<void> {
  const supabase = createClient(URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('f1_snapshots')
    .select('id, season, round, type, fetched_at')
    .order('fetched_at', { ascending: false });

  if (error) {
    console.error('Fetch failed:', error.message);
    process.exit(1);
  }

  const rows = (data ?? []) as Row[];
  console.log(`Total rows: ${rows.length}`);

  // Group by (season, round, type); rows already sorted fetched_at DESC, so the
  // first per group is the keeper, the rest are duplicates to delete.
  const seen = new Set<string>();
  const toDelete: Row[] = [];
  for (const r of rows) {
    const key = `${r.season}|${r.round ?? 'null'}|${r.type}`;
    if (seen.has(key)) {
      toDelete.push(r);
    } else {
      seen.add(key);
    }
  }

  console.log(`Unique groups: ${seen.size}`);
  console.log(`Duplicate rows to delete: ${toDelete.length}`);
  for (const r of toDelete) {
    console.log(`  delete id=${r.id} (${r.season}/${r.round ?? 'NULL'}/${r.type} @ ${r.fetched_at})`);
  }

  if (toDelete.length === 0) {
    console.log('Nothing to delete — already clean.');
    return;
  }
  if (DRY_RUN) {
    console.log('\n[dry-run] No rows deleted.');
    return;
  }

  const ids = toDelete.map((r) => r.id);
  const { error: delError } = await supabase.from('f1_snapshots').delete().in('id', ids);
  if (delError) {
    console.error('Delete failed:', delError.message);
    process.exit(1);
  }
  console.log(`\nDeleted ${ids.length} duplicate rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
