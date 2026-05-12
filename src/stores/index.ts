import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StockItem {
  code: string;
  name: string;
  addedAt: string;
}

export interface WatchListState {
  stocks: StockItem[];
  addStock: (code: string, name: string) => void;
  removeStock: (code: string) => void;
  clearAll: () => void;
}

export const useWatchList = create<WatchListState>()(
  persist(
    (set) => ({
      stocks: [],
      addStock: (code, name) => set((state) => {
        if (state.stocks.some(s => s.code === code)) {
          return state;
        }
        return {
          stocks: [...state.stocks, { code, name, addedAt: new Date().toISOString() }]
        };
      }),
      removeStock: (code) => set((state) => ({
        stocks: state.stocks.filter(s => s.code !== code)
      })),
      clearAll: () => set({ stocks: [] })
    }),
    { name: 'fa_watchlist' }
  )
);

export interface RiskLevel {
  high: number;
  medium: number;
  low: number;
}

export interface RiskPreferenceState {
  config: RiskLevel;
  setConfig: (config: RiskLevel) => void;
  answers: number[];
  setAnswers: (answers: number[]) => void;
}

export const useRiskPreference = create<RiskPreferenceState>()(
  persist(
    (set) => ({
      config: { high: 40, medium: 35, low: 25 },
      setConfig: (config) => set({ config }),
      answers: [],
      setAnswers: (answers) => set({ answers })
    }),
    { name: 'fa_risk_preference' }
  )
);

export interface AlertConfigState {
  threshold: number;
  enabled: boolean;
  setThreshold: (threshold: number) => void;
  setEnabled: (enabled: boolean) => void;
}

export const useAlertConfig = create<AlertConfigState>()(
  persist(
    (set) => ({
      threshold: 5,
      enabled: true,
      setThreshold: (threshold) => set({ threshold }),
      setEnabled: (enabled) => set({ enabled })
    }),
    { name: 'fa_alert_config' }
  )
);

export interface DisclaimerState {
  confirmed: boolean;
  confirmedAt?: string;
  confirm: () => void;
}

export const useDisclaimer = create<DisclaimerState>()(
  persist(
    (set) => ({
      confirmed: false,
      confirm: () => set({ confirmed: true, confirmedAt: new Date().toISOString() })
    }),
    { name: 'fa_disclaimer_status' }
  )
);
