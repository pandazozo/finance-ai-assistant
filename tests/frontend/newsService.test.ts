import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { newsService, NewsItem } from '../../src/services/newsService';

describe('News Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNews', () => {
    it('should fetch news with correct parameters', async () => {
      const mockResponse = {
        code: 0,
        data: {
          news: [
            {
              id: 'n1',
              title: '贵州茅台发布年报',
              source: '上证报',
              time: '刚刚',
              summary: '业绩增长',
              impactScore: 85,
              isImportant: true
            }
          ],
          count: 1
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await newsService.getNews('600519', 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/stocks/news?code=600519&limit=10')
      );
      expect(result.code).toBe(0);
      expect(result.data.news).toHaveLength(1);
      expect(result.data.news[0].impactScore).toBe(85);
    });

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(newsService.getNews('600519')).rejects.toThrow('API error: 500');
    });
  });

  describe('getImpactColor', () => {
    it('should return red for high impact', () => {
      expect(newsService.getImpactColor(85)).toBe('text-red-500');
    });

    it('should return orange for medium-high impact', () => {
      expect(newsService.getImpactColor(65)).toBe('text-orange-500');
    });

    it('should return yellow for medium impact', () => {
      expect(newsService.getImpactColor(45)).toBe('text-yellow-500');
    });

    it('should return gray for low impact', () => {
      expect(newsService.getImpactColor(30)).toBe('text-text-secondary');
    });
  });

  describe('getImpactBgColor', () => {
    it('should return red bg for high impact', () => {
      expect(newsService.getImpactBgColor(85)).toBe('bg-red-500/10');
    });

    it('should return orange bg for medium-high impact', () => {
      expect(newsService.getImpactBgColor(65)).toBe('bg-orange-500/10');
    });

    it('should return yellow bg for medium impact', () => {
      expect(newsService.getImpactBgColor(45)).toBe('bg-yellow-500/10');
    });

    it('should return dark bg for low impact', () => {
      expect(newsService.getImpactBgColor(30)).toBe('bg-bg-dark');
    });
  });

  describe('formatImpactScore', () => {
    it('should format score with unit', () => {
      expect(newsService.formatImpactScore(85)).toBe('85分');
    });

    it('should format zero score', () => {
      expect(newsService.formatImpactScore(0)).toBe('0分');
    });
  });

  describe('getImportanceLabel', () => {
    it('should return important label', () => {
      expect(newsService.getImportanceLabel(true)).toBe('重要');
    });

    it('should return empty string for not important', () => {
      expect(newsService.getImportanceLabel(false)).toBe('');
    });
  });
});

describe('NewsItem Interface', () => {
  it('should have correct structure', () => {
    const news: NewsItem = {
      id: 'n1',
      title: '贵州茅台发布年报',
      source: '上证报',
      time: '刚刚',
      summary: '业绩增长',
      impactScore: 85,
      isImportant: true,
      breakdown: {
        timeliness: 100,
        relevance: 80,
        authority: 100
      }
    };

    expect(news.id).toBe('n1');
    expect(news.title).toBe('贵州茅台发布年报');
    expect(news.impactScore).toBe(85);
    expect(news.isImportant).toBe(true);
    expect(news.breakdown?.timeliness).toBe(100);
  });
});
