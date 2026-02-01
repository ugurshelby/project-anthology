/// <reference types="vite/client" />

// Multiple news providers: NewsAPI, GNews, Mediastack, RapidAPI, RSS
// Each provider returns normalized { id, title, summary, url, sourceName, image, publishedAt }

import { logger } from './logger';

const PROXY_BASE = import.meta.env?.VITE_NEWS_PROXY_URL || "";

function safeDate(d: string | Date | undefined): string {
  try {
    const dt = new Date(d || "");
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-GB");
  } catch {
    return "";
  }
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  image: string;
  publishedAt: string;
}

// NewsAPI.org
export async function fromNewsAPI(query: string = "formula 1"): Promise<NewsItem[]> {
  const key = import.meta.env?.VITE_NEWSAPI_KEY;
  if (!key) return [];
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=en&pageSize=20&sortBy=publishedAt&apiKey=${key}`;
    const target = PROXY_BASE
      ? `${PROXY_BASE}?url=${encodeURIComponent(url)}`
      : url;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 429) return [];
      throw new Error(`newsapi_error_${res.status}`);
    }
    const json = await res.json();
    const articles = json?.articles || [];
    return articles.map((a: any, idx: number) => ({
      id: a.url || `newsapi-${idx}`,
      title: a.title || "",
      summary: a.description || a.content || "",
      url: a.url || "#",
      sourceName: a.source?.name || "NewsAPI",
      image: a.urlToImage || "",
      publishedAt: safeDate(a.publishedAt),
    }));
  } catch {
    return [];
  }
}

// GNews.io
export async function fromGNews(query: string = "formula 1"): Promise<NewsItem[]> {
  const key = import.meta.env?.VITE_GNEWS_KEY;
  if (!key) return [];
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&max=20&sortby=publishedAt&token=${key}`;
    const target = PROXY_BASE
      ? `${PROXY_BASE}?url=${encodeURIComponent(url)}`
      : url;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 429) return [];
      throw new Error(`gnews_error_${res.status}`);
    }
    const json = await res.json();
    const articles = json?.articles || [];
    return articles.map((a: any, idx: number) => ({
      id: a.url || `gnews-${idx}`,
      title: a.title || "",
      summary: a.description || "",
      url: a.url || "#",
      sourceName: a.source?.name || "GNews",
      image: a.image || "",
      publishedAt: safeDate(a.publishedAt),
    }));
  } catch {
    return [];
  }
}

// Mediastack.com
export async function fromMediastack(query: string = "formula 1"): Promise<NewsItem[]> {
  const key = import.meta.env?.VITE_MEDIASTACK_KEY;
  if (!key) return [];
  try {
    const url = `http://api.mediastack.com/v1/news?access_key=${key}&languages=en&keywords=${encodeURIComponent(
      query
    )}&limit=20&sort=published_desc`;
    const target = PROXY_BASE
      ? `${PROXY_BASE}?url=${encodeURIComponent(url)}`
      : url;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 429) return [];
      throw new Error(`mediastack_error_${res.status}`);
    }
    const json = await res.json();
    const articles = json?.data || [];
    return articles.map((a: any, idx: number) => ({
      id: a.url || `mediastack-${idx}`,
      title: a.title || "",
      summary: a.description || "",
      url: a.url || "#",
      sourceName: a.source || "Mediastack",
      image: a.image || "",
      publishedAt: safeDate(a.published_at),
    }));
  } catch {
    return [];
  }
}

// RapidAPI F1 Latest News
export async function fromRapidAPI(series: string = "f1"): Promise<NewsItem[]> {
  const key = import.meta.env?.VITE_RAPIDAPI_KEY;
  const host = import.meta.env?.VITE_RAPIDAPI_HOST || "";
  const baseUrl = import.meta.env?.VITE_RAPIDAPI_NEWS_URL || "";
  if (!key || !baseUrl) return [];
  try {
    const url = `${baseUrl}?series=${encodeURIComponent(series)}`;
    const target = PROXY_BASE
      ? `${PROXY_BASE}?url=${encodeURIComponent(url)}`
      : url;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target, {
      headers: {
        "X-RapidAPI-Key": key,
        ...(host ? { "X-RapidAPI-Host": host } : {}),
        accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (res.status === 429) return [];
      throw new Error(`rapidapi_error_${res.status}`);
    }
    const json = await res.json();
    const items = json?.items || json?.news || json || [];
    return items.map((a: any, idx: number) => ({
      id: a.id || a.url || `rapidapi-${idx}`,
      title: a.title || a.headline || "",
      summary: a.summary || a.description || "",
      url: a.url || "#",
      sourceName: a.sourceName || a.source || "RapidAPI",
      image: a.image || a.thumbnail || "",
      publishedAt: safeDate(a.publishedAt || a.date),
    }));
  } catch {
    return [];
  }
}

// Extract image from RSS description or content
function extractImageFromRSS(item: Element, link: string): string {
  // Try enclosure first
  const enclosure = item.querySelector("enclosure");
  if (enclosure) {
    const url = enclosure.getAttribute("url");
    if (url && (url.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url))) {
      return url;
    }
  }
  
  // Try media:content
  const mediaContent = item.querySelector("media\\:content, content");
  if (mediaContent) {
    const url = mediaContent.getAttribute("url");
    if (url) return url;
  }
  
  // Try description for img tags
  const desc = item.querySelector("description")?.textContent || "";
  if (desc) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(desc, "text/html");
    const img = doc.querySelector("img");
    if (img) {
      const src = img.getAttribute("src");
      if (src) {
        // Make absolute URL if relative
        if (src.startsWith("http://") || src.startsWith("https://")) {
          return src;
        } else if (src.startsWith("/")) {
          try {
            const baseUrl = new URL(link);
            return `${baseUrl.protocol}//${baseUrl.host}${src}`;
          } catch {
            return src;
          }
        } else {
          try {
            const baseUrl = new URL(link);
            return `${baseUrl.protocol}//${baseUrl.host}/${src}`;
          } catch {
            return src;
          }
        }
      }
    }
  }
  
  // Try content:encoded
  const contentEncoded = item.querySelector("content\\:encoded, encoded")?.textContent || "";
  if (contentEncoded) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentEncoded, "text/html");
    const img = doc.querySelector("img");
    if (img) {
      const src = img.getAttribute("src");
      if (src) {
        if (src.startsWith("http://") || src.startsWith("https://")) {
          return src;
        } else if (src.startsWith("/")) {
          try {
            const baseUrl = new URL(link);
            return `${baseUrl.protocol}//${baseUrl.host}${src}`;
          } catch {
            return src;
          }
        }
      }
    }
  }
  
  return "";
}

