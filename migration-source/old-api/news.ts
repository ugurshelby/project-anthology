import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * F1 News aggregator
 * - Pulls RSS from a small list of high-signal F1 sources (parallel, per-source timeout).
 * - Filters to F1-only items.
 * - Deduplicates by canonical URL.
 * - Conservatively clusters near-duplicate stories (same headline across outlets) and
 *   keeps the original primary item intact (title, summary, url) — never invents text.
 * - Sorts strictly by publication time (newest first) using a numeric epoch.
 */

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

interface RawItem {
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
  /** Pre-formatted display label, e.g. "14 Apr 2026". */
  dateLabel: string;
}

const NEWS_SOURCES = [
  { name: 'The Race', rssUrl: 'https://www.the-race.com/feed/', baseUrl: 'https://www.the-race.com' },
  { name: 'Autosport', rssUrl: 'https://www.autosport.com/rss/f1/news/', baseUrl: 'https://www.autosport.com' },
  { name: 'Motorsport.com', rssUrl: 'https://www.motorsport.com/rss/f1/news/', baseUrl: 'https://www.motorsport.com' },
] as const;

const F1_KEYWORDS = [
  'f1', 'formula 1', 'formula one', 'formula1', 'formula-1',
  'grand prix', ' gp ', 'fia',
  'ferrari', 'mercedes', 'red bull', 'mclaren', 'alpine', 'aston martin',
  'williams', 'haas', 'alphatauri', 'sauber', 'kick sauber', 'racing bulls',
  'hamilton', 'verstappen', 'leclerc', 'sainz', 'norris', 'piastri',
  'russell', 'alonso', 'stroll', 'ocon', 'gasly', 'albon',
  'bottas', 'zhou', 'tsunoda', 'hulkenberg', 'magnussen',
  'bearman', 'lawson', 'doohan', 'antonelli', 'colapinto',
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
  'super gt', 'dtm', 'gt3 ', 'gt4 ',
  'superbike', 'worldsbk', 'wsbk',
  'motocross', 'mxgp', 'supercross',
  'dakar', 'rally raid',
  'v8 supercars', 'supercars championship',
  'btcc', 'british touring car', 'wtcr',
];

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
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
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
    return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function canonicalize(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    // Strip common tracking params
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    drop.forEach((p) => u.searchParams.delete(p));
    let path = u.pathname.replace(/\/+$/, '');
    if (!path) path = '/';
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`;
  } catch {
    return url;
  }
}

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
    const parser = new (globalThis as { DOMParser: { new (): { parseFromString(s: string, t: string): Document } } }).DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const candidates = Array.from(doc.querySelectorAll('img'));
    for (const img of candidates) {
      const raw = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
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

async function fetchRSSFeed(source: typeof NEWS_SOURCES[number], signal: AbortSignal): Promise<RawItem[]> {
  try {
    const response = await fetch(source.rssUrl, {
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProjectAnthology/1.0; +https://github.com/anthology)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    if (xml.trim().startsWith('<!DOCTYPE') || xml.trim().toLowerCase().startsWith('<html')) return [];

    const parser = new (globalThis as { DOMParser: { new (): { parseFromString(s: string, t: string): Document } } }).DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    const items = Array.from(doc.querySelectorAll('item'));
    const out: RawItem[] = [];

    for (const it of items) {
      const title = sanitizeText(it.querySelector('title')?.textContent || '', 300);
      let link = (it.querySelector('link')?.textContent || '').trim().replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const description = it.querySelector('description')?.textContent || '';
      const contentEncoded = it.getElementsByTagName('content:encoded')[0]?.textContent || '';
      const pubDate = it.querySelector('pubDate')?.textContent || it.querySelector('date')?.textContent || '';
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

/** Cheap, stable id from a string (djb2-xor). */
function stableId(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  // 32-bit unsigned hex
  return (h >>> 0).toString(36);
}

/** Normalise a title for dedupe / similarity (lowercased alphanumeric tokens). */
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

/**
 * Cluster items whose titles are near-duplicates, keep ONE primary per cluster,
 * collect attribution sources and best image. Never rewrites primary text.
 */
function clusterAndPickPrimary(items: RawItem[]): NewsItem[] {
  const SIM_THRESHOLD = 0.55;
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

    // Primary: most recent item that has both image AND non-empty title.
    // If no item has an image, fall back to the most recent.
    const inCluster = cluster.map((idx) => items[idx]);
    const withImage = inCluster.filter((x) => x.image);
    const primary = (withImage.length > 0 ? withImage : inCluster).reduce((best, cur) =>
      cur.publishedTs > best.publishedTs ? cur : best,
    );
    const image = primary.image || inCluster.find((x) => x.image)?.image || '';
    const sources = Array.from(new Set(inCluster.map((x) => x.sourceName)));

    // Cluster's representative timestamp = most recent, so newest cluster surfaces first.
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

export function processFeeds(rawItems: RawItem[]): NewsItem[] {
  // Filter F1 only, dedupe by canonical URL, then cluster by title similarity.
  const f1Only = rawItems.filter((it) => isF1Related(it));
  const seen = new Map<string, RawItem>();
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

function getAllowedOrigin(req: VercelRequest): string | null {
  const origin = (req.headers.origin || req.headers.referer || '') as string;
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return origin;
    // Production allowlist: only the canonical deployment host (and localhost for dev).
    // Keep this tight to prevent other *.vercel.app origins from calling the API.
    if (host === 'project-anthology.vercel.app') return origin;
    return null;
  } catch {
    return null;
  }
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function getClientIP(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor : forwardedFor.split(',');
    return ips[0]?.trim() || 'unknown';
  }
  const realIP = req.headers['x-real-ip'];
  if (realIP) return Array.isArray(realIP) ? realIP[0] : realIP;
  return 'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  if (clientIP === 'unknown') return true;
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  if (rateLimitStore.size > 1000) {
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) rateLimitStore.delete(ip);
    }
  }
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  record.count++;
  return true;
}

const PER_FEED_TIMEOUT_MS = 6000;
const TOTAL_TIMEOUT_MS = 8500;
const MAX_ITEMS = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const queryParams = req.query ?? {};
  if (Object.keys(queryParams).length > 0) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  if (!checkRateLimit(getClientIP(req))) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    await ensureDOMParser();

    const totalDeadline = Date.now() + TOTAL_TIMEOUT_MS;
    const perFeed = NEWS_SOURCES.map((source) => {
      const controller = new AbortController();
      const budget = Math.min(PER_FEED_TIMEOUT_MS, Math.max(1000, totalDeadline - Date.now()));
      const timer = setTimeout(() => controller.abort(), budget);
      return fetchRSSFeed(source, controller.signal).finally(() => clearTimeout(timer));
    });

    const settled = await Promise.allSettled(perFeed);
    const all: RawItem[] = [];
    settled.forEach((r) => {
      if (r.status === 'fulfilled') all.push(...r.value);
    });

    const items = processFeeds(all).slice(0, MAX_ITEMS);

    // CDN cache: 5 min fresh, 10 min stale-while-revalidate.
    // Aligned with the "fresh on every page load" intent; clients call
    // warmNewsOnLoad() on mount and News.tsx polls every 5 min.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('timeout')) return res.status(504).json({ error: 'Request timeout' });
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}
