import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
}

interface Subscription {
  id: string;
  type: 'stock' | 'sector';
  target: string;
  anomalyType: 'price' | 'fund' | 'volume' | 'all';
  threshold: number;
  enabled: boolean;
}

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  watchList: Stock[];
  addToWatchList: (stock: Stock) => void;
  removeFromWatchList: (code: string) => void;
  isInWatchList: (code: string) => boolean;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  removeSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;

  selectedOpportunityId: string | null;
  setSelectedOpportunity: (id: string | null) => void;

  selectedAnomalyId: string | null;
  setSelectedAnomaly: (id: string | null) => void;

  searchHistory: string[];
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'opportunity',
      setActiveTab: (tab) => set({ activeTab: tab }),

      watchList: [],
      addToWatchList: (stock) => {
        const exists = get().watchList.some(s => s.code === stock.code);
        if (!exists) {
          set((state) => ({ watchList: [...state.watchList, stock] }));
        }
      },
      removeFromWatchList: (code) => {
        set((state) => ({ 
          watchList: state.watchList.filter(s => s.code !== code) 
        }));
      },
      isInWatchList: (code) => {
        return get().watchList.some(s => s.code === code);
      },

      subscriptions: [],
      addSubscription: (sub) => {
        const id = `sub_${Date.now()}`;
        set((state) => ({ 
          subscriptions: [...state.subscriptions, { ...sub, id }] 
        }));
      },
      removeSubscription: (id) => {
        set((state) => ({ 
          subscriptions: state.subscriptions.filter(s => s.id !== id) 
        }));
      },
      toggleSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map(s => 
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        }));
      },

      selectedOpportunityId: null,
      setSelectedOpportunity: (id) => set({ selectedOpportunityId: id }),

      selectedAnomalyId: null,
      setSelectedAnomaly: (id) => set({ selectedAnomalyId: id }),

      searchHistory: [],
      addSearchHistory: (keyword) => {
        const history = get().searchHistory.filter(h => h !== keyword);
        set({ searchHistory: [keyword, ...history].slice(0, 10) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'finance-assistant-storage',
    }
  )
);
