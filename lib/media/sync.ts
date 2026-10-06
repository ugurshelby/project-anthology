import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { buildAttributionFor } from '@/lib/media/attribution';
import { MediaHttpError, type FetchOptions } from '@/lib/media/http';
import { downloadImage, processImage } from '@/lib/media/process';
import { createSupabaseRepo, type DueRow, type MediaRepo } from '@/lib/media/repo';
import { describeMiss, resolveEntity } from '@/lib/media/resolve';
import { THUMB_WIDTH } from '@/lib/media/score';
import type { MediaEntity } from '@/lib/media/types';
import { curatedCarEntities, discoverSeason, extraCircuitEntities, mergeEntities } from '@/lib/media/universe';
import { getCommonsFileInfos, getWikidataMedia, resolveQids, wikipediaTitleFromUrl, type WikidataMedia } from '@/lib/media/wikimedia';
import { classifyLicense } from '@/lib/media/license';

/**
 * Media sync orchestrator. One run = discovery (cheap, incremental) + resolve
 * the entities that are DUE, inside a hard time budget. Safe to run often: with
 * nothing due it costs one small DB query. Rate limits are respected by the
 * per-host throttle in http.ts, and a circuit breaker stops the run after
 * repeated transient failures instead of hammering Wikimedia.
 */

/** First season the automatic discovery covers (owner decision 2026-10: 2018 → present). */
export const MEDIA_MIN_SEASON = 2018;

const DAY_MS = 86_400_000;
const RESOLVED_RECHECK_DAYS = 90;
const APPROVED_RECHECK_DAYS = 180;
const SEASONS_DISCOVERED_PER_RUN = 2;
const MAX_DUE_PER_RUN = 150;
/** Stop the run after this many consecutive transient failures (rate-limited / network down). */
const BREAKER_THRESHOLD = 3;
/** Time kept in reserve at the end of the budget so a started download/upload can finish. */
const RESERVE_MS = 25_000;

export interface SyncItem {
  type: string;
  key: string;
  outcome: 'resolved' | 'unchanged' | 'missing' | 'error' | 'skipped';
  detail?: string;
}

export interface SyncReport {
  discoveredSeasons: number[];
  newEntities: number;
  due: number;
  resolved: number;
  unchanged: number;
  missing: number;
  errors: number;
  stoppedEarly: boolean;
  stopReason: string | null;
  durationMs: number;
  items: SyncItem[];
}

export interface SyncOptions {
  /** Defaults to the Supabase repo. */
  repo?: MediaRepo;
  budgetMs: number;
  /** Skip the Jolpica discovery step (used when only specific entities are wanted). */
  skipDiscovery?: boolean;
  /** Only process these entities (type:key) — used by `?only=` and the dry-run script. */
  only?: Array<{ type: string; key: string }>;
  now?: Date;
  /** Override season range (tests/scripts). */
  minSeason?: number;
  maxSeason?: number;
  maxDue?: number;
  log?: (msg: string) => void;
}

export function nextCheckFor(kind: 'resolved' | 'approved' | 'missing', entity: Pick<MediaEntity, 'type' | 'season'>, now: Date): string {
  let days: number;
  if (kind === 'resolved') days = RESOLVED_RECHECK_DAYS;
  else if (kind === 'approved') days = APPROVED_RECHECK_DAYS;
  else {
    // Car photos for a new season appear weeks after launch: look often while the season is current/recent.
    const recentCar = entity.type === 'car' && (entity.season ?? 0) >= CURRENT_SEASON - 1;
    days = recentCar ? 7 : 21;
  }
  return new Date(now.getTime() + days * DAY_MS).toISOString();
}

export function backoffFor(attempts: number, now: Date): string {
  const minutes = Math.min(360, 10 * 2 ** Math.max(0, attempts));
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}

function rowToEntity(r: DueRow): MediaEntity {
  return {
    type: r.entity_type,
    key: r.entity_key,
    season: r.season,
    displayName: r.display_name,
    wikipediaUrl: r.wikipedia_url,
    extra: (r.extra ?? {}) as Record<string, unknown>,
  };
}

