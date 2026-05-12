import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { api, StockQuote, AIConclusion, RiskPreference } from '../../src/services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getQuote', () => {
    it('should fetch stock quotes', async () => {
      const mockResponse = {
        code: 0,
        message: 'success',
        data: {
          quotes: [
            {
              code: '600519',
              name: '贵州茅台',
              price: 1680.0,
              change: 41.32,
              changePercent: 2.52,
              volume: 12000000,
              amount: 20160000000,
              high: 1690.0,
              low: 1640.0,
              open: 1645.0,
              prevClose: 1638.68,
              updateTime: '2026-05-12 10:30:00'
            }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getQuote(['600519']);

      expect(result.code).toBe(0);
      expect(result.data.quotes).toHaveLength(1);
      expect(result.data.quotes[0].code).toBe('600519');
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/stocks/quote'));
    });

    it('should handle multiple stock codes', async () => {
      const mockResponse = {
        code: 0,
        message: 'success',
        data: {
          quotes: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await api.getQuote(['600519', '300750']);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('codes=600519,300750'));
    });
  });

  describe('searchStocks', () => {
    it('should search stocks by keyword', async () => {
      const mockResponse = {
        code: 0,
        data: {
          stocks: [
            { code: '600519', name: '贵州茅台', market: '沪市' }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.searchStocks('茅台');

      expect(result.code).toBe(0);
      expect(result.data.stocks).toHaveLength(1);
      expect(result.data.stocks[0].name).toBe('贵州茅台');
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        code: 0,
        data: {
          stocks: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.searchStocks('xyznotexist');

      expect(result.data.stocks).toHaveLength(0);
    });
  });

  describe('getAIConclusion', () => {
    it('should fetch AI conclusion with default risk preference', async () => {
      const mockResponse = {
        code: 0,
        data: {
          code: '600519',
          name: '贵州茅台',
          conclusion: {
            level: 4,
            label: '强烈推荐',
            score: 85,
            explanation: '贵州茅台今日上涨2.52%，走势偏强',
            signals: [
              { type: '技术面', signal: '涨幅较大', score: 15 }
            ],
            riskTips: '市场有风险，投资需谨慎'
          },
          generatedAt: '2026-05-12 10:30:00'
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getAIConclusion('600519');

      expect(result.code).toBe(0);
      expect(result.data.conclusion.label).toBe('强烈推荐');
    });

    it('should send custom risk preference', async () => {
      const mockResponse = {
        code: 0,
        data: {
          conclusion: {
            level: 4,
            label: '强烈推荐',
            score: 90,
            riskPreferenceLabel: '（进取型）',
            riskCoefficient: 1.38,
            signals: [],
            riskTips: '市场有风险'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const riskPref: RiskPreference = { high: 80, medium: 15, low: 5 };
      await api.getAIConclusion('600519', riskPref);

      const expectedBody = JSON.stringify({ code: '600519', riskPreference: { high: 80, medium: 15, low: 5 } });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/stocks/ai-conclusion'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expectedBody
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const mockResponse = {
        status: 'healthy',
        version: '2.0.0',
        data_source: 'AKShare',
        timestamp: '2026-05-12T10:30:00'
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.version).toBe('2.0.0');
    });
  });
});

describe('Type Interfaces', () => {
  it('should define StockQuote interface correctly', () => {
    const quote: StockQuote = {
      code: '600519',
      name: '贵州茅台',
      price: 1680.0,
      change: 41.32,
      changePercent: 2.52,
      volume: 12000000,
      amount: 20160000000,
      high: 1690.0,
      low: 1640.0,
      open: 1645.0,
      prevClose: 1638.68,
      updateTime: '2026-05-12 10:30:00'
    };

    expect(quote.code).toBe('600519');
    expect(quote.price).toBe(1680.0);
  });

  it('should define AIConclusion interface correctly', () => {
    const conclusion: AIConclusion = {
      level: 4,
      label: '强烈推荐',
      score: 85,
      explanation: '贵州茅台今日上涨2.52%',
      signals: [
        { type: '技术面', signal: '涨幅较大', score: 15 }
      ],
      riskTips: '市场有风险'
    };

    expect(conclusion.level).toBe(4);
    expect(conclusion.label).toBe('强烈推荐');
    expect(conclusion.signals).toHaveLength(1);
  });

  it('should define RiskPreference interface correctly', () => {
    const pref: RiskPreference = {
      high: 80,
      medium: 15,
      low: 5
    };

    expect(pref.high).toBe(80);
    expect(pref.medium).toBe(15);
    expect(pref.low).toBe(5);
  });
});
