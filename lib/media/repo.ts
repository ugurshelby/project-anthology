import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';
import { keyToPathSegment } from '@/lib/media/keys';
import type { Candidate, MediaEntity, MediaEntityType, MediaVariant, ProcessedImage } from '@/lib/media/types';
import type { Json, MediaAssetRow } from '@/types/database';

export const MEDIA_BUCKET = 'media';

export type DueRow = Pick<
  MediaAssetRow,
  | 'entity_type' | 'entity_key' | 'season' | 'display_name' | 'wikipedia_url' | 'extra' | 'status' | 'review'
  | 'rejected_files' | 'source_file' | 'attempts' | 'variants' | 'content_sha256'
>;

export interface ResolvedWrite {
  entity: MediaEntity;
  candidate: Candidate;
  processed: ProcessedImage;
  variants: MediaVariant[];
  attribution: string;
  author: string;
  nextCheckAt: string;
}

/**
 * Storage + persistence boundary of the sync. Two implementations: Supabase
 * (cron) and an in-memory/local-disk one (dry runs, tests, local verification).
 */
export interface MediaRepo {
  upsertDiscovered(entities: MediaEntity[]): Promise<void>;
  claimDue(limit: number, nowIso: string): Promise<DueRow[]>;
  uploadVariants(entity: MediaEntity, processed: ProcessedImage): Promise<MediaVariant[]>;
  removeVariants(paths: string[]): Promise<void>;
  saveResolved(write: ResolvedWrite): Promise<void>;
  saveMissing(entity: MediaEntity, note: string, nextCheckAt: string): Promise<void>;
  saveError(entity: MediaEntity, message: string, attempts: number, nextCheckAt: string): Promise<void>;
  touch(entity: MediaEntity, nextCheckAt: string): Promise<void>;
  /** Owner rejected the current image: persist the file in `rejected_files` and hand the row back to the pipeline (review = auto). */
  acknowledgeRejection(entity: MediaEntity, rejectedFiles: string[]): Promise<void>;
  /** Make every `missing` row due now (the resolver improved, so a previous "nothing found" may be stale). Returns how many. */
  requeueMissing(nowIso: string): Promise<number>;
  getState<T>(key: string): Promise<T | null>;
  setState(key: string, value: unknown): Promise<void>;
}

interface UploadBucket {
  upload(
    path: string,
    body: Buffer,
    options: { contentType: string; cacheControl: string; upsert: boolean },
  ): Promise<{ error: { message?: string; status?: number; statusCode?: string | number } | null }>;
}

/**
 * Storage uploads occasionally fail with a gateway error from the CDN in front of Storage (seen 2026-10-07: HTTP 520,
 * empty message, one circuit image). Those are transient: retry a few times before the entity is marked as failed.
 * Client errors (bad request, forbidden, payload too large) are final and surface immediately.
 */
export async function uploadWithRetry(bucket: UploadBucket, path: string, body: Buffer, sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))): Promise<void> {
  const attempts = 3;
  for (let i = 1; i <= attempts; i++) {
    const { error } = await bucket.upload(path, body, { contentType: 'image/webp', cacheControl: '31536000', upsert: true });
    if (!error) return;
    const status = Number(error.status ?? error.statusCode);
    const clientError = Number.isFinite(status) && status >= 400 && status < 500;
    if (clientError || i === attempts) throw new Error(`storage upload ${path}: ${error.message || 'no message'}${Number.isFinite(status) ? ` (HTTP ${status})` : ''}`);
    await sleep(1_000 * i);
  }
}

/** Content-addressed path: a replaced image gets a NEW url, so CDN caching can be immutable. */
export function variantPath(type: MediaEntityType, key: string, sha256: string, width: number): string {
  return `${type}/${keyToPathSegment(key)}/${sha256.slice(0, 10)}/${width}.webp`;
}

// ── Supabase implementation ──────────────────────────────────────────────────

