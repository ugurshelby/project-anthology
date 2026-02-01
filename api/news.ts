import type { VercelRequest, VercelResponse } from '@vercel/node';

// DOMParser polyfill for Node (dev-api-server + Vercel serverless); browser/Vercel edge may have it
async function ensureDOMParser(): Promise<void> {
  if (typeof (globalThis as any).DOMParser !== 'undefined') return;
  const { JSDOM } = await import('jsdom');
  (globalThis as any).DOMParser = class NodeDOMParser {
    parseFromString(str: string, type: string): Document {
      const contentType = type === 'text/xml' ? 'text/xml' : 'text/html';
      const dom = new JSDOM(str, { contentType });
      return dom.window.document as unknown as Document;
    }
  };
}

// Types
interface RawNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  image: string;
  publishedAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  image: string;
  publishedAt: string;
  sourceUrl: string;
}

const NEWS_SOURCES = [
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
];

// F1-related keywords (positive matches)
const F1_KEYWORDS = [
  'f1', 'formula 1', 'formula one', 'formula1', 'formula-1',
  'grand prix', 'gp', 'fia',
  // F1 teams
  'ferrari', 'mercedes', 'red bull', 'mclaren', 'alpine', 'aston martin',
  'williams', 'haas', 'alphatauri', 'rb', 'sauber', 'kick sauber',
  'stake f1', 'racing bulls', 'visa cash app',
  // F1 drivers (current and recent)
  'hamilton', 'verstappen', 'leclerc', 'sainz', 'norris', 'piastri',
  'russell', 'alonso', 'stroll', 'ocon', 'gasly', 'albon',
  'bottas', 'zhou', 'tsunoda', 'ricciardo', 'hulkenberg', 'magnussen',
  'sargeant', 'bearman', 'lawson', 'doohan',
  // F1 circuits
  'monaco', 'monza', 'silverstone', 'spa', 'suzuka', 'interlagos',
  'bahrain', 'jeddah', 'melbourne', 'imola', 'barcelona', 'montreal',
  'red bull ring', 'hungaroring', 'zandvoort', 'marina bay', 'yas marina',
  // F1 terms
  'qualifying', 'pole position', 'podium', 'championship', 'constructors',
  'drivers championship', 'drs', 'safety car', 'virtual safety car',
  'race director', 'stewards', 'penalty', 'grid penalty',
];

// Non-F1 motorsports (negative matches - filter these out)
const NON_F1_KEYWORDS = [
  'motogp', 'moto gp', 'moto2', 'moto3', 'moto e',
  'wrc', 'world rally', 'rally championship',
  'wec', 'world endurance', 'le mans', '24 hours',
  'indycar', 'indy car', 'indianapolis', 'indy 500',
  'nascar', 'nascar cup', 'nascar xfinity',
  'formula e', 'formula-e', 'fe championship', 'formula electric',
  'super gt', 'dtm', 'gt3', 'gt4',
  'superbike', 'worldsbk', 'wsbk',
  'motocross', 'mxgp', 'supercross',
  'dakar', 'rally raid',
  'v8 supercars', 'supercars championship',
  'btcc', 'british touring car',
  'wtcr', 'world touring car',
];

// Enhanced HTML sanitization
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  let sanitized = String(text);
  
  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');
  
  // Remove script tags and event handlers (extra safety)
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script/gi, '')
    .replace(/<\/script>/gi, '');
  
  // Normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH) + '...';
  }
  
  return sanitized;
}

function safeDate(d: string | undefined): string {
  try {
    const dt = new Date(d || '');
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-GB');
  } catch {
    return '';
  }
}

function isF1Related(item: RawNewsItem): boolean {
  const title = (item.title || '').toLowerCase();
  const summary = (item.summary || '').toLowerCase();
  const combined = `${title} ${summary}`;
  
  // First check: if it contains non-F1 motorsport keywords, filter it out
  for (const keyword of NON_F1_KEYWORDS) {
    if (combined.includes(keyword)) {
      return false;
    }
  }
  
  // Second check: must contain F1-related keywords
  for (const keyword of F1_KEYWORDS) {
    if (combined.includes(keyword)) {
      return true;
    }
  }
  
  // If URL contains /f1/ or /formula-1/ or similar, it's likely F1-related
  const url = (item.url || '').toLowerCase();
  if (url.includes('/f1/') || url.includes('/formula-1/') || url.includes('/formula1/')) {
    return true;
  }
  
  // Default: if we can't determine, filter it out to be safe
  return false;
}

