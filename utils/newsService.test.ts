import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchNews, readNewsCache, sortByDate, NewsItem } from './newsService';

const CACHE_KEY = 'news_cache_v2';

function mockJsonResponse(body: unknown, contentType = 'application/json; charset=utf-8') {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (k: string) => (k.toLowerCase() === 'content-type' ? contentType : null),
    },
    json: async () => body,
  } as unknown as Response;
}

describe('newsService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    vi.clearAllMocks();
  });

  describe('readNewsCache', () => {
    it('should return null when cache is empty', () => {
      const result = readNewsCache();
      expect(result).toBeNull();
    });

    it('should return cached items when cache exists', () => {
      const mockItems: NewsItem[] = [
        {
          id: 'test-1',
          title: 'Test News',
          summary: 'Test summary',
          url: 'https://example.com/news',
          sourceName: 'Test Source',
          image: 'https://example.com/image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          ts: Date.now(),
          items: mockItems,
        })
      );

      const result = readNewsCache();
      expect(result).toEqual(sortByDate(mockItems));
    });

    it('should return cached items even when cache is stale', () => {
      const mockItems: NewsItem[] = [
        {
          id: 'test-1',
          title: 'Test News',
          summary: 'Test summary',
          url: 'https://example.com/news',
          sourceName: 'Test Source',
          image: 'https://example.com/image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      // Set cache with old timestamp (7 hours ago)
      const oldTimestamp = Date.now() - 7 * 60 * 60 * 1000;
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          ts: oldTimestamp,
          items: mockItems,
        })
      );

      const result = readNewsCache();
      expect(result).toEqual(sortByDate(mockItems));
    });

    it('should return null when cache is invalid JSON', () => {
      localStorage.setItem(CACHE_KEY, 'invalid json');
      const result = readNewsCache();
      expect(result).toBeNull();
    });
  });

  describe('fetchNews', () => {
    it('should return cached items immediately when cache exists', async () => {
      const mockItems: NewsItem[] = [
        {
          id: 'test-1',
          title: 'Cached News',
          summary: 'Cached summary',
          url: 'https://example.com/news',
          sourceName: 'Test Source',
          image: 'https://example.com/image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          ts: Date.now(),
          items: mockItems,
        })
      );

      const result = await fetchNews();
      expect(result).toEqual(sortByDate(mockItems));
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      const mockApiResponse: NewsItem[] = [
        {
          id: 'api-1',
          title: 'API News',
          summary: 'API summary',
          url: 'https://example.com/api-news',
          sourceName: 'API Source',
          image: 'https://example.com/api-image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      // Mock fetch to return API response
      global.fetch = vi.fn().mockResolvedValue(mockJsonResponse(mockApiResponse));

      const result = await fetchNews();

      expect(global.fetch).toHaveBeenCalled();
      expect((global.fetch as any).mock.calls[0][0]).toBe('/api/news');
      expect((global.fetch as any).mock.calls[0][1]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: 'application/json' }),
          signal: expect.any(Object),
        })
      );

      expect(result).toEqual(sortByDate(mockApiResponse));

      // Verify cache was written
      const cached = readNewsCache();
      expect(cached).toEqual(sortByDate(mockApiResponse));
    });

    it('should throw when API and fallback both fail and no cache exists', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
      await expect(fetchNews()).rejects.toBeTruthy();
    });

    it('should return cached data even if refresh fails (stale cache)', async () => {
      const mockCachedItems: NewsItem[] = [
        {
          id: 'cached-1',
          title: 'Cached News',
          summary: 'Cached summary',
          url: 'https://example.com/cached',
          sourceName: 'Cached Source',
          image: 'https://example.com/cached-image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          ts: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          items: mockCachedItems,
        })
      );

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await fetchNews();
      expect(result).toEqual(sortByDate(mockCachedItems));
    });

    it('should fall back to static JSON when API payload is invalid', async () => {
      const fallbackItems: NewsItem[] = [
        {
          id: 'fallback-1',
          title: 'Fallback News',
          summary: 'Fallback summary',
          url: 'https://example.com/fallback',
          sourceName: 'Fallback Source',
          image: '',
          publishedAt: '2024-01-01',
        },
      ];

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(mockJsonResponse({ invalid: 'data' }))
        .mockResolvedValueOnce(mockJsonResponse(fallbackItems));

      const result = await fetchNews();
      expect(result).toEqual(sortByDate(fallbackItems));
    });
  });

  describe('cache behavior', () => {
    it('should write cache after successful API fetch', async () => {
      const mockApiResponse: NewsItem[] = [
        {
          id: 'api-1',
          title: 'API News',
          summary: 'API summary',
          url: 'https://example.com/api-news',
          sourceName: 'API Source',
          image: 'https://example.com/api-image.jpg',
          publishedAt: '2024-01-01',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue(mockJsonResponse(mockApiResponse));

      await fetchNews();

      const cached = readNewsCache();
      expect(cached).toEqual(sortByDate(mockApiResponse));
    });

    it('should not cache empty arrays', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockJsonResponse([]));
      const result = await fetchNews();
      expect(result).toEqual([]);
      expect(readNewsCache()).toBeNull();
    });
  });
});
