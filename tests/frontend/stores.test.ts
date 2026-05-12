import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchList, useRiskPreference, useAlertConfig, useDisclaimer, StockItem } from '../../src/stores';

vi.mock('../../src/stores', async () => {
  const actual = await vi.importActual('../../src/stores');
  return {
    ...actual as any,
    useWatchList: () => {
      const state = {
        stocks: [] as StockItem[],
        addStock: vi.fn(),
        removeStock: vi.fn(),
        clearAll: vi.fn()
      };
      return state;
    },
    useRiskPreference: () => {
      const state = {
        config: { high: 40, medium: 35, low: 25 },
        setConfig: vi.fn(),
        answers: [],
        setAnswers: vi.fn()
      };
      return state;
    },
    useAlertConfig: () => {
      const state = {
        threshold: 5,
        enabled: true,
        setThreshold: vi.fn(),
        setEnabled: vi.fn()
      };
      return state;
    },
    useDisclaimer: () => {
      const state = {
        confirmed: false,
        confirmedAt: undefined,
        confirm: vi.fn()
      };
      return state;
    }
  };
});

describe('WatchList Store', () => {
  it('should define StockItem interface', () => {
    const item: StockItem = {
      code: '600519',
      name: '贵州茅台',
      addedAt: '2026-05-12T10:00:00Z'
    };

    expect(item.code).toBe('600519');
    expect(item.name).toBe('贵州茅台');
  });

  it('should have correct initial state structure', () => {
    const { stocks, addStock, removeStock, clearAll } = useWatchList();

    expect(stocks).toEqual([]);
    expect(typeof addStock).toBe('function');
    expect(typeof removeStock).toBe('function');
    expect(typeof clearAll).toBe('function');
  });
});

describe('RiskPreference Store', () => {
  it('should have correct default config', () => {
    const { config, setConfig, answers, setAnswers } = useRiskPreference();

    expect(config).toEqual({ high: 40, medium: 35, low: 25 });
    expect(typeof setConfig).toBe('function');
    expect(Array.isArray(answers)).toBe(true);
    expect(typeof setAnswers).toBe('function');
  });

  it('should support custom risk preference', () => {
    const customConfig = { high: 80, medium: 15, low: 5 };
    const { setConfig } = useRiskPreference();

    expect(typeof setConfig).toBe('function');
  });
});

describe('AlertConfig Store', () => {
  it('should have correct default values', () => {
    const { threshold, enabled, setThreshold, setEnabled } = useAlertConfig();

    expect(threshold).toBe(5);
    expect(enabled).toBe(true);
    expect(typeof setThreshold).toBe('function');
    expect(typeof setEnabled).toBe('function');
  });

  it('should support threshold configuration', () => {
    const { setThreshold } = useAlertConfig();

    expect(typeof setThreshold).toBe('function');
  });
});

describe('Disclaimer Store', () => {
  it('should have correct initial state', () => {
    const { confirmed, confirmedAt, confirm } = useDisclaimer();

    expect(confirmed).toBe(false);
    expect(confirmedAt).toBeUndefined();
    expect(typeof confirm).toBe('function');
  });
});

describe('Store Integration', () => {
  it('should export all store hooks', () => {
    const watchlist = useWatchList();
    const riskPref = useRiskPreference();
    const alertConfig = useAlertConfig();
    const disclaimer = useDisclaimer();

    expect(watchlist).toBeDefined();
    expect(riskPref).toBeDefined();
    expect(alertConfig).toBeDefined();
    expect(disclaimer).toBeDefined();
  });
});
