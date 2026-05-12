import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { llmService } from '../../src/services/llmService';

describe('LLM Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalysis', () => {
    it('should call analysis API with correct parameters', async () => {
      const mockResponse = {
        code: 0,
        data: {
          stockCode: '600519',
          stockName: '贵州茅台',
          analysis: '今日表现强势，建议关注',
          source: 'rule_engine',
          fallback: true,
          message: '当前使用规则分析',
          newsImpact: 0,
          generatedAt: '2026-05-12 10:30:00'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await llmService.getAnalysis('600519', { high: 80, medium: 15, low: 5 }, false);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/stocks/analysis'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: '600519',
            riskPreference: { high: 80, medium: 15, low: 5 },
            includeNews: false
          })
        })
      );

      expect(result.code).toBe(0);
      expect(result.data.source).toBe('rule_engine');
      expect(result.data.fallback).toBe(true);
    });

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(llmService.getAnalysis('600519')).rejects.toThrow('API error: 500');
    });

    it('should use default risk preference when not provided', async () => {
      const mockResponse = {
        code: 0,
        data: {
          stockCode: '600519',
          analysis: '分析内容',
          source: 'rule_engine',
          fallback: true,
          message: '',
          newsImpact: 0,
          generatedAt: '2026-05-12 10:30:00'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await llmService.getAnalysis('600519');

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.riskPreference).toEqual({ high: 40, medium: 35, low: 25 });
    });
  });

  describe('getSourceLabel', () => {
    it('should return LLM label for llm source', () => {
      expect(llmService.getSourceLabel('llm')).toBe('AI深度分析');
    });

    it('should return rule engine label for rule_engine source', () => {
      expect(llmService.getSourceLabel('rule_engine')).toBe('智能分析');
    });
  });

  describe('isFallback', () => {
    it('should return false for llm source', () => {
      expect(llmService.isFallback('llm')).toBe(false);
    });

    it('should return true for rule_engine source', () => {
      expect(llmService.isFallback('rule_engine')).toBe(true);
    });
  });
});

describe('AnalysisResponse Interface', () => {
  it('should have correct structure', () => {
    const mockResponse = {
      code: 0,
      data: {
        stockCode: '600519',
        stockName: '贵州茅台',
        analysis: '今日表现强势',
        source: 'llm' as const,
        fallback: false,
        message: 'AI分析完成',
        newsImpact: 85,
        generatedAt: '2026-05-12 10:30:00'
      }
    };

    expect(mockResponse.data.stockCode).toBe('600519');
    expect(mockResponse.data.source).toBe('llm');
    expect(mockResponse.data.fallback).toBe(false);
    expect(mockResponse.data.newsImpact).toBe(85);
  });
});
