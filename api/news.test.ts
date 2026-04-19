import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler, { processFeeds } from './news';

global.fetch = vi.fn();

vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('News API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (method: string = 'GET', origin?: string): Partial<VercelRequest> => ({
    method,
    headers: {
      origin: origin || 'https://project-anthology.vercel.app',
    },
    query: {},
  });

  const createMockResponse = (): Partial<VercelResponse> => {
    const res: Partial<VercelResponse> = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
    };
    return res;
  };

  it('handles OPTIONS request', async () => {
    const req = createMockRequest('OPTIONS') as VercelRequest;
    const res = createMockResponse() as VercelResponse;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('rejects non-GET requests', async () => {
    const req = createMockRequest('POST') as VercelRequest;
    const res = createMockResponse() as VercelResponse;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('rejects requests with query parameters', async () => {
    const req = {
      ...createMockRequest('GET'),
      query: { test: 'value' },
    } as VercelRequest;
    const res = createMockResponse() as VercelResponse;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request parameters' });
  });

  it('sets CORS headers for an allowed origin', async () => {
    const req = createMockRequest('GET', 'https://project-anthology.vercel.app') as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: new Map([['Content-Type', 'application/rss+xml']]),
      text: async () => `<?xml version="1.0"?>
        <rss>
          <channel>
            <item>
              <title>F1 Test News</title>
              <link>https://example.com/news</link>
              <description>Test F1 Verstappen news description</description>
              <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`,
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://project-anthology.vercel.app');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS');
  });
});

describe('processFeeds', () => {
  const mkItem = (overrides: Partial<Parameters<typeof processFeeds>[0][number]> = {}) => ({
    title: 'Verstappen wins F1 race',
    summary: 'Max Verstappen wins the Formula 1 grand prix.',
    url: 'https://a.example.com/news/1',
    canonicalUrl: 'https://a.example.com/news/1',
    sourceName: 'A',
    image: 'https://a.example.com/img.jpg',
    publishedTs: Date.parse('2026-04-10T10:00:00Z'),
    publishedISO: '2026-04-10T10:00:00.000Z',
    ...overrides,
  });

  it('sorts items by publishedTs descending (newest first)', () => {
    const items = [
      mkItem({ url: 'https://a.example.com/older', canonicalUrl: 'https://a.example.com/older', publishedTs: Date.parse('2026-04-09T10:00:00Z'), title: 'Hamilton podium F1' }),
      mkItem({ url: 'https://a.example.com/newest', canonicalUrl: 'https://a.example.com/newest', publishedTs: Date.parse('2026-04-12T10:00:00Z'), title: 'Norris pole position F1' }),
      mkItem({ url: 'https://a.example.com/middle', canonicalUrl: 'https://a.example.com/middle', publishedTs: Date.parse('2026-04-11T10:00:00Z'), title: 'Leclerc Ferrari F1 update' }),
    ];
    const out = processFeeds(items);
    expect(out.map((x) => x.url)).toEqual([
      'https://a.example.com/newest',
      'https://a.example.com/middle',
      'https://a.example.com/older',
    ]);
  });

  it('deduplicates items by canonical URL, keeping the newest', () => {
    const items = [
      mkItem({ url: 'https://a.example.com/x', canonicalUrl: 'https://a.example.com/x', sourceName: 'A', publishedTs: Date.parse('2026-04-10T10:00:00Z') }),
      mkItem({ url: 'https://a.example.com/x?utm_source=foo', canonicalUrl: 'https://a.example.com/x', sourceName: 'A', publishedTs: Date.parse('2026-04-10T11:00:00Z'), title: 'Verstappen wins F1 race (updated)' }),
    ];
    const out = processFeeds(items);
    expect(out).toHaveLength(1);
    expect(out[0].title).toContain('updated');
  });

  it('clusters cross-source duplicates and lists every source', () => {
    const items = [
      mkItem({
        url: 'https://a.example.com/race-result',
        canonicalUrl: 'https://a.example.com/race-result',
        sourceName: 'The Race',
        title: 'Verstappen takes Bahrain Grand Prix victory',
        publishedTs: Date.parse('2026-04-12T10:00:00Z'),
      }),
      mkItem({
        url: 'https://b.example.com/bahrain',
        canonicalUrl: 'https://b.example.com/bahrain',
        sourceName: 'Autosport',
        title: 'Verstappen wins Bahrain Grand Prix victory race',
        image: '',
        publishedTs: Date.parse('2026-04-12T11:00:00Z'),
      }),
    ];
    const out = processFeeds(items);
    expect(out).toHaveLength(1);
    expect(out[0].sources.sort()).toEqual(['Autosport', 'The Race']);
    // Image-bearing item is preferred as primary even if slightly older
    expect(out[0].image).toBe('https://a.example.com/img.jpg');
    expect(out[0].url).toBe('https://a.example.com/race-result');
  });

  it('filters out non-F1 items', () => {
    const items = [
      mkItem({ url: 'https://x.example.com/motogp', canonicalUrl: 'https://x.example.com/motogp', title: 'MotoGP race result', summary: 'MotoGP weekend' }),
      mkItem({ url: 'https://x.example.com/wec', canonicalUrl: 'https://x.example.com/wec', title: 'World Endurance Championship update', summary: 'WEC news' }),
    ];
    const out = processFeeds(items);
    expect(out).toHaveLength(0);
  });
});
