import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ruleService } from '../../src/services/ruleService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Rule Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getRules', () => {
    it('should fetch rules successfully', async () => {
      const mockResponse = {
        code: 0,
        data: {
          rules: [
            { id: 'rule-1', name: '测试规则', conditions: [], conditionLogic: 'AND' }
          ]
        }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ruleService.getRules();
      
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v3/rules'));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPresets', () => {
    it('should fetch presets successfully', async () => {
      const mockResponse = {
        code: 0,
        data: {
          presets: [
            { id: 'preset-1', name: '突破新高', description: '...', conditions: [] }
          ]
        }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ruleService.getPresets();
      
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/v3/presets'));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createRule', () => {
    it('should create a rule successfully', async () => {
      const mockRule = {
        name: '测试规则',
        conditions: [],
        conditionLogic: 'AND'
      };
      const mockResponse = {
        code: 0,
        data: { id: 'new-rule', ...mockRule }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await ruleService.createRule(mockRule);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v3/rules'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Label functions', () => {
    it('should get condition type label', () => {
      expect(ruleService.getConditionTypeLabel('technical')).toBe('技术面');
      expect(ruleService.getConditionTypeLabel('fundamental')).toBe('基本面');
      expect(ruleService.getConditionTypeLabel('news')).toBe('消息面');
    });

    it('should get field label', () => {
      expect(ruleService.getFieldLabel('change_percent')).toBe('涨跌幅(%)');
      expect(ruleService.getFieldLabel('pe_ratio')).toBe('PE市盈率');
    });

    it('should get operator label', () => {
      expect(ruleService.getOperatorLabel('>')).toBe('大于');
      expect(ruleService.getOperatorLabel('>=')).toBe('大于等于');
    });

    it('should get fields for type', () => {
      expect(ruleService.getFieldsForType('technical')).toContain('change_percent');
      expect(ruleService.getFieldsForType('fundamental')).toContain('pe_ratio');
      expect(ruleService.getFieldsForType('news')).toContain('has_positive_news');
    });
  });
});

describe('Rule Interfaces', () => {
  it('should define valid interfaces', () => {
    const condition = {
      type: 'technical' as const,
      field: 'change_percent',
      operator: '>' as const,
      value: 5
    };
    expect(condition).toBeDefined();

    const rule = {
      id: 'test',
      name: '测试',
      conditions: [condition],
      conditionLogic: 'AND' as const
    };
    expect(rule).toBeDefined();
  });
});
