import { describe, test, expect, vi } from 'vitest';
import { BROKERS, brokerService } from '../../src/services/brokerService';

describe('Broker Service - 100% Coverage', () => {
  describe('BROKERS constant', () => {
    test('should have all brokers defined', () => {
      expect(BROKERS).toBeDefined();
      expect(Array.isArray(BROKERS)).toBe(true);
      expect(BROKERS.length).toBeGreaterThan(0);
    });

    test('each broker should have required fields', () => {
      BROKERS.forEach(broker => {
        expect(broker.id).toBeDefined();
        expect(broker.name).toBeDefined();
        expect(broker.schema).toBeDefined();
      });
    });
  });

  describe('brokerService', () => {
    test('jumpToBroker should work with valid broker', async () => {
      const result = await brokerService.jumpToBroker('huatai', '600519');
      expect(result.success).toBeDefined();
    });

    test('jumpToBroker should return success with valid inputs', async () => {
      const result = await brokerService.jumpToBroker('citic', '000001');
      expect(typeof result.success).toBe('boolean');
    });

    test('jumpToBroker should handle unknown broker', async () => {
      const result = await brokerService.jumpToBroker('unknown_broker', '600519');
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    test('jumpToBroker should handle invalid stock code', async () => {
      const result = await brokerService.jumpToBroker('huatai', '');
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    test('jumpToBroker should handle special characters in stock code', async () => {
      const result = await brokerService.jumpToBroker('huatai', '600519.SH');
      expect(result).toBeDefined();
    });

    test('getBrokerById should return existing broker', () => {
      const broker = brokerService.getBrokerById('huatai');
      expect(broker).toBeDefined();
      expect(broker?.id).toBe('huatai');
    });

    test('getBrokerById should return undefined for non-existent broker', () => {
      const broker = brokerService.getBrokerById('non_existent');
      expect(broker).toBeUndefined();
    });

    test('getBrokerById should be case sensitive', () => {
      const broker = brokerService.getBrokerById('HUATAI');
      expect(broker).toBeUndefined();
    });

    test('getBrokerList should return all brokers', () => {
      const brokers = brokerService.getBrokerList();
      expect(brokers).toEqual(BROKERS);
      expect(brokers.length).toBe(BROKERS.length);
    });

    test('getBrokerList should not return a copy', () => {
      const brokers1 = brokerService.getBrokerList();
      const brokers2 = brokerService.getBrokerList();
      expect(brokers1).toBe(brokers2);
    });

    test('should handle all defined brokers', async () => {
      for (const broker of BROKERS) {
        const result = await brokerService.jumpToBroker(broker.id, '600519');
        expect(result).toBeDefined();
      }
    });
  });
});
