// Multi-source news aggregator - Frontend client
// Backend logic moved to /api/news.ts (Vercel Serverless Function)

import { logger } from './logger';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  image: string;
  publishedAt: string;
  sourceUrl: string; // Original URL from the source
}

const CACHE_KEY = 'news_cache_api_v1'; // Updated cache key for API version
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours - refresh 4 times per day
const BACKGROUND_FETCH_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours - background fetch interval
const LAST_FETCH_KEY = 'news_last_fetch_ts';
const RATE_LIMIT_KEY = 'news_rate_limit_ts';
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds - minimum time between fetches
const MAX_CONCURRENT_FETCHES = 1; // Only one fetch at a time globally
let isFetching = false; // Global flag to prevent concurrent fetches

function now(): number {
  return Date.now();
}

function readCache(): NewsItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const cacheAge = now() - (obj.ts || 0);
    
    const items = obj.items || [];
    if (items.length === 0) return null;
    
    // If cache is too old, log but still return it (will be refreshed in background)
    if (cacheAge > CACHE_TTL_MS) {
      logger.log('Cache expired but returning stale data, age:', Math.round(cacheAge / 1000 / 60), 'minutes');
      return items; // Return stale cache instead of null
    }
    
    logger.log('Using cached news, age:', Math.round(cacheAge / 1000 / 60), 'minutes');
    return items;
  } catch (err) {
    logger.warn('Cache read error:', err);
    return null;
  }
}

// Export synchronous cache reader for immediate UI updates
export function readNewsCache(): NewsItem[] | null {
  return readCache();
}

function isCacheStale(): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return true;
    const obj = JSON.parse(raw);
    const cacheAge = now() - (obj.ts || 0);
    return cacheAge > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

function writeCache(items: NewsItem[]): void {
  try {
    if (items.length === 0) {
      console.warn('Not caching empty items array');
      return;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now(), items }));
    localStorage.setItem(LAST_FETCH_KEY, String(now()));
    console.log('Cache written:', items.length, 'items');
  } catch (err) {
    console.warn('Cache write error:', err);
  }
}

function shouldFetchInBackground(): boolean {
  try {
    const lastFetch = parseInt(localStorage.getItem(LAST_FETCH_KEY) || '0', 10);
    const timeSinceLastFetch = now() - lastFetch;
    
    // Fetch in background if it's been more than BACKGROUND_FETCH_INTERVAL_MS since last fetch
    return timeSinceLastFetch > BACKGROUND_FETCH_INTERVAL_MS;
  } catch {
    return true;
  }
}

// Rate limiting: prevent too many requests in short time
function checkRateLimit(): boolean {
  try {
    const lastFetch = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
    const timeSinceLastFetch = now() - lastFetch;
    
    // If we fetched recently, don't fetch again
    if (timeSinceLastFetch < RATE_LIMIT_WINDOW_MS) {
      logger.log('Rate limit: Too soon to fetch again, wait', Math.round((RATE_LIMIT_WINDOW_MS - timeSinceLastFetch) / 1000), 'seconds');
      return false;
    }
    
    // Update rate limit timestamp
    localStorage.setItem(RATE_LIMIT_KEY, String(now()));
    return true;
  } catch {
    return true; // If we can't check, allow fetch (fail open)
  }
}

const FALLBACK_NEWS_URL = '/news-fallback.json';

// Fetch news from serverless API; on failure (e.g. dev without API server) try static fallback
async function fetchNewsFromAPI(): Promise<NewsItem[]> {
  try {
    const apiUrl = '/api/news';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }

    const items: NewsItem[] = await response.json();
    if (!Array.isArray(items)) {
      throw new Error('Invalid response format from API');
    }
    return items;
  } catch (err) {
    logger.warn('News API fetch error, trying fallback:', err);
    try {
      const fallback = await fetch(FALLBACK_NEWS_URL);
      if (!fallback.ok) throw new Error('Fallback not found');
      const items: NewsItem[] = await fallback.json();
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (fallbackErr) {
      logger.warn('Fallback news load failed:', fallbackErr);
    }
    throw err;
  }
}

// Background fetch function - doesn't block UI
async function fetchNewsInBackground(): Promise<void> {
  try {
    logger.log('Background fetch started...');
    const items = await fetchNewsFromAPI();
    
    if (items.length > 0) {
      writeCache(items);
      logger.log('Background fetch completed:', items.length, 'items');
    }
  } catch (err) {
    logger.warn('Background fetch error:', err);
  } finally {
    isFetching = false;
  }
}

export async function fetchNews(): Promise<NewsItem[]> {
  // Check cache first - return immediately if cache exists (even if stale)
  const cached = readCache();
  const stale = isCacheStale();
  
  // If we have cache (even if stale), return it immediately and refresh in background
  if (cached && cached.length > 0) {
    // Trigger background fetch if cache is stale or it's time to refresh
    // But respect rate limiting to avoid overwhelming the system
    if ((stale || shouldFetchInBackground()) && checkRateLimit() && !isFetching) {
      // Don't await - let it run in background, user sees cached data immediately
      isFetching = true;
      fetchNewsInBackground().catch(() => {
        isFetching = false;
      });
    }
    return cached;
  }
  
  // No cache at all - check rate limit before fetching
  if (!checkRateLimit() || isFetching) {
    // Rate limited or already fetching - return empty array, cache will be used
    logger.log('Rate limited or fetch in progress, returning empty array');
    return cached || [];
  }
  
  // Fetch synchronously (first load or after rate limit window)
  try {
    isFetching = true;
    const items = await fetchNewsFromAPI();
    
    if (items.length > 0) {
      writeCache(items);
    }
    
    return items;
  } catch (err) {
    logger.error('Fetch error:', err);
    // Return cached data if available, even if stale
    return cached || [];
  } finally {
    isFetching = false;
  }
}