async function discover(repo: MediaRepo, opts: SyncOptions, deadlineMs: number, report: SyncReport): Promise<void> {
  const minSeason = opts.minSeason ?? MEDIA_MIN_SEASON;
  const maxSeason = opts.maxSeason ?? CURRENT_SEASON;
  const state = (await repo.getState<{ seasons: number[] }>('discovered_seasons')) ?? { seasons: [] };
  const done = new Set(state.seasons);

  // Newest season is rediscovered every run (new drivers/teams join mid-year); older ones once.
  const todo: number[] = [maxSeason];
  for (let s = maxSeason - 1; s >= minSeason && todo.length < 1 + SEASONS_DISCOVERED_PER_RUN; s--) {
    if (!done.has(s)) todo.push(s);
  }

  const all: MediaEntity[] = curatedCarEntities();
  try {
    all.push(...(await extraCircuitEntities()));
  } catch (err) {
    opts.log?.(`extra circuits discovery failed: ${String(err)}`);
  }
  for (const season of todo) {
    if (Date.now() > deadlineMs - RESERVE_MS * 2) break;
    try {
      const found = await discoverSeason(season);
      all.push(...found);
      if (found.length > 0 && season !== maxSeason) done.add(season);
      report.discoveredSeasons.push(season);
    } catch (err) {
      opts.log?.(`discovery season ${season} failed: ${String(err)}`);
    }
  }
  const merged = mergeEntities(all);
  await repo.upsertDiscovered(merged);
  report.newEntities = merged.length;
  await repo.setState('discovered_seasons', { seasons: Array.from(done).sort((a, b) => a - b) });
}

