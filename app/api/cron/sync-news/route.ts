/**
 * Cron: sync-news (Masterplan Karar B)
 *
 * RSS -> stories. Articles from every outlet are clustered by event; each
 * story is stored ONCE in `news_stories` with an original EN+TR brief, the
 * best reachable cover image and the list of source links.
 * - Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 * - Rewrite: free-tier AI (GEMINI_API_KEY / GROQ_API_KEY), only for new or
 *   changed stories, inside a time budget; the rest is picked up next run.
 * - Retention: 7 days (news_stories by published_at; legacy news_cache too).
 *
 * Response shape: { stories, merged, rewritten, pending, translatedFallback,
 *                   aiConfigured, deleted, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRawNews } from '@/lib/news/aggregate';
import { buildStoryRows, NEWS_RETENTION_MS } from '@/lib/news/stories';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { NewsStoryRow } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const MIN_TRIGGER_INTERVAL_MS = 60_000;
/** Leave headroom under maxDuration for image probes + upsert. */
const WORK_BUDGET_MS = 200_000;
const UPSERT_BATCH_SIZE = 50;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) return authError();
  if (!(await isCronTriggerAllowed('sync-news', MIN_TRIGGER_INTERVAL_MS))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const startedAt = Date.now();
  const errors: string[] = [];
  let deleted = 0;
  let stories = 0;
  let stats: Awaited<ReturnType<typeof buildStoryRows>>['stats'] | null = null;

  try {
    const db = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - NEWS_RETENTION_MS).toISOString();

    // 1) Fetch RSS + load the stories already stored (within retention).
    const raw = await fetchRawNews();
    console.log(`[sync-news] fetched ${raw.length} articles in ${Date.now() - startedAt}ms`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingRows } = await (db.from('news_stories') as any)
      .select('*')
      .gte('published_at', cutoff);

    // 2) Cluster, pick images, rewrite what is new/changed.
    const built = await buildStoryRows(raw, (existingRows ?? []) as NewsStoryRow[], {
      deadlineMs: startedAt + WORK_BUDGET_MS,
    });
    stats = built.stats;
    console.log(`[sync-news] built ${built.rows.length} stories (rewritten ${stats.rewritten}) at ${Date.now() - startedAt}ms`);

    // 3) Upsert (batched).
    for (let i = 0; i < built.rows.length; i += UPSERT_BATCH_SIZE) {
      const batch = built.rows.slice(i, i + UPSERT_BATCH_SIZE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (db.from('news_stories') as any).upsert(batch, { onConflict: 'id' });
      if (error) errors.push(`stories upsert offset ${i}: ${error.message}`);
      else stories += batch.length;
    }

    // 4) 7-day retention (stories + the legacy raw table).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = await (db.from('news_stories') as any).delete({ count: 'exact' }).lt('published_at', cutoff);
    if (s.error) errors.push(`stories retention: ${s.error.message}`);
    else deleted += s.count ?? 0;
    const c = await db.from('news_cache').delete({ count: 'exact' }).lt('published_at', cutoff);
    if (c.error) errors.push(`news_cache retention: ${c.error.message}`);
    else deleted += c.count ?? 0;

    return NextResponse.json({
      stories,
      merged: stats.merged,
      rewritten: stats.rewritten,
      pending: stats.pending,
      splits: stats.splits,
      translatedFallback: stats.translatedFallback,
      aiConfigured: stats.aiConfigured,
      deleted,
      errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    // Generic client-facing message; full detail goes to logs/Sentry (B-7).
    console.error('[cron sync-news] failed:', err);
    return NextResponse.json(
      { error: 'Sync failed', stories, deleted, errors, durationMs: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