function extractImageFromDescription(description: string, baseUrl: string): string {
  if (!description) return '';
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, 'text/html');
    
    // Try multiple image sources
    const img = doc.querySelector('img');
    if (img) {
      let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src) {
        // Clean up src (remove query params that might cause issues)
        src = src.split('?')[0];
        
        if (src.startsWith('http://') || src.startsWith('https://')) {
          return src;
        } else if (src.startsWith('//')) {
          return `https:${src}`;
        } else if (src.startsWith('/')) {
          try {
            const url = new URL(baseUrl);
            return `${url.protocol}//${url.host}${src}`;
          } catch {
            return '';
          }
        } else {
          try {
            const url = new URL(baseUrl);
            return `${url.protocol}//${url.host}/${src}`;
          } catch {
            return '';
          }
        }
      }
    }
    
    // Try to find image in content:encoded or other tags
    const allImages = doc.querySelectorAll('img');
    for (const imgEl of Array.from(allImages)) {
      const src = imgEl.getAttribute('src') || imgEl.getAttribute('data-src');
      if (src && (src.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(src))) {
        if (src.startsWith('http')) return src;
        if (src.startsWith('/')) {
          try {
            const url = new URL(baseUrl);
            return `${url.protocol}//${url.host}${src}`;
          } catch {
            continue;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Image extraction error:', err);
  }
  
  return '';
}

// Calculate similarity between two texts (0-1)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity
  const jaccard = intersection.size / union.size;
  
  // Also check for common important words (F1 terms, driver names, etc.)
  const importantWords = ['f1', 'formula', 'grand', 'prix', 'verstappen', 'hamilton', 'ferrari', 'mercedes', 'red bull', 'mclaren'];
  const importantMatches = importantWords.filter(w => 
    text1.toLowerCase().includes(w) && text2.toLowerCase().includes(w)
  ).length;
  
  const importantBonus = importantMatches * 0.1;
  
  return Math.min(1, jaccard + importantBonus);
}

// Synthesize title from multiple sources
function synthesizeTitle(items: RawNewsItem[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0].title;
  
  // Find the most common words
  const allWords = items.map(item => 
    item.title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  );
  
  const wordCounts = new Map<string, number>();
  allWords.forEach(words => {
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  
  // Get words that appear in at least 2 sources
  const commonWords = Array.from(wordCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
  
  // Use the shortest, most informative title as base
  const baseTitle = items.reduce((shortest, current) => 
    current.title.length < shortest.title.length ? current : shortest
  ).title;
  
  // If we have enough common words, reconstruct
  if (commonWords.length >= 3) {
    // Try to create a natural sentence
    const words = baseTitle.split(/\s+/);
    const importantWords = words.filter(w => 
      commonWords.includes(w.toLowerCase()) || 
      w.length > 4
    );
    
    if (importantWords.length >= 3) {
      return importantWords.join(' ');
    }
  }
  
  // Fallback: use the most descriptive title
  return baseTitle;
}

// Synthesize summary from multiple sources
function synthesizeSummary(items: RawNewsItem[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0].summary;
  
  // Extract sentences from all summaries
  const allSentences: string[] = [];
  items.forEach(item => {
    const sentences = item.summary.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    allSentences.push(...sentences);
  });
  
  // Remove duplicates and very similar sentences
  const uniqueSentences: string[] = [];
  allSentences.forEach(sentence => {
    const isDuplicate = uniqueSentences.some(existing => 
      calculateSimilarity(sentence, existing) > 0.7
    );
    if (!isDuplicate) {
      uniqueSentences.push(sentence);
    }
  });
  
  // Take the first 2-3 most informative sentences
  const selected = uniqueSentences
    .filter(s => s.length > 30 && s.length < 200)
    .slice(0, 3);
  
  if (selected.length === 0) {
    // Fallback to longest summary
    return items.reduce((longest, current) => 
      current.summary.length > longest.summary.length ? current : longest
    ).summary;
  }
  
  return selected.join('. ') + '.';
}

// Find best image from sources
function selectBestImage(items: RawNewsItem[]): { image: string; sourceUrl: string; sourceName: string } {
  // Prefer images that are actual image URLs (not placeholders)
  const validImages = items.filter(item => 
    item.image && 
    item.image !== '/favicon.svg' &&
    item.image.trim() !== '' &&
    (item.image.startsWith('http') || item.image.startsWith('https'))
  );
  
  if (validImages.length === 0) {
    return { 
      image: '/favicon.svg', 
      sourceUrl: items[0]?.url || '',
      sourceName: items[0]?.sourceName || '',
    };
  }
  
  // Prefer images from CDNs or image domains
  const cdnImages = validImages.filter(item => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(item.image) ||
    /(cdn|img|image|photo|media|cloudinary|imgur)/i.test(item.image)
  );
  
  const selected = cdnImages.length > 0 ? cdnImages[0] : validImages[0];
  
  return {
    image: selected.image,
    sourceUrl: selected.url,
    sourceName: selected.sourceName,
  };
}

async function fetchRSSFeed(source: typeof NEWS_SOURCES[0]): Promise<RawNewsItem[]> {
  try {
    // Server-side: No CORS issues, direct fetch
    const response = await fetch(source.rssUrl, {
      headers: {
        'User-Agent': 'Project Anthology News Aggregator',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    
    if (!response.ok) {
      console.warn(`${source.name} RSS fetch failed: ${response.status}`);
      return [];
    }
    
    const xmlText = await response.text();
    
    if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
      console.warn(`${source.name} returned HTML instead of XML`);
      return [];
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn(`${source.name} RSS parsing error`);
      return [];
    }
    
    const items = Array.from(doc.querySelectorAll('item'));
    
    const newsItems: RawNewsItem[] = items.map((it, idx) => {
      const title = sanitizeText(it.querySelector('title')?.textContent || '');
      let link = it.querySelector('link')?.textContent || '';
      const description = it.querySelector('description')?.textContent || '';
      const pubDate = it.querySelector('pubDate')?.textContent || '';
      
      link = link.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      
      if (!link) {
        const guid = it.querySelector('guid')?.textContent || '';
        link = guid.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
      }
      
      // Extract image - try multiple methods
      let image = '';
      
      // First try: enclosure tag (most reliable)
      const enclosure = it.querySelector('enclosure');
      if (enclosure) {
        const enclosureUrl = enclosure.getAttribute('url');
        if (enclosureUrl) {
          if (enclosureUrl.startsWith('http://') || enclosureUrl.startsWith('https://')) {
            image = enclosureUrl;
          } else if (enclosureUrl.startsWith('/')) {
            image = `${source.baseUrl}${enclosureUrl}`;
          } else {
            image = `${source.baseUrl}/${enclosureUrl}`;
          }
        }
      }
      
      // Second try: media:content
      if (!image) {
        const mediaContent = it.querySelector('media\\:content, content');
        if (mediaContent) {
          const mediaUrl = mediaContent.getAttribute('url');
          if (mediaUrl) {
            if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
              image = mediaUrl;
            } else if (mediaUrl.startsWith('/')) {
              image = `${source.baseUrl}${mediaUrl}`;
            } else {
              image = `${source.baseUrl}/${mediaUrl}`;
            }
          }
        }
      }
      
      // Third try: extract from description HTML
      if (!image) {
        image = extractImageFromDescription(description, source.baseUrl);
      }
      
      if (!link || !link.startsWith('http')) {
        return null;
      }
      
      return {
        id: `${source.name}-${idx}-${Date.now()}`,
        title: title || 'Untitled',
        summary: sanitizeText(description),
        url: link,
        sourceName: source.name,
        image: image || '/favicon.svg',
        publishedAt: safeDate(pubDate),
      };
    }).filter((item): item is RawNewsItem => item !== null);
    
    return newsItems;
  } catch (err: any) {
    console.warn(`${source.name} fetch error:`, err?.message || err);
    return [];
  }
}

// Group similar news items together
function groupSimilarNews(allItems: RawNewsItem[]): RawNewsItem[][] {
  const groups: RawNewsItem[][] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < allItems.length; i++) {
    if (processed.has(allItems[i].id)) continue;
    
    const group = [allItems[i]];
    processed.add(allItems[i].id);
    
    for (let j = i + 1; j < allItems.length; j++) {
      if (processed.has(allItems[j].id)) continue;
      
      const similarity = calculateSimilarity(
        allItems[i].title + ' ' + allItems[i].summary,
        allItems[j].title + ' ' + allItems[j].summary
      );
      
      if (similarity > 0.3) { // Threshold for similarity
        group.push(allItems[j]);
        processed.add(allItems[j].id);
      }
    }
    
    groups.push(group);
  }
  
  return groups;
}

// Process groups into synthesized news items
function synthesizeNews(groups: RawNewsItem[][]): NewsItem[] {
  return groups.map((group, idx) => {
    const imageData = selectBestImage(group);
    const synthesized = {
      title: synthesizeTitle(group),
      summary: synthesizeSummary(group),
    };
    
    // Get all unique sources for attribution
    const uniqueSources = Array.from(new Set(group.map(item => item.sourceName)));
    const sources = uniqueSources.join(', ');
    
    // Primary source is the one with the image (or first one)
    const primarySource = imageData.sourceName || group[0]?.sourceName || '';
    
    return {
      id: `synthesized-${idx}-${Date.now()}`,
      title: synthesized.title,
      summary: synthesized.summary,
      url: imageData.sourceUrl, // Link to the source with the image
      sourceName: sources, // All sources
      image: imageData.image,
      publishedAt: group[0]?.publishedAt || '',
      sourceUrl: imageData.sourceUrl, // Keep track of which source URL was used
    };
  });
}

// Allowed origins (production domains)
const ALLOWED_ORIGINS = [
  'https://project-anthology.vercel.app',
  'https://anthology-f1.vercel.app',
  // Add your production domain here
];

// Get origin from request
function getAllowedOrigin(req: VercelRequest): string | null {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return null;
  
  // Allow same-origin requests
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin;
  }
  
  // Check against whitelist
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
  return isAllowed ? origin : null;
}

// Rate limiting storage (in-memory, resets on serverless function restart)
// In production, consider using Vercel Edge Config or Redis for persistent rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

/**
 * Get client IP address from request
 */
function getClientIP(req: VercelRequest): string {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor : forwardedFor.split(',');
    return ips[0]?.trim() || 'unknown';
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }
  
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
  }
  
  // Fallback to connection remote address (if available)
  const socket = (req as VercelRequest & { socket?: { remoteAddress?: string } }).socket;
  return socket?.remoteAddress || 'unknown';
}

/**
 * Check if request is within rate limit
 * Returns true if allowed, false if rate limited
 */
function checkRateLimit(clientIP: string): boolean {
  if (clientIP === 'unknown') {
    // Allow requests with unknown IP (development/local)
    return true;
  }
  
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    // New window or expired window - allow request
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }
  
  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment count
  record.count++;
  return true;
}

