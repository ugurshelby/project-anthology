import { fetchJson, type FetchOptions } from '@/lib/media/http';
import { htmlToPlainText } from '@/lib/media/license';
import type { CommonsFileInfo } from '@/lib/media/types';

/**
 * Thin typed clients for the three Wikimedia APIs the sync uses:
 *   en.wikipedia.org  -> Wikipedia page title -> Wikidata QID (pageprops)
 *   www.wikidata.org  -> QID -> image claims (P18 image, P154 logo, P373 Commons category)
 *   commons.wikimedia.org -> file metadata, license, categories, search
 * All batch up to 50 titles/ids per request to stay far below rate limits.
 */

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const WIKIPEDIA = 'https://en.wikipedia.org/w/api.php';
const WIKIDATA = 'https://www.wikidata.org/w/api.php';
const BATCH = 50;

function qs(params: Record<string, string>): string {
  return new URLSearchParams({ format: 'json', formatversion: '2', ...params }).toString();
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// ── Wikipedia: title -> QID ──────────────────────────────────────────────────

export function wikipediaTitleFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!/(^|\.)wikipedia\.org$/.test(u.hostname)) return null;
    const m = /^\/wiki\/(.+)$/.exec(u.pathname);
    if (!m) return null;
    return decodeURIComponent(m[1]).replace(/_/g, ' ');
  } catch {
    return null;
  }
}

interface WpQuery {
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    redirects?: Array<{ from: string; to: string }>;
    pages?: Array<{ title: string; missing?: boolean; pageprops?: { wikibase_item?: string } }>;
  };
}

/** Returns Map<requestedTitle, QID>; titles without a Wikidata item are absent. */
export async function resolveQids(titles: string[], opts: FetchOptions = {}): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const part of chunk(Array.from(new Set(titles)), BATCH)) {
    const data = await fetchJson<WpQuery>(
      `${WIKIPEDIA}?${qs({ action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: '1', titles: part.join('|') })}`,
      opts,
    );
    const q = data.query;
    if (!q) continue;
    const hop = new Map<string, string>();
    for (const n of q.normalized ?? []) hop.set(n.from, n.to);
    const redirect = new Map<string, string>();
    for (const r of q.redirects ?? []) redirect.set(r.from, r.to);
    const byTitle = new Map<string, string>();
    for (const p of q.pages ?? []) {
      if (p.pageprops?.wikibase_item) byTitle.set(p.title, p.pageprops.wikibase_item);
    }
    for (const requested of part) {
      let t = hop.get(requested) ?? requested;
      t = redirect.get(t) ?? t;
      const qid = byTitle.get(t);
      if (qid) result.set(requested, qid);
    }
  }
  return result;
}

// ── Wikidata: QID -> image claims ────────────────────────────────────────────

export interface WikidataMedia {
  p18: string[]; // image files (without 'File:')
  p154: string[]; // logo image files
  commonsCategory: string | null; // P373
}

interface WdEntities {
  entities?: Record<
    string,
    {
      claims?: Record<
        string,
        Array<{ rank?: string; mainsnak?: { datavalue?: { value?: unknown } } }>
      >;
    }
  >;
}

function fileClaims(claims: NonNullable<WdEntities['entities']>[string]['claims'], prop: string): string[] {
  const list = claims?.[prop] ?? [];
  const usable = list.filter((c) => c.rank !== 'deprecated');
  const preferred = usable.filter((c) => c.rank === 'preferred');
  return (preferred.length ? preferred : usable)
    .map((c) => c.mainsnak?.datavalue?.value)
    .filter((v): v is string => typeof v === 'string');
}

export async function getWikidataMedia(qids: string[], opts: FetchOptions = {}): Promise<Map<string, WikidataMedia>> {
  const out = new Map<string, WikidataMedia>();
  for (const part of chunk(Array.from(new Set(qids)), BATCH)) {
    const data = await fetchJson<WdEntities>(
      `${WIKIDATA}?${qs({ action: 'wbgetentities', props: 'claims', ids: part.join('|') })}`,
      opts,
    );
    for (const [qid, ent] of Object.entries(data.entities ?? {})) {
      out.set(qid, {
        p18: fileClaims(ent.claims, 'P18'),
        p154: fileClaims(ent.claims, 'P154'),
        commonsCategory: fileClaims(ent.claims, 'P373')[0] ?? null,
      });
    }
  }
  return out;
}

// ── Commons: file metadata ───────────────────────────────────────────────────

interface CommonsQuery {
  continue?: Record<string, string>;
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    redirects?: Array<{ from: string; to: string }>;
    pages?: Array<{
      title: string;
      missing?: boolean;
      categories?: Array<{ title: string }>;
      imageinfo?: Array<{
        url?: string;
        descriptionurl?: string;
        thumburl?: string;
        width?: number;
        height?: number;
        mime?: string;
        extmetadata?: Record<string, { value?: string }>;
      }>;
    }>;
  };
}

const META_FIELDS =
  'License|LicenseShortName|LicenseUrl|NonFree|Copyrighted|Restrictions|Artist|Credit|ImageDescription|ObjectName|DateTimeOriginal|DateTime';

export function normalizeFileTitle(name: string): string {
  const t = name.trim().replace(/_/g, ' ');
  return /^file:/i.test(t) ? `File:${t.slice(5).trim()}` : `File:${t}`;
}

