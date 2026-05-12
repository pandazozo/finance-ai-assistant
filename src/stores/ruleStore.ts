import { create } from 'zustand';
import { ruleService, Rule, Condition, PresetStrategy } from '../services/ruleService';

interface RuleState {
  rules: Rule[];
  presets: PresetStrategy[];
  currentRule: Rule | null;
  loading: boolean;
  error: string | null;
  
  fetchRules: () => Promise<void>;
  fetchPresets: () => Promise<void>;
  createRule: (rule: Omit<Rule, 'id' | 'createdAt' | 'isActive'>) => Promise<void>;
  updateRule: (ruleId: string, rule: Partial<Rule>) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  matchRule: (ruleId: string) => Promise<{ count: number; stocks: string[] }>;
  setCurrentRule: (rule: Rule | null) => void;
  clearError: () => void;
}

export const useRuleStore = create<RuleState>((set, get) => ({
  rules: [],
  presets: [],
  currentRule: null,
  loading: false,
  error: null,

  fetchRules: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ruleService.getRules();
      set({ rules: response.data.rules || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '获取规则失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPresets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ruleService.getPresets();
      set({ presets: response.data.presets || [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '获取预设策略失败' });
    } finally {
      set({ loading: false });
    }
  },

  createRule: async (rule) => {
    set({ loading: true, error: null });
    try {
      const response = await ruleService.createRule(rule);
      const newRule = response.data;
      set((state) => ({ rules: [...state.rules, newRule] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '创建规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateRule: async (ruleId, rule) => {
    set({ loading: true, error: null });
    try {
      const response = await ruleService.updateRule(ruleId, rule);
      const updatedRule = response.data;
      set((state) => ({
        rules: state.rules.map((r) => r.id === ruleId ? updatedRule : r),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '更新规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteRule: async (ruleId) => {
    set({ loading: true, error: null });
    try {
      await ruleService.deleteRule(ruleId);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '删除规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  matchRule: async (ruleId) => {
    set({ loading: true, error: null });
    try {
      const response = await ruleService.matchRule(ruleId);
      return {
        count: response.data.matchingCount,
        stocks: response.data.matchingStocks,
      };
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '匹配规则失败' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentRule: (rule) => {
    set({ currentRule: rule });
  },

  clearError: () => {
    set({ error: null });
  },
}));