// CORS proxy helper - use public CORS proxy if no custom proxy
function getRSSUrl(originalUrl: string): string {
  if (PROXY_BASE) {
    return `${PROXY_BASE}?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // Use public CORS proxy for RSS feeds
  // Try multiple proxies for reliability
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
  ];
  
  // Return first proxy (we'll try others if this fails)
  return proxies[0];
}

// Simple RSS parser with CORS proxy support
async function fetchRSS(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const target = getRSSUrl(url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(target, {
      headers: { 
        accept: "application/rss+xml,application/xml,text/xml,text/html,*/*" 
      },
      signal: controller.signal,
      mode: 'cors',
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.warn(`RSS ${sourceName} HTTP error:`, res.status, res.statusText);
      return [];
    }
    
    const xmlText = await res.text();
    
    // Check if we got HTML instead of XML (proxy error page)
    if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
      console.warn(`RSS ${sourceName} returned HTML instead of XML`);
      return [];
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      console.warn(`RSS ${sourceName} parsing error:`, parserError.textContent?.substring(0, 100));
      return [];
    }
    
    const items = Array.from(doc.querySelectorAll("item"));
    
    if (items.length === 0) {
      console.warn(`RSS ${sourceName} has no items`);
      return [];
    }
    
    const parsedItems = items.map((it, idx) => {
      const title = it.querySelector("title")?.textContent || "";
      let link = it.querySelector("link")?.textContent || "";
      const desc = it.querySelector("description")?.textContent || "";
      const pubDate = it.querySelector("pubDate")?.textContent || "";
      const image = extractImageFromRSS(it, link);
      
      // Clean up link - sometimes RSS feeds have whitespace or CDATA
      link = link.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      
      // If link is empty, try guid
      if (!link) {
        const guid = it.querySelector("guid")?.textContent || "";
        link = guid.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      }
      
      // Ensure we have a valid URL
      if (!link || link === '#') {
        return null; // Will be filtered out
      }
      
      return {
        id: link || `${sourceName}-${idx}`,
        title,
        summary: desc,
        url: link,
        sourceName,
        image,
        publishedAt: safeDate(pubDate),
      };
    }).filter((item): item is NewsItem => item !== null);
    
    logger.log(`RSS ${sourceName} parsed ${parsedItems.length} valid items`);
    return parsedItems;
  } catch (err) {
    logger.warn(`RSS ${sourceName} fetch error:`, err);
    return [];
  }
}

export async function fromRSSSources(): Promise<NewsItem[]> {
  console.log('📡 Fetching RSS feeds...');
  
  const sources = [
    {
      url: "https://www.motorsport.com/rss/f1/news/",
      name: "Motorsport.com",
    },
    {
      url: "https://www.autosport.com/rss/f1/news/",
      name: "Autosport",
    },
    {
      url: "https://www.formula1.com/rss/latest",
      name: "Formula1.com",
    },
    {
      url: "https://www.skysports.com/rss/12040",
      name: "Sky Sports F1",
    },
    {
      url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
      name: "BBC F1",
    },
  ];
  
  // Try each source with timeout
  const results = await Promise.allSettled(
    sources.map(async (s) => {
      try {
        const result = await Promise.race([
          fetchRSS(s.url, s.name),
          new Promise<NewsItem[]>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          ),
        ]);
        if (result.length > 0) {
          logger.log(`✅ RSS ${s.name}: ${result.length} items`);
        }
        return result;
      } catch (err) {
        logger.warn(`❌ RSS ${s.name} failed:`, err instanceof Error ? err.message : err);
        return [];
      }
    })
  );
  
  const merged: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      merged.push(...r.value);
    } else if (r.status === "rejected") {
      logger.warn('RSS provider rejected:', r.reason);
    }
  }
  
  logger.log(`📰 Total RSS items: ${merged.length}`);
  return merged;
}

export function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const it of items) {
    const key = (it.url || it.title || it.id || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}
