/** One-off diagnostic: how much historical F1 data actually sits in prod Supabase. Not part of the app. */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSupabaseAdmin } from '../lib/supabase';

async function main() {
  const db = getSupabaseAdmin();
  const bySeason = new Map<number, Set<string>>();
  const PAGE = 1000;
  let offset = 0;
  let total = 0;
  for (;;) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (db.from('f1_snapshots') as any)
      .select('season, type')
      .order('season', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    const rows = data as Array<{ season: number; type: string }>;
    for (const row of rows) {
      if (!bySeason.has(row.season)) bySeason.set(row.season, new Set());
      bySeason.get(row.season)!.add(row.type);
    }
    total += rows.length;
    if (rows.length < PAGE) break;
    offset += PAGE;
  }
  const data = { length: total };

  const seasons = [...bySeason.keys()].sort((a, b) => a - b);
  console.log('Total rows:', data.length);
  console.log(`Seasons present: ${seasons.length} (${seasons[0]}..${seasons[seasons.length - 1]})`);

  const missing: number[] = [];
  for (let y = seasons[0]; y <= seasons[seasons.length - 1]; y++) if (!bySeason.has(y)) missing.push(y);
  console.log('Missing years in range:', missing.length ? missing.join(',') : 'none');

  const withResults = seasons.filter((s) => bySeason.get(s)!.has('results'));
  console.log(
    'Seasons with >=1 "results" row:',
    withResults.length,
    withResults.length ? `(${withResults[0]}..${withResults[withResults.length - 1]})` : '',
  );
  console.log('Seasons with calendar:', seasons.filter((s) => bySeason.get(s)!.has('calendar')).length);
  console.log('Seasons with standings_drivers:', seasons.filter((s) => bySeason.get(s)!.has('standings_drivers')).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
