import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchNews, readNewsCache, NewsItem } from './newsService';

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
          sourceUrl: 'https://example.com/news',
        },
      ];

      localStorage.setItem(
        'news_cache_api_v1',
        JSON.stringify({
          ts: Date.now(),
          items: mockItems,
        })
      );

      const result = readNewsCache();
      expect(result).toEqual(mockItems);
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
          sourceUrl: 'https://example.com/news',
        },
      ];

      // Set cache with old timestamp (7 hours ago)
      const oldTimestamp = Date.now() - 7 * 60 * 60 * 1000;
      localStorage.setItem(
        'news_cache_api_v1',
        JSON.stringify({
          ts: oldTimestamp,
          items: mockItems,
        })
      );

      const result = readNewsCache();
      expect(result).toEqual(mockItems);
    });

    it('should return null when cache is invalid JSON', () => {
      localStorage.setItem('news_cache_api_v1', 'invalid json');
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
          sourceUrl: 'https://example.com/news',
        },
      ];

      localStorage.setItem(
        'news_cache_api_v1',
        JSON.stringify({
          ts: Date.now(),
          items: mockItems,
        })
      );

      // Mock fetch for background fetch (even though it will fail, it shouldn't affect the test)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      } as Response);

      const result = await fetchNews();
      expect(result).toEqual(mockItems);
      
      // Wait a bit for background fetch to complete
      await new Promise(resolve => setTimeout(resolve, 50));
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
          sourceUrl: 'https://example.com/api-news',
        },
      ];

      // Mock fetch to return API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await fetchNews();

      expect(global.fetch).toHaveBeenCalledWith('/api/news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockApiResponse);

      // Verify cache was written
      const cached = readNewsCache();
      expect(cached).toEqual(mockApiResponse);
    });

    it('should return empty array when API fails and no cache exists', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await fetchNews();
      expect(result).toEqual([]);
    });

    it('should return cached data when API fails but cache exists', async () => {
      const mockCachedItems: NewsItem[] = [
        {
          id: 'cached-1',
          title: 'Cached News',
          summary: 'Cached summary',
          url: 'https://example.com/cached',
          sourceName: 'Cached Source',
          image: 'https://example.com/cached-image.jpg',
          publishedAt: '2024-01-01',
          sourceUrl: 'https://example.com/cached',
        },
      ];

      localStorage.setItem(
        'news_cache_api_v1',
        JSON.stringify({
          ts: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          items: mockCachedItems,
        })
      );

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await fetchNews();
      expect(result).toEqual(mockCachedItems);
    });

    it('should handle API response with invalid format', async () => {
      // Mock fetch to return invalid response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'data' }), // Not an array
      } as Response);

      const result = await fetchNews();
      expect(result).toEqual([]);
    });

    it('should respect rate limiting', async () => {
      // Set rate limit timestamp to recent time
      localStorage.setItem('news_rate_limit_ts', String(Date.now() - 10000)); // 10 seconds ago

      const mockCachedItems: NewsItem[] = [
        {
          id: 'cached-1',
          title: 'Cached News',
          summary: 'Cached summary',
          url: 'https://example.com/cached',
          sourceName: 'Cached Source',
          image: 'https://example.com/cached-image.jpg',
          publishedAt: '2024-01-01',
          sourceUrl: 'https://example.com/cached',
        },
      ];

      localStorage.setItem(
        'news_cache_api_v1',
        JSON.stringify({
          ts: Date.now() - 7 * 60 * 60 * 1000, // Stale cache
          items: mockCachedItems,
        })
      );

      const result = await fetchNews();
      // Should return cached data instead of fetching (rate limited)
      expect(result).toEqual(mockCachedItems);
      expect(global.fetch).not.toHaveBeenCalled();
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
          sourceUrl: 'https://example.com/api-news',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await fetchNews();

      const cached = readNewsCache();
      expect(cached).toEqual(mockApiResponse);
    });

    it('should not cache empty arrays', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await fetchNews();

      const cached = readNewsCache();
      expect(cached).toBeNull();
    });
  });
});
