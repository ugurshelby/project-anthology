/**
 * Cron: sync-news (Masterplan Karar B)
 *
 * Aggregates F1 RSS feeds → upserts into news_cache.
 * - Auth: Authorization: Bearer ${CRON_SECRET_KEY}
 * - onConflict('url'): updates title/description/image/published_at on re-fetch
 * - 30-day retention: deletes rows where cached_at < now - 30d
 *
 * Response shape: { upserted, deleted, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import { aggregate } from '@/lib/news/aggregate';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET_KEY;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return authError();

  const startedAt = Date.now();
  const errors: string[] = [];
  let upserted = 0;
  let deleted = 0;

  try {
    const db = getSupabaseAdmin();

    // 1) Fetch & aggregate RSS
    const items = await aggregate({ maxItems: 100 });

    // 2) Upsert into news_cache (onConflict = url)
    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (db.from('news_cache') as any).upsert({
        url: item.url,
        source: item.sourceName,
        title: item.title,
        description: item.summary,
        image_url: item.image || null,
        published_at: item.publishedAt || null,
        tags: item.sources,
      } as Record<string, unknown>, { onConflict: 'url' });

      if (error) {
        errors.push(`upsert ${item.url}: ${error.message}`);
      } else {
        upserted++;
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
      errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: msg, upserted, deleted, errors, durationMs: Date.now() - startedAt },
      { status: 500 },
    );
  }
}
