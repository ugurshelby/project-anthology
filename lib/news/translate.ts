/**
 * English → Turkish news translation via MyMemory (free, no API key, no
 * account signup — chosen specifically because the project's Google Cloud
 * credit expires in December and can't be relied on for an ongoing feature).
 *
 * Called ONLY from the sync-news cron (app/api/cron/sync-news/route.ts),
 * and only for articles that don't already have a stored translation in
 * news_cache — never per page-view, per the project's DB-backed-read rule.
 * Quality is machine-translation-grade, not professional — acceptable for
 * news headlines/summaries; a paid engine (DeepL etc) can replace this later
 * without touching any caller, since the interface is just text-in/text-out.
 */

const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const TRANSLATE_CONCURRENCY = 3;
/** MyMemory's own per-request character ceiling. */
const MAX_CHARS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Translate one string EN→TR. Returns null on failure/empty input — callers keep the English original. */
export async function translateToTurkish(text: string): Promise<string | null> {
  const trimmed = text.trim().slice(0, MAX_CHARS);
  if (!trimmed) return null;

  const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(trimmed)}&langpair=en|tr`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProjectAnthology/1.0)' },
      });
      if (res.status === 429) {
        await sleep(800 * 2 ** attempt);
        continue;
      }
      if (!res.ok) return null;

      const json = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };
      const translated = json.responseData?.translatedText;
      if (!translated) return null;
      // MyMemory echoes the source text back (with a "MYMEMORY WARNING" prefix)
      // when its quota is exhausted or a segment has no match — treat as failure.
      if (translated.toUpperCase().includes('MYMEMORY WARNING')) return null;
      return translated;
    } catch {
      if (attempt === MAX_RETRIES) return null;
      await sleep(500 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** Bounded-concurrency map — never more than `limit` translate calls in flight. */
async function mapBounded<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export interface TranslatableItem {
  title: string;
  summary: string;
}

export interface TranslatedPair {
  titleTr: string | null;
  summaryTr: string | null;
}

/**
 * Translate title+summary for a batch of items. Bounded concurrency keeps
 * this well under MyMemory's rate limits regardless of batch size.
 */
export async function translateItems<T extends TranslatableItem>(
  items: T[],
): Promise<TranslatedPair[]> {
  return mapBounded(items, TRANSLATE_CONCURRENCY, async (item) => ({
    titleTr: await translateToTurkish(item.title),
    summaryTr: item.summary ? await translateToTurkish(item.summary) : null,
  }));
}
