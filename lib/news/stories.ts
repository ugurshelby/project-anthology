/**
 * News story pipeline (sync-news cron ONLY — pages just read `news_stories`).
 *
 *   raw RSS items (<=7 days) -> cluster by event -> match to existing stories
 *   (stable id) -> best reachable image -> AI rewrite (EN+TR) for new/changed
 *   stories within a time budget -> upsert -> 7-day retention.
 *
 * Nothing here runs per page view. Rewrites are keyed by a fingerprint of the
 * member URLs, so an unchanged story is never rewritten or re-translated.
 */

import { stableId, probeImage, type RawNewsItem } from '@/lib/news/aggregate';
import { clusterArticles } from '@/lib/news/cluster';
import { aiRewriteConfigured, rewriteBatch, type RewriteSource } from '@/lib/news/rewrite';
import { translateToTurkish } from '@/lib/news/translate';
import type { NewsStoryRow, NewsStorySource } from '@/types/database';

export const NEWS_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 4; // stories per AI request (free quotas count requests)
const PACE_MS = 5_000; // gap between AI requests (free-tier per-minute limits)
const FALLBACK_TR_PER_RUN = 8; // MyMemory anonymous quota is tiny — titles only

export interface StoryRunStats {
  clusters: number;
  merged: number;
  rewritten: number;
  translatedFallback: number;
  pending: number;
  aiConfigured: boolean;
}

export function fingerprintOf(urls: string[]): string {
  return stableId([...urls].sort().join('|'));
}

function toSource(it: RawNewsItem): NewsStorySource {
  return { name: it.sourceName, url: it.url, title: it.title, published_at: it.publishedISO || null };
}

export interface DraftStory {
  id: string;
  members: RawNewsItem[];
  sources: NewsStorySource[];
  fingerprint: string;
  publishedTs: number;
  existing: NewsStoryRow | null;
}

/** Cluster fresh articles and attach each cluster to its existing story (by shared URLs) so ids stay stable. */
export function draftStories(raw: RawNewsItem[], existing: NewsStoryRow[], now = Date.now()): DraftStory[] {
  const fresh = raw.filter((r) => r.publishedTs && now - r.publishedTs <= NEWS_RETENTION_MS);
  const byUrl = new Map<string, NewsStoryRow>();
  for (const row of existing) for (const s of row.sources) byUrl.set(s.url, row);

  const claimedIds = new Set<string>();
  const drafts: DraftStory[] = [];

  for (const members of clusterArticles(fresh.map((r) => ({ ...r, source: r.sourceName })))) {
    // Existing story with the most URLs in common wins (and is claimed once).
    const votes = new Map<string, number>();
    for (const m of members) {
      const row = byUrl.get(m.url);
      if (row && !claimedIds.has(row.id)) votes.set(row.id, (votes.get(row.id) ?? 0) + 1);
    }
    const bestId = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const prior = bestId ? (existing.find((e) => e.id === bestId) ?? null) : null;
    if (prior) claimedIds.add(prior.id);

    const memberUrls = new Set(members.map((m) => m.url));
    // Keep outlets that already belonged to the story even if they rolled out of the RSS window.
    const carried = prior ? prior.sources.filter((s) => !memberUrls.has(s.url)) : [];
    const sources = [...members.map(toSource), ...carried];
    drafts.push({
      id: prior?.id ?? stableId(members[0].canonicalUrl),
      members,
      sources,
      fingerprint: fingerprintOf(sources.map((s) => s.url)),
      publishedTs: Math.max(...members.map((m) => m.publishedTs)),
      existing: prior,
    });
  }
  return drafts;
}

/** Highest-resolution reachable image among the members; null = none (no placeholder is ever stored). */
async function bestImage(members: RawNewsItem[]): Promise<string | null> {
  const urls = [...new Set(members.map((m) => m.image).filter(Boolean))];
  const probed = await Promise.all(urls.map(async (u) => ({ u, bytes: await probeImage(u) })));
  const ok = probed.filter((p): p is { u: string; bytes: number } => p.bytes !== null);
  ok.sort((a, b) => b.bytes - a.bytes);
  return ok[0]?.u ?? null;
}

interface RewriteJob {
  draft: DraftStory;
  row: NewsStoryRow;
}

function sourcesOf(d: DraftStory): RewriteSource[] {
  return d.members.map((m) => ({ source: m.sourceName, title: m.title, summary: m.summary }));
}

