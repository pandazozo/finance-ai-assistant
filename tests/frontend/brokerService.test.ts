import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brokerService, BROKERS, getBrokerIcon, getBrokerColor } from '../../src/services/brokerService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Broker Service', () => {
  describe('getBrokers', () => {
    it('should return list of brokers', () => {
      const brokers = brokerService.getBrokers();
      expect(brokers).toBeDefined();
      expect(Array.isArray(brokers)).toBe(true);
      expect(brokers.length).toBeGreaterThan(0);
    });

    it('should have huatai broker', () => {
      const brokers = brokerService.getBrokers();
      const huatai = brokers.find(b => b.id === 'huatai');
      expect(huatai).toBeDefined();
      expect(huatai?.name).toBe('华泰证券');
    });
  });

  describe('getBrokerById', () => {
    it('should find broker by id', () => {
      const broker = brokerService.getBrokerById('eastmoney');
      expect(broker).toBeDefined();
      expect(broker?.name).toBe('东方财富');
    });

    it('should return undefined for invalid id', () => {
      const broker = brokerService.getBrokerById('invalid');
      expect(broker).toBeUndefined();
    });
  });

  describe('normalizeStockCode', () => {
    it('should remove sh prefix', () => {
      const result = brokerService.normalizeStockCode('sh600519');
      expect(result).toBe('600519');
    });

    it('should remove sz prefix', () => {
      const result = brokerService.normalizeStockCode('sz300750');
      expect(result).toBe('300750');
    });

    it('should keep clean code', () => {
      const result = brokerService.normalizeStockCode('600519');
      expect(result).toBe('600519');
    });
  });

  describe('getBrokerIcon', () => {
    it('should return icon for huatai', () => {
      expect(getBrokerIcon('huatai')).toBe('华');
    });

    it('should return default icon', () => {
      expect(getBrokerIcon('unknown')).toBe('券');
    });
  });

  describe('getBrokerColor', () => {
    it('should return color for huatai', () => {
      expect(getBrokerColor('huatai')).toContain('blue');
    });

    it('should return default color', () => {
      expect(getBrokerColor('unknown')).toContain('gray');
    });
  });
});
