export const ANOMALY_TYPES = {
  PRICE: 'price',
  FUND: 'fund',
  VOLUME: 'volume',
} as const;

export type AnomalyType = typeof ANOMALY_TYPES[keyof typeof ANOMALY_TYPES];

export const ANOMALY_LABELS: Record<AnomalyType, string> = {
  [ANOMALY_TYPES.PRICE]: '价格异动',
  [ANOMALY_TYPES.FUND]: '资金异动',
  [ANOMALY_TYPES.VOLUME]: '成交量异动',
};

export const TAB_ITEMS = [
  { key: 'opportunity', label: '机会', path: '/' },
  { key: 'anomaly', label: '异动', path: '/anomaly' },
  { key: 'review', label: '复盘', path: '/review' },
  { key: 'profile', label: '我的', path: '/profile' },
] as const;

export const THEME_COLORS = {
  primary: '#1A365D',
  primaryLight: '#3182CE',
  accent: '#D69E2E',
  up: '#E53E3E',
  down: '#38A169',
  bgDark: '#1A1A2E',
  bgCard: '#16213E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
} as const;

export const REFRESH_INTERVALS = {
  OPPORTUNITY: 5 * 60 * 1000,
  ANOMALY: 30 * 1000,
} as const;
