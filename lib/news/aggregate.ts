/**
 * F1 news RSS aggregation (Masterplan Karar A/E).
 *
 * Logic extracted from old-versions-valuable-files/route.ts so it can be shared
 * by both the cron route (sync-news) and any direct API route.
 *
 * Features preserved from the old route:
 *  - Per-source AbortController timeout.
 *  - F1 keyword filter + non-F1 keyword exclusion.
 *  - Canonical URL deduplication (strips UTM / hash).
 *  - Jaccard title-similarity clustering (threshold 0.65).
 *  - Sorted newest-first.
 *  - JSDOM DOMParser polyfill for Node.js.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface RawNewsItem {
  title: string;
  summary: string;
  url: string;
  canonicalUrl: string;
  sourceName: string;
  image: string;
  publishedTs: number;
  publishedISO: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  sources: string[];
  image: string;
  publishedAt: string;
  publishedTs: number;
  dateLabel: string;
}

// ── Sources ────────────────────────────────────────────────────────────────

export const NEWS_SOURCES = [
  {
    name: 'The Race',
    rssUrl: 'https://www.the-race.com/feed/',
    baseUrl: 'https://www.the-race.com',
  },
  {
    name: 'Autosport',
    rssUrl: 'https://www.autosport.com/rss/f1/news/',
    baseUrl: 'https://www.autosport.com',
  },
  {
    name: 'Motorsport.com',
    rssUrl: 'https://www.motorsport.com/rss/f1/news/',
    baseUrl: 'https://www.motorsport.com',
  },
  {
    name: 'BBC Sport F1',
    rssUrl: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml',
    baseUrl: 'https://www.bbc.co.uk',
  },
  {
    name: 'RaceFans',
    rssUrl: 'https://www.racefans.net/feed/',
    baseUrl: 'https://www.racefans.net',
  },
] as const;

// ── F1 keyword sets ────────────────────────────────────────────────────────

const F1_KEYWORDS = [
  'f1', 'formula 1', 'formula one', 'formula1', 'formula-1',
  'grand prix', ' gp ', 'fia',
  'ferrari', 'mercedes', 'red bull', 'mclaren', 'alpine', 'aston martin',
  'williams', 'haas', 'alphatauri', 'sauber', 'kick sauber', 'racing bulls',
  'hamilton', 'verstappen', 'leclerc', 'sainz', 'norris', 'piastri',
  'russell', 'alonso', 'stroll', 'ocon', 'gasly', 'albon',
  'bottas', 'zhou', 'tsunoda', 'hulkenberg', 'magnussen',
  'bearman', 'lawson', 'doohan', 'antonelli', 'colapinto',
  'lindblad', 'bortoleto', 'cadillac', 'audi',
  'monaco', 'monza', 'silverstone', 'spa-francorchamps', 'suzuka', 'interlagos',
  'bahrain', 'jeddah', 'melbourne', 'imola', 'barcelona', 'montreal',
  'red bull ring', 'hungaroring', 'zandvoort', 'marina bay', 'yas marina',
  'qualifying', 'pole position', 'podium', 'constructors championship',
  'drivers championship', 'drs', 'safety car',
];

const NON_F1_KEYWORDS = [
  'motogp', 'moto gp', 'moto2', 'moto3', 'motoe',
  'wrc', 'world rally', 'rally championship',
  'wec', 'world endurance', 'le mans', '24 hours of',
  'indycar', 'indy car', 'indy 500',
  'nascar',
  'formula e', 'formula-e',
  'formula 2', ' f2 ', 'f2 championship',
  'super gt', 'dtm', 'gt3 ', 'gt4 ',
  'superbike', 'worldsbk', 'wsbk',
  'motocross', 'mxgp', 'supercross',
  'dakar', 'rally raid',
  'v8 supercars', 'supercars championship',
  'btcc', 'british touring car', 'wtcr',
];

// ── DOMParser polyfill (Node.js) ──────────────────────────────────────────

async function ensureDOMParser(): Promise<void> {
  const g = globalThis as { DOMParser?: unknown };
  if (typeof g.DOMParser !== 'undefined') return;
  const { JSDOM } = await import('jsdom');
  (g as { DOMParser: unknown }).DOMParser = class NodeDOMParser {
    parseFromString(str: string, type: string): Document {
      const contentType = type === 'text/xml' ? 'text/xml' : 'text/html';
      const dom = new JSDOM(str, { contentType });
      return dom.window.document as unknown as Document;
    }
  };
}

type DOMParserCtor = { new (): { parseFromString(s: string, t: string): Document } };

// ── Text utilities ────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(parseInt(n, 10)));
}

function sanitizeText(text: string | undefined | null, maxLen = 800): string {
  if (!text) return '';
  let out = String(text);
  out = out.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
  out = out.replace(/<[^>]+>/g, ' ');
  out = decodeEntities(out);
  out = out.replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length > maxLen) out = out.slice(0, maxLen - 1) + '…';
  return out;
}

function parseDateToTs(d: string | undefined | null): number {
  if (!d) return 0;
  const s = String(d).trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

function formatDateLabel(ts: number): string {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function canonicalize(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    drop.forEach((p) => u.searchParams.delete(p));
    let path = u.pathname.replace(/\/+$/, '');
    if (!path) path = '/';
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`;
  } catch {
    return url;
  }
}

function absoluteUrl(src: string, baseUrl: string): string {
  if (!src) return '';
  const cleaned = src.trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
  if (cleaned.startsWith('//')) return `https:${cleaned}`;
  try {
    const b = new URL(baseUrl);
    if (cleaned.startsWith('/')) return `${b.protocol}//${b.host}${cleaned}`;
    return `${b.protocol}//${b.host}/${cleaned}`;
  } catch {
    return '';
  }
}

function extractImageFromHtml(html: string, baseUrl: string): string {
  if (!html) return '';
  try {
    const parser = new (globalThis as unknown as { DOMParser: DOMParserCtor }).DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const candidates = Array.from(doc.querySelectorAll('img'));
    for (const img of candidates) {
      const raw =
        img.getAttribute('src') ||
        img.getAttribute('data-src') ||
        img.getAttribute('data-lazy-src');
      if (raw) {
        const abs = absoluteUrl(raw.split('?')[0], baseUrl);
        if (abs && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(abs)) return abs;
        if (abs) return abs;
      }
    }
  } catch {
    /* ignore */
  }
  return '';
}

