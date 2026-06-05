/**
 * Seed the `stories` table from the tracked content module (data/stories/content.ts).
 *
 * Each record's slug/title go to columns; the rest (subtitle, year, category,
 * heroImage, blocks) is stored in the `content` jsonb. All stories are seeded
 * with published=true and a stable sort_order (newest year first, then slug).
 *
 * Idempotent: upsert onConflict 'slug'. Service-role required (no anon fallback).
 *
 * Usage:
 *   npx tsx scripts/seed-stories.ts
 *   npx tsx scripts/seed-stories.ts --dry-run
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (loaded from .env.local)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getSupabaseAdmin } from '../lib/supabase';
import { storyContent } from '../data/stories/content';
import type { StoryInsert, Json } from '../types/database';

const dryRun = process.argv.includes('--dry-run');

function sortOrder(year: string, index: number): number {
  // Newer stories first; year is a 4-digit string. Fall back to index for ties.
  const y = parseInt(year, 10);
  return Number.isFinite(y) ? 9999 - y : 5000 + index;
}

async function main(): Promise<void> {
  console.log(`\n=== Seed stories ===`);
  console.log(`Records: ${storyContent.length} | dry-run: ${dryRun}\n`);

  const rows: StoryInsert[] = storyContent.map((s, i) => ({
    slug: s.slug,
    title: s.title,
    published: true,
    sort_order: sortOrder(s.year, i),
    content: {
      subtitle: s.subtitle,
      year: s.year,
      category: s.category,
      heroImage: s.heroImage,
      blocks: s.blocks,
    } as unknown as Json,
  }));

  if (dryRun) {
    for (const r of rows) {
      console.log(`  [dry-run] ${r.slug} (sort ${r.sort_order}) "${r.title}"`);
    }
    console.log(`\n${rows.length} stories would be upserted.`);
    return;
  }

  const db = getSupabaseAdmin();
  // supabase-js array-upsert generic infers `never[]` against our Database type
  // (Relationships: never[]); cast the query builder like lib/f1Ingest.ts does.
  const { data, error } = await (db.from('stories') as unknown as {
    upsert: (
      rows: StoryInsert[],
      opts: { onConflict: string },
    ) => { select: (cols: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }> };
  })
    .upsert(rows, { onConflict: 'slug' })
    .select('slug');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`Upserted ${data?.length ?? 0} stories (published=true).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
