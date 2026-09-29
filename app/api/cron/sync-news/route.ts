/**
 * Cron: sync-news (Masterplan Karar B)
 *
 * Aggregates F1 RSS feeds → upserts into news_cache.
 * - Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 * - onConflict('url'): updates title/description/image/published_at on re-fetch
 * - 30-day retention: deletes rows where cached_at < now - 30d
 * - Turkish translation (MyMemory, free): only articles without a stored
 *   title_tr are translated — re-runs never re-translate unchanged articles.
 *
 * Response shape: { upserted, deleted, translated, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import { aggregate } from '@/lib/news/aggregate';
import { translateItems } from '@/lib/news/translate';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const MIN_TRIGGER_INTERVAL_MS = 60_000;
const NEWS_UPSERT_BATCH_SIZE = 50;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) return authError();
  if (!(await isCronTriggerAllowed('sync-news', MIN_TRIGGER_INTERVAL_MS))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const startedAt = Date.now();
  const errors: string[] = [];
  let upserted = 0;
  let deleted = 0;
  let translated = 0;

  try {
    const db = getSupabaseAdmin();

    // 1) Fetch & aggregate RSS
    const items = await aggregate({ maxItems: 100 });

    // 1b) Translate only articles without a stored Turkish translation yet.
    const urls = items.map((item) => item.url);
    const existingTr = new Map<string, { title_tr: string | null; description_tr: string | null }>();
    if (urls.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingRows } = await (db.from('news_cache') as any)
        .select('url, title_tr, description_tr')
        .in('url', urls);
      for (const row of (existingRows ?? []) as Array<{
        url: string;
        title_tr: string | null;
        description_tr: string | null;
      }>) {
        existingTr.set(row.url, { title_tr: row.title_tr, description_tr: row.description_tr });
      }
    }

    const toTranslate = items.filter((item) => !existingTr.get(item.url)?.title_tr);
    const freshTranslations = await translateItems(toTranslate);
    const freshByUrl = new Map(toTranslate.map((item, i) => [item.url, freshTranslations[i]]));
    translated = freshTranslations.filter((t) => t.titleTr).length;

    // 2) Upsert into news_cache (onConflict = url) — batched to cut round-trips
    for (let i = 0; i < items.length; i += NEWS_UPSERT_BATCH_SIZE) {
      const batch = items.slice(i, i + NEWS_UPSERT_BATCH_SIZE).map((item) => {
        const existing = existingTr.get(item.url);
        const fresh = freshByUrl.get(item.url);
        return {
          url: item.url,
          source: item.sourceName,
          title: item.title,
          description: item.summary,
          image_url: item.image || null,
          published_at: item.publishedAt || null,
          tags: item.sources,
          title_tr: existing?.title_tr ?? fresh?.titleTr ?? null,
          description_tr: existing?.description_tr ?? fresh?.summaryTr ?? null,
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (db.from('news_cache') as any).upsert(batch, { onConflict: 'url' });

      if (error) {
        errors.push(`batch upsert offset ${i}: ${error.message}`);
      } else {
        upserted += batch.length;
      }
    }

    // 3) 30-day retention — delete stale rows
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError, count } = await db
      .from('news_cache')
      .delete({ count: 'exact' })
      .lt('cached_at', cutoff);

    if (deleteError) {
      errors.push(`retention delete: ${deleteError.message}`);
    } else {
      deleted = count ?? 0;
    }

    return NextResponse.json({
      upserted,
      deleted,
      translated,
      errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    // Generic client-facing message; full detail goes to logs/Sentry (B-7).
    console.error('[cron sync-news] failed:', err);
    return NextResponse.json(
      { error: 'Sync failed', upserted, deleted, translated, errors, durationMs: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