// ── F1 relevance filter ───────────────────────────────────────────────────

function isF1Related(item: { title: string; summary: string; url: string }): boolean {
  const url = item.url.toLowerCase();
  const haystack = ` ${item.title} ${item.summary} `.toLowerCase();
  for (const kw of NON_F1_KEYWORDS) {
    if (haystack.includes(kw)) return false;
  }
  if (url.includes('/f1/') || url.includes('/formula-1/') || url.includes('/formula1/')) return true;
  for (const kw of F1_KEYWORDS) {
    if (haystack.includes(kw)) return true;
  }
  return false;
}

// ── Stable ID ─────────────────────────────────────────────────────────────

export function stableId(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

// ── Jaccard clustering ────────────────────────────────────────────────────

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function clusterAndPickPrimary(items: RawNewsItem[]): NewsItem[] {
  const SIM_THRESHOLD = 0.65;
  const tokens = items.map((it) => tokenize(it.title));
  const claimed = new Array<boolean>(items.length).fill(false);
  const result: NewsItem[] = [];

  for (let i = 0; i < items.length; i++) {
    if (claimed[i]) continue;
    claimed[i] = true;
    const cluster: number[] = [i];
    for (let j = i + 1; j < items.length; j++) {
      if (claimed[j]) continue;
      if (jaccard(tokens[i], tokens[j]) >= SIM_THRESHOLD) {
        cluster.push(j);
        claimed[j] = true;
      }
    }

    const inCluster = cluster.map((idx) => items[idx]);
    const withImage = inCluster.filter((x) => x.image);
    const primary = (withImage.length > 0 ? withImage : inCluster).reduce((best, cur) =>
      cur.publishedTs > best.publishedTs ? cur : best,
    );
    const image = primary.image || inCluster.find((x) => x.image)?.image || '';
    const sources = Array.from(new Set(inCluster.map((x) => x.sourceName)));
    const ts = inCluster.reduce((m, x) => Math.max(m, x.publishedTs), 0);

    result.push({
      id: stableId(primary.canonicalUrl),
      title: primary.title,
      summary: primary.summary,
      url: primary.url,
      sourceName: primary.sourceName,
      sources,
      image,
      publishedAt: ts ? new Date(ts).toISOString() : '',
      publishedTs: ts,
      dateLabel: formatDateLabel(ts),
    });
  }

  return result;
}

// ── RSS feed fetcher ──────────────────────────────────────────────────────

async function fetchRSSFeed(
  source: { name: string; rssUrl: string; baseUrl: string },
  signal: AbortSignal,
): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(source.rssUrl, {
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProjectAnthology/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    if (xml.trim().startsWith('<!DOCTYPE') || xml.trim().toLowerCase().startsWith('<html')) return [];

    const parser = new (globalThis as unknown as { DOMParser: DOMParserCtor }).DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    const items = Array.from(doc.querySelectorAll('item'));
    const out: RawNewsItem[] = [];

    for (const it of items) {
      const title = sanitizeText(it.querySelector('title')?.textContent || '', 300);
      let link = (it.querySelector('link')?.textContent || '').trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const description = it.querySelector('description')?.textContent || '';
      const contentEncoded = it.getElementsByTagName('content:encoded')[0]?.textContent || '';
      const pubDate =
        it.querySelector('pubDate')?.textContent ||
        it.querySelector('date')?.textContent ||
        '';
      const guid = (it.querySelector('guid')?.textContent || '').trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim();

      if (!link && guid.startsWith('http')) link = guid;
      if (!link || !link.startsWith('http')) continue;
      if (!title) continue;

      let image = '';
      const enclosure = it.querySelector('enclosure');
      const enclosureType = enclosure?.getAttribute('type') || '';
      if (enclosure && (!enclosureType || enclosureType.startsWith('image'))) {
        image = absoluteUrl(enclosure.getAttribute('url') || '', source.baseUrl);
      }
      if (!image) {
        const mediaContent = it.getElementsByTagName('media:content')[0];
        if (mediaContent) image = absoluteUrl(mediaContent.getAttribute('url') || '', source.baseUrl);
      }
      if (!image) {
        const mediaThumb = it.getElementsByTagName('media:thumbnail')[0];
        if (mediaThumb) image = absoluteUrl(mediaThumb.getAttribute('url') || '', source.baseUrl);
      }
      if (!image) image = extractImageFromHtml(contentEncoded || description, source.baseUrl);

      const ts = parseDateToTs(pubDate);

      out.push({
        title,
        summary: sanitizeText(description, 600),
        url: link,
        canonicalUrl: canonicalize(link),
        sourceName: source.name,
        image: image || '',
        publishedTs: ts,
        publishedISO: ts ? new Date(ts).toISOString() : '',
      });
    }
    return out;
  } catch {
    return [];
  }
}

// ── processFeeds (exported for tests) ────────────────────────────────────

/** Filter, dedupe, cluster raw items. Pure function — no I/O. */
export function processFeeds(rawItems: RawNewsItem[]): NewsItem[] {
  const f1Only = rawItems.filter((it) => isF1Related(it));
  const seen = new Map<string, RawNewsItem>();
  for (const it of f1Only) {
    const existing = seen.get(it.canonicalUrl);
    if (!existing || it.publishedTs > existing.publishedTs) {
      seen.set(it.canonicalUrl, it);
    }
  }
  const deduped = Array.from(seen.values());
  const clustered = clusterAndPickPrimary(deduped);
  return clustered.sort((a, b) => b.publishedTs - a.publishedTs);
}

// ── Main aggregator ────────────────────────────────────────────────────────

const PER_FEED_TIMEOUT_MS = 6_000;
const TOTAL_TIMEOUT_MS = 12_000;

export interface AggregateOptions {
  maxItems?: number;
}

/** Fetch + process every RSS source into the full deduped/clustered feed. */
async function aggregateUncached(): Promise<NewsItem[]> {
  await ensureDOMParser();

  const totalDeadline = Date.now() + TOTAL_TIMEOUT_MS;
  const perFeed = NEWS_SOURCES.map((source) => {
    const ctrl = new AbortController();
    const budget = Math.min(PER_FEED_TIMEOUT_MS, Math.max(1_000, totalDeadline - Date.now()));
    const timer = setTimeout(() => ctrl.abort(), budget);
    return fetchRSSFeed(source, ctrl.signal).finally(() => clearTimeout(timer));
  });

  const settled = await Promise.allSettled(perFeed);
  const all: RawNewsItem[] = [];
  settled.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });

  return processFeeds(all);
}