export async function runMediaSync(opts: SyncOptions): Promise<SyncReport> {
  const startedAt = Date.now();
  const now = opts.now ?? new Date();
  const deadlineMs = startedAt + opts.budgetMs;
  const repo = opts.repo ?? createSupabaseRepo();
  const log = opts.log ?? (() => {});
  const fetchOpts: FetchOptions = { deadlineMs: deadlineMs - RESERVE_MS };
  const report: SyncReport = {
    discoveredSeasons: [],
    newEntities: 0,
    due: 0,
    resolved: 0,
    unchanged: 0,
    missing: 0,
    errors: 0,
    stoppedEarly: false,
    stopReason: null,
    durationMs: 0,
    items: [],
  };

  if (!opts.skipDiscovery) await discover(repo, opts, deadlineMs, report);

  let due = await repo.claimDue(opts.maxDue ?? MAX_DUE_PER_RUN, now.toISOString());
  if (opts.only?.length) {
    const want = new Set(opts.only.map((o) => `${o.type}|${o.key}`));
    due = due.filter((r) => want.has(`${r.entity_type}|${r.entity_key}`));
  }
  // New entities first, then the longest-waiting ones.
  due.sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));
  report.due = due.length;

  // Batch the identity step: Wikipedia titles → QIDs → Wikidata image claims.
  const wikidata = new Map<string, WikidataMedia>(); // entity id → media claims
  try {
    const titles = new Map<string, string>(); // entity id → wikipedia title
    for (const r of due) {
      const t = wikipediaTitleFromUrl(r.wikipedia_url);
      if (t && r.entity_type !== 'car') titles.set(`${r.entity_type}|${r.entity_key}`, t);
    }
    if (titles.size) {
      const qids = await resolveQids(Array.from(titles.values()), fetchOpts);
      const media = await getWikidataMedia(Array.from(new Set(qids.values())), fetchOpts);
      for (const [id, title] of titles) {
        const qid = qids.get(title);
        const m = qid ? media.get(qid) : undefined;
        if (m) wikidata.set(id, m);
      }
    }
  } catch (err) {
    if (err instanceof MediaHttpError && err.transient) {
      report.stoppedEarly = true;
      report.stopReason = `identity step: ${err.message}`;
      report.durationMs = Date.now() - startedAt;
      return report;
    }
    log(`identity step failed: ${String(err)}`);
  }

  let consecutiveTransient = 0;
  for (const row of due) {
    if (Date.now() > deadlineMs - RESERVE_MS) {
      report.stoppedEarly = true;
      report.stopReason = 'time budget';
      break;
    }
    if (consecutiveTransient >= BREAKER_THRESHOLD) {
      report.stoppedEarly = true;
      report.stopReason = 'circuit breaker (repeated transient failures)';
      break;
    }
    const entity = rowToEntity(row);
    const id = `${row.entity_type}|${row.entity_key}`;
    const previousPaths = ((row.variants ?? []) as unknown as Array<{ path?: string }>)
      .map((v) => v.path)
      .filter((p): p is string => typeof p === 'string');

    try {
      if (row.status === 'resolved' && row.review === 'approved') {
        await repo.touch(entity, nextCheckFor('approved', entity, now));
        report.unchanged++;
        report.items.push({ type: entity.type, key: entity.key, outcome: 'skipped', detail: 'owner-approved' });
        continue;
      }
      if (row.review === 'rejected') {
        // Owner hid the current image: remember the file so it is never picked again, and hand the row
        // back to the pipeline (review = auto) — otherwise the replacement would stay hidden too.
        const files = row.source_file && !row.rejected_files.includes(row.source_file)
          ? [...row.rejected_files, row.source_file]
          : row.rejected_files;
        await repo.acknowledgeRejection(entity, files);
        row.rejected_files = files;
        row.review = 'auto';
        row.status = row.status === 'resolved' ? 'missing' : row.status; // never "keep" a rejected image
      }

      const outcome = await resolveEntity(entity, row.rejected_files, { wikidata: wikidata.get(id), fetchOpts });
      const best = outcome.best;

      if (best) {
        if (row.status === 'resolved' && row.source_file === best.file.title) {
          await repo.touch(entity, nextCheckFor('resolved', entity, now));
          report.unchanged++;
          report.items.push({ type: entity.type, key: entity.key, outcome: 'unchanged', detail: best.file.title });
          consecutiveTransient = 0;
          continue;
        }
        const url = best.file.thumbUrl ?? best.file.originalUrl;
        if (!url) throw new Error('candidate has no downloadable url');
        const buffer = await downloadImage(url, fetchOpts);
        const processed = await processImage(buffer, entity.type);
        const variants = await repo.uploadVariants(entity, processed);
        const { author, attribution } = buildAttributionFor(best);
        const oldPaths = previousPaths.filter((p) => !variants.some((v) => v.path === p));
        await repo.saveResolved({
          entity,
          candidate: best,
          processed,
          variants,
          attribution,
          author,
          nextCheckAt: nextCheckFor('resolved', entity, now),
        });
        await repo.removeVariants(oldPaths);
        report.resolved++;
        report.items.push({
          type: entity.type,
          key: entity.key,
          outcome: 'resolved',
          detail: `${best.file.title} [${best.license.label}] score ${best.score}`,
        });
        consecutiveTransient = 0;
        continue;
      }

      // Nothing qualified. A previously resolved image stays only if its file is still valid.
      if (row.status === 'resolved' && row.source_file) {
        const infos = await getCommonsFileInfos([row.source_file], THUMB_WIDTH[entity.type], fetchOpts);
        const info = infos.get(row.source_file);
        if (info && classifyLicense(info).ok) {
          await repo.touch(entity, nextCheckFor('resolved', entity, now));
          report.unchanged++;
          report.items.push({ type: entity.type, key: entity.key, outcome: 'unchanged', detail: 'kept (still valid)' });
          consecutiveTransient = 0;
          continue;
        }
      }
      await repo.saveMissing(entity, describeMiss(entity, outcome), nextCheckFor('missing', entity, now));
      await repo.removeVariants(previousPaths); // the image is gone from the DB row; do not leave orphans in Storage
      report.missing++;
      report.items.push({ type: entity.type, key: entity.key, outcome: 'missing', detail: outcome.notes.join(' | ').slice(0, 300) });
      consecutiveTransient = 0;
    } catch (err) {
      const transient = err instanceof MediaHttpError ? err.transient : false;
      const attempts = row.attempts + 1;
      const message = err instanceof Error ? err.message : String(err);
      await repo.saveError(entity, message, attempts, transient ? backoffFor(attempts, now) : new Date(now.getTime() + DAY_MS).toISOString());
      report.errors++;
      report.items.push({ type: entity.type, key: entity.key, outcome: 'error', detail: message.slice(0, 200) });
      consecutiveTransient = transient ? consecutiveTransient + 1 : 0;
      log(`error ${id}: ${message}`);
    }
  }

  report.durationMs = Date.now() - startedAt;
  return report;
}
