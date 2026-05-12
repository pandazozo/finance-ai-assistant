import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOpportunities', () => {
    it('should fetch opportunities from API', async () => {
      const mockOpportunities = [
        {
          id: 'opp_1',
          topic: '市场活跃',
          topicDescription: 'A股交投活跃',
          heatIndex: 75,
          score: 4.2,
          stocks: [],
          news: [],
          drivers: ['市场情绪回暖'],
          updatedAt: '刚刚'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOpportunities)
      });

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.getOpportunities();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/opportunities'),
        expect.any(Object)
      );
    });

    it('should fallback to mock data on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.getOpportunities();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAnomalies', () => {
    it('should fetch anomalies from API', async () => {
      const mockAnomalies = [
        {
          id: 'anomaly_1',
          stockName: '贵州茅台',
          stockCode: '600519',
          type: 'price',
          change: 2.5,
          time: '10:30:00',
          newsCount: 1,
          news: [],
          aiInsight: '涨幅较大',
          hasNews: true
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnomalies)
      });

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.getAnomalies();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/anomalies'),
        expect.any(Object)
      );
    });
  });

  describe('getReviewReport', () => {
    it('should fetch review report from API', async () => {
      const mockReport = {
        date: '2026-05-12',
        indices: [],
        hotSectors: [],
        outlook: {
          opportunities: [],
          risks: []
        },
        portfolio: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReport)
      });

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.getReviewReport();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/review'),
        expect.any(Object)
      );
    });
  });

  describe('searchStocks', () => {
    it('should fallback to local search on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.searchStocks('宁德');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('宁德');
    });

    it('should search by code', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { dataService } = await import('../../src/services/dataService');
      const result = await dataService.searchStocks('300750');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe('DataService API Response Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const { dataService } = await import('../../src/services/dataService');
    const result = await dataService.getOpportunities();

    expect(result).toBeDefined();
  });

  it('should handle JSON parse error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    const { dataService } = await import('../../src/services/dataService');
    const result = await dataService.getAnomalies();

    expect(result).toBeDefined();
  });
});