function parseYear(value: string | undefined): number | null {
  if (!value) return null;
  const m = /(\d{4})/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  return y >= 1850 && y <= 2100 ? y : null;
}

function toInfo(p: NonNullable<NonNullable<CommonsQuery['query']>['pages']>[number]): CommonsFileInfo | null {
  const ii = p.imageinfo?.[0];
  if (!ii || p.missing) return null;
  const m = ii.extmetadata ?? {};
  const v = (k: string): string => m[k]?.value ?? '';
  const copyrightedRaw = v('Copyrighted').toLowerCase();
  return {
    title: p.title,
    pageUrl: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`,
    width: ii.width ?? 0,
    height: ii.height ?? 0,
    mime: ii.mime ?? '',
    thumbUrl: ii.thumburl ?? null,
    originalUrl: ii.url ?? null,
    licenseCode: v('License'),
    licenseShortName: v('LicenseShortName'),
    licenseUrl: v('LicenseUrl') || null,
    nonFree: v('NonFree').toLowerCase() === 'true',
    copyrighted: copyrightedRaw === 'true' ? true : copyrightedRaw === 'false' ? false : null,
    restrictions: v('Restrictions'),
    artist: htmlToPlainText(v('Artist')),
    credit: htmlToPlainText(v('Credit')),
    description: htmlToPlainText(v('ImageDescription'), 300),
    objectName: htmlToPlainText(v('ObjectName'), 200),
    year: parseYear(v('DateTimeOriginal')) ?? parseYear(v('DateTime')),
    categories: (p.categories ?? []).map((c) => c.title.replace(/^Category:/, '')),
  };
}

/**
 * Metadata for up to N file titles, batched. `thumbWidth` asks Commons for a
 * server-rendered copy at that width (SVG logos arrive as PNG). Missing files
 * are simply absent from the map. Keys are the titles AS REQUESTED.
 */
export async function getCommonsFileInfos(
  titles: string[],
  thumbWidth: number,
  opts: FetchOptions = {},
): Promise<Map<string, CommonsFileInfo>> {
  const result = new Map<string, CommonsFileInfo>();
  const wanted = Array.from(new Set(titles.map(normalizeFileTitle)));
  for (const part of chunk(wanted, BATCH)) {
    const infoByTitle = new Map<string, CommonsFileInfo>();
    const cats = new Map<string, string[]>();
    let cont: Record<string, string> | undefined;
    let normalized: Array<{ from: string; to: string }> = [];
    let redirects: Array<{ from: string; to: string }> = [];
    for (let page = 0; page < 4; page++) {
      const data = await fetchJson<CommonsQuery>(
        `${COMMONS}?${qs({
          action: 'query',
          prop: 'imageinfo|categories',
          iiprop: 'url|size|mime|extmetadata',
          iiurlwidth: String(thumbWidth),
          iiextmetadatafilter: META_FIELDS,
          clshow: '!hidden',
          cllimit: 'max',
          redirects: '1',
          titles: part.join('|'),
          ...(cont ?? {}),
        })}`,
        opts,
      );
      normalized = normalized.concat(data.query?.normalized ?? []);
      redirects = redirects.concat(data.query?.redirects ?? []);
      for (const p of data.query?.pages ?? []) {
        const info = toInfo(p);
        if (info && !infoByTitle.has(p.title)) infoByTitle.set(p.title, info);
        if (p.categories) cats.set(p.title, (cats.get(p.title) ?? []).concat(p.categories.map((c) => c.title.replace(/^Category:/, ''))));
      }
      if (!data.continue) break;
      cont = data.continue;
    }
    for (const [t, c] of cats) {
      const info = infoByTitle.get(t);
      if (info) info.categories = Array.from(new Set(c));
    }
    const hop = new Map(normalized.map((n) => [n.from, n.to]));
    const redir = new Map(redirects.map((r) => [r.from, r.to]));
    for (const requested of part) {
      let t = hop.get(requested) ?? requested;
      t = redir.get(t) ?? t;
      const info = infoByTitle.get(t);
      if (info) result.set(requested, info);
    }
  }
  return result;
}

// ── Commons: search / category listing ───────────────────────────────────────

interface SearchResp {
  query?: { search?: Array<{ title: string }> };
}

/** File-namespace full-text search. Order = Commons relevance. */
export async function searchCommonsFiles(query: string, limit = 20, opts: FetchOptions = {}): Promise<string[]> {
  const data = await fetchJson<SearchResp>(
    `${COMMONS}?${qs({ action: 'query', list: 'search', srsearch: query, srnamespace: '6', srlimit: String(limit) })}`,
    opts,
  );
  return (data.query?.search ?? []).map((s) => s.title);
}

interface CatResp {
  query?: { categorymembers?: Array<{ title: string }> };
}

export async function listCategoryFiles(category: string, limit = 60, opts: FetchOptions = {}): Promise<string[]> {
  const title = /^category:/i.test(category) ? category : `Category:${category}`;
  const data = await fetchJson<CatResp>(
    `${COMMONS}?${qs({ action: 'query', list: 'categorymembers', cmtitle: title, cmtype: 'file', cmlimit: String(limit) })}`,
    opts,
  );
  return (data.query?.categorymembers ?? []).map((m) => m.title);
}
