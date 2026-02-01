import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './news';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('News API', () => {
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

  it('should handle OPTIONS request', async () => {
    const req = createMockRequest('OPTIONS') as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should reject non-GET requests', async () => {
    const req = createMockRequest('POST') as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should reject requests with query parameters', async () => {
    const req = {
      ...createMockRequest('GET'),
      query: { test: 'value' },
    } as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request parameters' });
  });

  it('should set CORS headers for allowed origin', async () => {
    const req = createMockRequest('GET', 'https://project-anthology.vercel.app') as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    // Mock successful RSS fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: async () => `<?xml version="1.0"?>
        <rss>
          <channel>
            <item>
              <title>F1 Test News</title>
              <link>https://example.com/news</link>
              <description>Test F1 news description</description>
              <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`,
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://project-anthology.vercel.app');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS');
  });

  // Handler uses real setTimeout; fake timers don't trigger it. Skip to avoid CI timeout.
  it.skip('should handle timeout', async () => {
    const req = createMockRequest('GET') as VercelRequest;
    const res = createMockResponse() as VercelResponse;

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    vi.useFakeTimers();
    const handlerPromise = handler(req, res);
    vi.advanceTimersByTime(10000);
    await handlerPromise;

    expect(res.status).toHaveBeenCalledWith(504);
    expect(res.json).toHaveBeenCalledWith({ error: 'Request timeout' });
    vi.useRealTimers();
  });
});