export function createSupabaseRepo(): MediaRepo {
  // The hand-written `Database` generic does not resolve write payloads in supabase-js v2
  // (same limitation the cron routes work around). Row shapes are enforced by our own types above.
  const db = getSupabaseAdmin() as unknown as SupabaseClient;
  const nowIso = () => new Date().toISOString();

  return {
    async upsertDiscovered(entities) {
      if (entities.length === 0) return;
      for (let i = 0; i < entities.length; i += 100) {
        const chunk = entities.slice(i, i + 100);
        // 1) New entities: insert with their season. Existing rows are left untouched (status, schedule, image).
        const full = chunk.map((e) => ({
          entity_type: e.type,
          entity_key: e.key,
          season: e.season ?? null,
          display_name: e.displayName ?? null,
          wikipedia_url: e.wikipediaUrl ?? null,
          aliases: e.aliases ?? [],
          extra: (e.extra ?? {}) as Json,
        }));
        const ins = await db.from('media_assets').upsert(full, { onConflict: 'entity_type,entity_key', ignoreDuplicates: true });
        if (ins.error) throw new Error(`media_assets discover insert: ${ins.error.message}`);

        // 2) Existing entities: refresh descriptive fields only (names/aliases/hints can improve over time).
        //    `season` is deliberately absent here: a partial discovery run must never move it backwards.
        const descriptive = chunk.map((e) => ({
          entity_type: e.type,
          entity_key: e.key,
          display_name: e.displayName ?? null,
          wikipedia_url: e.wikipediaUrl ?? null,
          aliases: e.aliases ?? [],
          extra: (e.extra ?? {}) as Json,
        }));
        const upd = await db.from('media_assets').upsert(descriptive, { onConflict: 'entity_type,entity_key' });
        if (upd.error) throw new Error(`media_assets discover refresh: ${upd.error.message}`);
      }

      // 3) Latest-season bump (only ever forwards): drives "is this driver still active?".
      const bySeason = new Map<string, string[]>();
      for (const e of entities) {
        if (e.season == null || e.type === 'car') continue;
        const k = `${e.type}|${e.season}`;
        bySeason.set(k, [...(bySeason.get(k) ?? []), e.key]);
      }
      for (const [k, keys] of bySeason) {
        const [type, season] = k.split('|') as [string, string];
        for (let i = 0; i < keys.length; i += 100) {
          const { error } = await db
            .from('media_assets')
            .update({ season: Number(season) })
            .eq('entity_type', type)
            .in('entity_key', keys.slice(i, i + 100))
            .or(`season.is.null,season.lt.${Number(season)}`);
          if (error) throw new Error(`media_assets season bump: ${error.message}`);
        }
      }
    },

    async claimDue(limit, now) {
      const { data, error } = await db
        .from('media_assets')
        .select(
          'entity_type, entity_key, season, display_name, wikipedia_url, extra, status, review, rejected_files, source_file, attempts, variants, content_sha256',
        )
        .lte('next_check_at', now)
        .order('next_check_at', { ascending: true })
        .limit(limit);
      if (error) throw new Error(`media_assets claimDue: ${error.message}`);
      return (data ?? []) as DueRow[];
    },

    async uploadVariants(entity, processed) {
      const out: MediaVariant[] = [];
      for (const v of processed.variants) {
        const path = variantPath(entity.type, entity.key, processed.sha256, v.w);
        await uploadWithRetry(db.storage.from(MEDIA_BUCKET), path, v.buffer);
        out.push({ w: v.w, h: v.h, path, bytes: v.bytes });
      }
      return out;
    },

    async removeVariants(paths) {
      if (paths.length === 0) return;
      const { error } = await db.storage.from(MEDIA_BUCKET).remove(paths);
      if (error) console.warn(`[media] storage cleanup failed: ${error.message}`);
    },

    async saveResolved(w) {
      const c = w.candidate;
      const { error } = await db
        .from('media_assets')
        .update({
          status: 'resolved',
          source: c.source,
          source_page_url: c.file.pageUrl,
          source_file: c.file.title,
          author: w.author,
          license: c.license.label,
          license_url: c.license.url,
          attribution: w.attribution,
          is_trademark: w.entity.type === 'team',
          confidence: Math.min(1, Math.round((c.score / 100) * 1000) / 1000),
          width: w.processed.width,
          height: w.processed.height,
          variants: w.variants as unknown as Json,
          blur_data_url: w.processed.blurDataUrl,
          dominant_color: w.processed.dominantColor,
          content_sha256: w.processed.sha256,
          attempts: 0,
          last_error: null,
          resolved_at: nowIso(),
          checked_at: nowIso(),
          next_check_at: w.nextCheckAt,
          updated_at: nowIso(),
        })
        .eq('entity_type', w.entity.type)
        .eq('entity_key', w.entity.key);
      if (error) throw new Error(`media_assets saveResolved: ${error.message}`);
    },

    async saveMissing(entity, note, nextCheckAt) {
      const { error } = await db
        .from('media_assets')
        .update({
          status: 'missing',
          source: null,
          source_page_url: null,
          source_file: null,
          author: null,
          license: null,
          license_url: null,
          attribution: null,
          width: null,
          height: null,
          variants: [] as unknown as Json,
          blur_data_url: null,
          dominant_color: null,
          content_sha256: null,
          attempts: 0,
          last_error: note,
          checked_at: nowIso(),
          next_check_at: nextCheckAt,
          updated_at: nowIso(),
        })
        .eq('entity_type', entity.type)
        .eq('entity_key', entity.key);
      if (error) throw new Error(`media_assets saveMissing: ${error.message}`);
    },

    async saveError(entity, message, attempts, nextCheckAt) {
      const { error } = await db
        .from('media_assets')
        .update({
          last_error: message.slice(0, 500),
          attempts,
          checked_at: nowIso(),
          next_check_at: nextCheckAt,
          updated_at: nowIso(),
        })
        .eq('entity_type', entity.type)
        .eq('entity_key', entity.key);
      if (error) throw new Error(`media_assets saveError: ${error.message}`);
    },

    async touch(entity, nextCheckAt) {
      const { error } = await db
        .from('media_assets')
        .update({ checked_at: nowIso(), next_check_at: nextCheckAt, last_error: null, updated_at: nowIso() })
        .eq('entity_type', entity.type)
        .eq('entity_key', entity.key);
      if (error) throw new Error(`media_assets touch: ${error.message}`);
    },

    async acknowledgeRejection(entity, rejectedFiles) {
      const { error } = await db
        .from('media_assets')
        .update({ review: 'auto', rejected_files: rejectedFiles, updated_at: nowIso() })
        .eq('entity_type', entity.type)
        .eq('entity_key', entity.key);
      if (error) throw new Error(`media_assets acknowledgeRejection: ${error.message}`);
    },

    async requeueMissing(now) {
      const { data, error } = await db
        .from('media_assets')
        .update({ next_check_at: now, updated_at: now })
        .eq('status', 'missing')
        .select('entity_key');
      if (error) throw new Error(`media_assets requeueMissing: ${error.message}`);
      return (data ?? []).length;
    },

    async getState<T>(key: string) {
      const { data, error } = await db.from('media_sync_state').select('value').eq('key', key).maybeSingle();
      if (error) throw new Error(`media_sync_state get: ${error.message}`);
      return (data?.value as T | undefined) ?? null;
    },

    async setState(key, value) {
      const { error } = await db
        .from('media_sync_state')
        .upsert({ key, value: value as Json, updated_at: nowIso() }, { onConflict: 'key' });
      if (error) throw new Error(`media_sync_state set: ${error.message}`);
    },
  };
}

