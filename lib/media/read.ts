import { cache } from 'react';
import { isValidMediaKey } from '@/lib/media/keys';
import { MEDIA_BUCKET } from '@/lib/media/repo';
import type { MediaEntityType } from '@/lib/media/types';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Public read layer: what pages and /api/media use. It only ever talks to OUR
 * database (anon client, RLS = resolved rows only) — never to Wikimedia — and it
 * NEVER throws for a missing image: every requested key always gets an answer,
 * either `image` or `placeholder`. Frontend rule: render `image` when present,
 * otherwise draw the type-specific SVG placeholder. No other fallback exists.
 */

export interface MediaImageVariant {
  w: number;
  h: number;
  src: string;
}

export interface MediaImage {
  /** Largest variant (use with `srcSet` + `sizes`; width/height give the intrinsic ratio). */
  src: string;
  srcSet: string;
  width: number;
  height: number;
  variants: MediaImageVariant[];
  /** Tiny inline WebP (data URL) for blur-up while the real image loads. */
  blurDataURL: string | null;
  /** Average colour, usable as an instant background to avoid layout flash. */
  dominantColor: string | null;
}

export interface MediaAttribution {
  /** Ready-to-render credit line: `Author / Wikimedia Commons, CC BY-SA 4.0`. */
  text: string;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
  sourceUrl: string | null;
  /** True for team logos: show the "unofficial fan project, trademarks belong to their owners" note. */
  trademark: boolean;
}

export type MediaResult =
  | { status: 'image'; type: MediaEntityType; key: string; image: MediaImage; attribution: MediaAttribution }
  | { status: 'placeholder'; type: MediaEntityType; key: string; placeholder: { kind: MediaEntityType; seed: string } };

interface MediaDbRow {
  entity_type: MediaEntityType;
  entity_key: string;
  aliases?: string[] | null;
  width: number | null;
  height: number | null;
  variants: unknown;
  blur_data_url: string | null;
  dominant_color: string | null;
  attribution: string | null;
  author: string | null;
  license: string | null;
  license_url: string | null;
  source_page_url: string | null;
  is_trademark: boolean;
}

/** Columns the anon role may select (matches the column-level grant in the migration). */
const PUBLIC_COLUMNS =
  'entity_type, entity_key, aliases, width, height, variants, blur_data_url, dominant_color, attribution, author, license, license_url, source_page_url, is_trademark';

export function publicMediaUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const safe = path.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${safe}`;
}

export function placeholderResult(type: MediaEntityType, key: string): MediaResult {
  return { status: 'placeholder', type, key, placeholder: { kind: type, seed: key } };
}

function parseVariants(raw: unknown): Array<{ w: number; h: number; path: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (v): v is { w: number; h: number; path: string } =>
        typeof v === 'object' && v !== null && typeof (v as { w?: unknown }).w === 'number' && typeof (v as { path?: unknown }).path === 'string',
    )
    .sort((a, b) => a.w - b.w);
}

export function rowToResult(row: MediaDbRow): MediaResult {
  const variants = parseVariants(row.variants).map((v) => ({ w: v.w, h: v.h, src: publicMediaUrl(v.path) }));
  const largest = variants[variants.length - 1];
  if (!largest) return placeholderResult(row.entity_type, row.entity_key);
  return {
    status: 'image',
    type: row.entity_type,
    key: row.entity_key,
    image: {
      src: largest.src,
      srcSet: variants.map((v) => `${v.src} ${v.w}w`).join(', '),
      width: largest.w,
      height: largest.h,
      variants,
      blurDataURL: row.blur_data_url,
      dominantColor: row.dominant_color,
    },
    attribution: {
      text: row.attribution ?? (row.author && row.license ? `${row.author} / Wikimedia Commons, ${row.license}` : 'Wikimedia Commons'),
      author: row.author,
      license: row.license,
      licenseUrl: row.license_url,
      sourceUrl: row.source_page_url,
      trademark: row.is_trademark,
    },
  };
}

/** hyphen ↔ underscore spellings of a requested key (F1DB `red-bull` vs Jolpica `red_bull`). */
function keyVariants(key: string): string[] {
  return Array.from(new Set([key, key.replace(/-/g, '_'), key.replace(/_/g, '-')]));
}

/**
 * Batch lookup. One query for any number of keys of one type. A requested key matches a row by its
 * `entity_key` OR any of its `aliases` (and hyphen/underscore spellings), so archive pages that know
 * only the F1DB id still resolve. Result has an entry for EVERY requested key. Any database/config
 * error degrades to placeholders for all keys (and is logged), it never breaks the page.
 */
export async function getMediaBatch(type: MediaEntityType, keys: string[]): Promise<Map<string, MediaResult>> {
  const out = new Map<string, MediaResult>();
  for (const k of keys) out.set(k, placeholderResult(type, k));
  // Keys end up inside a PostgREST filter expression: anything outside the strict key alphabet
  // (commas, parentheses, quotes…) is never sent to the database, it just stays a placeholder.
  const safeKeys = keys.filter(isValidMediaKey);
  if (safeKeys.length === 0) return out;
  try {
    const wanted = Array.from(new Set(safeKeys.flatMap(keyVariants)));
    const list = wanted.join(',');
    const { data, error } = await getSupabaseClient()
      .from('media_assets')
      .select(PUBLIC_COLUMNS)
      .eq('entity_type', type)
      .or(`entity_key.in.(${list}),aliases.ov.{${list}}`);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as MediaDbRow[];
    for (const key of safeKeys) {
      const variants = keyVariants(key);
      // exact entity_key first, then variants, then aliases
      const row =
        rows.find((r) => r.entity_key === key) ??
        rows.find((r) => variants.includes(r.entity_key)) ??
        rows.find((r) => (r.aliases ?? []).some((a) => variants.includes(a)));
      if (row) out.set(key, { ...rowToResult(row), key });
    }
  } catch (err) {
    console.warn(`[media] read failed for ${type} (${keys.length} keys), serving placeholders: ${String(err)}`);
  }
  return out;
}

/** Single lookup, deduplicated per request by React `cache()` (safe to call from many components). */
export const getMedia = cache(async (type: MediaEntityType, key: string): Promise<MediaResult> => {
  const map = await getMediaBatch(type, [key]);
  return map.get(key) ?? placeholderResult(type, key);
});