// Request timeout (10 seconds)
const REQUEST_TIMEOUT_MS = 10000;

// Create timeout promise
function createTimeoutPromise(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, REQUEST_TIMEOUT_MS);
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers with origin whitelist
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Request validation (req.query may be undefined in non-Vercel environments)
  const queryParams = req.query ?? {};
  if (Object.keys(queryParams).length > 0) {
    // Reject requests with unexpected query parameters
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    await ensureDOMParser();
    // Race between actual fetch and timeout
    const fetchPromise = (async (): Promise<NewsItem[]> => {
      // Fetch from all sources
      const results = await Promise.allSettled(
        NEWS_SOURCES.map(source => fetchRSSFeed(source))
      );
      
      const allItems: RawNewsItem[] = [];
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          allItems.push(...result.value);
        } else {
          console.warn(`❌ ${NEWS_SOURCES[idx].name} failed:`, result.reason);
        }
      });
      
      // Filter to only F1-related news
      const f1Items = allItems.filter(item => isF1Related(item));
      
      if (f1Items.length === 0) {
        return [];
      }
      
      // Group similar news
      const groups = groupSimilarNews(f1Items);
      
      // Synthesize
      const synthesized = synthesizeNews(groups);
      
      // Sort by date
      return synthesized.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return dateB - dateA;
      });
    })();

    // Race with timeout
    const sorted = await Promise.race([
      fetchPromise,
      createTimeoutPromise(),
    ]);
    
    // Cache headers (1 hour server-side cache, allow stale-while-revalidate)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).json(sorted);
  } catch (error) {
    // Sanitize error messages - don't leak sensitive information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log full error for debugging (server-side only)
    console.error('News API error:', error);
    
    // Return generic error message to client
    if (errorMessage.includes('timeout')) {
      return res.status(504).json({ error: 'Request timeout' });
    }
    
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}