// ── In-memory implementation (dry runs / tests) ──────────────────────────────

export interface MemoryRecord {
  entity: MediaEntity;
  status: 'pending' | 'resolved' | 'missing';
  nextCheckAt: string;
  attempts: number;
  detail?: {
    file: string;
    license: string;
    author: string;
    attribution: string;
    score: number;
    source: string;
    width: number;
    height: number;
    variants: MediaVariant[];
    pageUrl: string;
  };
  note?: string;
  rejectedFiles?: string[];
}

/** Keeps everything in memory; optionally writes the WebP variants to `outDir` for eyeballing. */
export function createMemoryRepo(outDir?: string): MediaRepo & { records: Map<string, MemoryRecord>; state: Map<string, unknown> } {
  const records = new Map<string, MemoryRecord>();
  const state = new Map<string, unknown>();
  const id = (e: Pick<MediaEntity, 'type' | 'key'>) => `${e.type}|${e.key}`;

  return {
    records,
    state,
    async upsertDiscovered(entities) {
      for (const e of entities) {
        const existing = records.get(id(e));
        if (!existing) {
          records.set(id(e), { entity: e, status: 'pending', nextCheckAt: new Date(0).toISOString(), attempts: 0 });
        } else {
          // refresh descriptive fields only; never touch status/schedule, never move `season` backwards
          existing.entity = { ...existing.entity, ...e, season: Math.max(existing.entity.season ?? 0, e.season ?? 0) || null };
        }
      }
    },
    async claimDue(limit, now) {
      return Array.from(records.values())
        .filter((r) => r.nextCheckAt <= now)
        .slice(0, limit)
        .map((r) => ({
          entity_type: r.entity.type,
          entity_key: r.entity.key,
          season: r.entity.season ?? null,
          display_name: r.entity.displayName ?? null,
          wikipedia_url: r.entity.wikipediaUrl ?? null,
          extra: (r.entity.extra ?? {}) as Json,
          status: r.status,
          review: 'auto' as const,
          rejected_files: [],
          source_file: r.detail?.file ?? null,
          attempts: r.attempts,
          variants: (r.detail?.variants ?? []) as unknown as Json,
          content_sha256: null,
        }));
    },
    async uploadVariants(entity, processed) {
      const out: MediaVariant[] = [];
      for (const v of processed.variants) {
        const path = variantPath(entity.type, entity.key, processed.sha256, v.w);
        if (outDir) {
          const full = join(outDir, path);
          await mkdir(dirname(full), { recursive: true });
          await writeFile(full, v.buffer);
        }
        out.push({ w: v.w, h: v.h, path, bytes: v.bytes });
      }
      return out;
    },
    async removeVariants() {},
    async saveResolved(w) {
      const r = records.get(id(w.entity));
      if (!r) return;
      r.status = 'resolved';
      r.attempts = 0;
      r.nextCheckAt = w.nextCheckAt;
      r.detail = {
        file: w.candidate.file.title,
        license: w.candidate.license.label,
        author: w.author,
        attribution: w.attribution,
        score: w.candidate.score,
        source: w.candidate.source,
        width: w.processed.width,
        height: w.processed.height,
        variants: w.variants,
        pageUrl: w.candidate.file.pageUrl,
      };
    },
    async saveMissing(entity, note, nextCheckAt) {
      const r = records.get(id(entity));
      if (!r) return;
      r.status = 'missing';
      r.note = note;
      r.nextCheckAt = nextCheckAt;
      r.detail = undefined;
    },
    async saveError(entity, message, attempts, nextCheckAt) {
      const r = records.get(id(entity));
      if (!r) return;
      r.note = message;
      r.attempts = attempts;
      r.nextCheckAt = nextCheckAt;
    },
    async touch(entity, nextCheckAt) {
      const r = records.get(id(entity));
      if (r) r.nextCheckAt = nextCheckAt;
    },
    async acknowledgeRejection(entity, rejectedFiles) {
      const r = records.get(id(entity));
      if (r) r.rejectedFiles = rejectedFiles;
    },
    async requeueMissing(now) {
      let n = 0;
      for (const r of records.values()) {
        if (r.status !== 'missing') continue;
        r.nextCheckAt = now;
        n++;
      }
      return n;
    },
    async getState<T>(key: string) {
      return (state.get(key) as T | undefined) ?? null;
    },
    async setState(key, value) {
      state.set(key, value);
    },
  };
}