// ── In-memory cache (per warm instance) ──────────────────────────────────────
// Public /news calls aggregate() on every request (revalidate=0). The 15-min
// memo stops a hammering of the RSS sources: one fetch per warm instance per
// window, shared across concurrent requests via the in-flight guard.

const AGGREGATE_TTL_MS = 15 * 60 * 1000;
let _cache: { items: NewsItem[]; ts: number } | null = null;
let _inflight: Promise<NewsItem[]> | null = null;

/**
 * Fetch all RSS sources, process, and return NewsItems (newest first).
 * Backed by a 15-minute in-memory cache with a stampede guard; the cached full
 * set is sliced to `maxItems` per call. Suitable for the cron route and direct
 * API routes.
 */
export async function aggregate(opts: AggregateOptions = {}): Promise<NewsItem[]> {
  const { maxItems = 60 } = opts;

  // 1) Fresh cache → serve immediately.
  if (_cache && Date.now() - _cache.ts < AGGREGATE_TTL_MS) {
    return _cache.items.slice(0, maxItems);
  }

  // 2) A fetch is already running → share it (stampede guard).
  if (_inflight) {
    const items = await _inflight;
    return items.slice(0, maxItems);
  }

  // 3) Start a fetch; cache on success, serve stale on failure.
  _inflight = aggregateUncached()
    .then((items) => {
      _cache = { items, ts: Date.now() };
      return items;
    })
    .finally(() => {
      _inflight = null;
    });

  try {
    const items = await _inflight;
    return items.slice(0, maxItems);
  } catch (err) {
    if (_cache) return _cache.items.slice(0, maxItems); // serve-stale-on-error
    throw err;
  }
}