export async function buildStoryRows(
  raw: RawNewsItem[],
  existing: NewsStoryRow[],
  opts: { deadlineMs: number },
): Promise<{ rows: NewsStoryRow[]; stats: StoryRunStats }> {
  const drafts = draftStories(raw, existing).sort((a, b) => b.publishedTs - a.publishedTs);
  const aiConfigured = aiRewriteConfigured();
  const stats: StoryRunStats = {
    clusters: drafts.length,
    merged: drafts.filter((d) => d.members.length > 1).length,
    rewritten: 0,
    translatedFallback: 0,
    pending: 0,
    aiConfigured,
  };

  // Phase 1 — a row per story (fallback text = best source), best image, and the list of rewrite jobs.
  const rows: NewsStoryRow[] = [];
  const jobs: RewriteJob[] = [];
  for (const d of drafts) {
    const unchanged = d.existing !== null && d.existing.fingerprint === d.fingerprint;
    const seed = d.members[0];
    const row: NewsStoryRow = unchanged
      ? { ...(d.existing as NewsStoryRow), sources: d.sources }
      : {
          id: d.id,
          title: d.existing?.rewritten ? d.existing.title : seed.title,
          summary: d.existing?.rewritten ? d.existing.summary : seed.summary,
          title_tr: d.existing?.title_tr ?? null,
          summary_tr: d.existing?.summary_tr ?? null,
          image_url: d.existing?.image_url ?? null,
          published_at: new Date(d.publishedTs).toISOString(),
          sources: d.sources,
          // Text still reflects the OLD member set until a rewrite succeeds: keep the old
          // fingerprint so the next run retries instead of treating it as up to date.
          fingerprint: d.existing?.fingerprint ?? d.fingerprint,
          rewritten: d.existing?.rewritten ?? false,
          cached_at: new Date().toISOString(),
        };
    if (!unchanged || !row.image_url) {
      const img = await bestImage(d.members);
      if (img) row.image_url = img;
    }
    row.published_at = new Date(d.publishedTs).toISOString();
    rows.push(row);
    if (!unchanged || !row.rewritten) jobs.push({ draft: d, row });
  }

  // Phase 2 — AI rewrite in batches. Multi-outlet stories first (most value per request), newest next.
  const exhausted = new Set<string>();
  if (aiConfigured) {
    jobs.sort((a, b) => b.draft.members.length - a.draft.members.length || b.draft.publishedTs - a.draft.publishedTs);
    let lastCall = 0;
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      if (Date.now() + PACE_MS >= opts.deadlineMs) break;
      const wait = lastCall + PACE_MS - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastCall = Date.now();
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const { results } = await rewriteBatch(batch.map((j) => sourcesOf(j.draft)), exhausted);
      results.forEach((out, k) => {
        const { draft, row } = batch[k];
        if (out && out !== 'split') {
          Object.assign(row, {
            title: out.titleEn,
            summary: out.summaryEn,
            title_tr: out.titleTr,
            summary_tr: out.summaryTr,
            rewritten: true,
            fingerprint: draft.fingerprint,
          });
          stats.rewritten++;
        } else if (out === 'split' && draft.members.length > 1) {
          // Different events: each article becomes its own story (the first keeps this id so the
          // merged row is overwritten, not orphaned); they are rewritten on a later run.
          const at = rows.indexOf(row);
          const singles = draft.members.map((m, n): NewsStoryRow => ({
            ...row,
            id: n === 0 ? draft.id : stableId(m.canonicalUrl),
            title: m.title,
            summary: m.summary,
            title_tr: null,
            summary_tr: null,
            image_url: m.image || null,
            published_at: new Date(m.publishedTs).toISOString(),
            sources: [toSource(m)],
            fingerprint: fingerprintOf([m.url]),
            rewritten: false,
          }));
          rows.splice(at, 1, ...singles);
          stats.pending += singles.length;
        } else {
          stats.pending++;
        }
      });
      if (exhausted.size >= 3) break; // every provider is out of quota — stop early
    }
  }
  stats.pending = Math.max(stats.pending, jobs.length - stats.rewritten);

  // Phase 3 — MyMemory title-only fallback for stories the AI hasn't covered (its anonymous quota is tiny).
  for (const row of rows) {
    if (stats.translatedFallback >= FALLBACK_TR_PER_RUN || Date.now() >= opts.deadlineMs) break;
    if (row.rewritten || row.title_tr) continue;
    const tr = await translateToTurkish(row.title);
    if (tr) {
      row.title_tr = tr;
      stats.translatedFallback++;
    }
  }
  return { rows, stats };
}
