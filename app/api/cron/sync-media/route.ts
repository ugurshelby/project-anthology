/**
 * Cron: sync-media
 *
 * Resolves one license-checked image per driver / team / car / circuit and
 * stores it (WebP variants in the `media` bucket, metadata in `media_assets`).
 * Incremental: discovers new seasons/entities from Jolpica, then processes only
 * the rows that are DUE, inside a time budget. With nothing due it is one cheap
 * query, so it is scheduled hourly until the initial backlog is done.
 *
 * - Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 * - Optional `?only=driver:norris,team:ferrari` re-runs specific entities that are due.
 *
 * Response: SyncReport (counts + per-item outcome, no secrets).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { isMissingMediaTables } from '@/lib/media/errors';
import { isMediaEntityType, isValidMediaKey } from '@/lib/media/keys';
import { runMediaSync } from '@/lib/media/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MIN_TRIGGER_INTERVAL_MS = 60_000;
/** Leave headroom under maxDuration for the final DB writes. */
const WORK_BUDGET_MS = 240_000;

function parseOnly(raw: string | null): Array<{ type: string; key: string }> | undefined {
  if (!raw) return undefined;
  const out: Array<{ type: string; key: string }> = [];
  for (const part of raw.split(',').slice(0, 50)) {
    const sep = part.indexOf(':');
    if (sep < 1) continue;
    const type = part.slice(0, sep);
    const key = part.slice(sep + 1);
    if (isMediaEntityType(type) && isValidMediaKey(key)) out.push({ type, key });
  }
  return out.length ? out : undefined;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isCronTriggerAllowed('sync-media', MIN_TRIGGER_INTERVAL_MS))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const only = parseOnly(req.nextUrl.searchParams.get('only'));
    const report = await runMediaSync({
      budgetMs: WORK_BUDGET_MS,
      only,
      skipDiscovery: only !== undefined,
      log: (m) => console.log(`[sync-media] ${m}`),
    });
    console.log(
      `[sync-media] resolved=${report.resolved} unchanged=${report.unchanged} missing=${report.missing} errors=${report.errors} due=${report.due} stopped=${report.stopReason ?? 'no'} in ${report.durationMs}ms`,
    );
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Migration not applied yet: stay inert (200) so the hourly workflow is not red until the owner applies it.
    if (isMissingMediaTables(message)) {
      console.warn('[sync-media] skipped: media tables are not migrated yet');
      return NextResponse.json({ skipped: true, reason: 'media tables not migrated yet' });
    }
    console.error('[sync-media] failed:', message);
    return NextResponse.json({ error: 'sync-media failed' }, { status: 500 });
  }
}
