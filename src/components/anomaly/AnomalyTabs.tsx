import { ANOMALY_LABELS, AnomalyType } from '@/utils/constants';

interface AnomalyTabsProps {
  activeTab: AnomalyType | 'all';
  onTabChange: (tab: AnomalyType | 'all') => void;
}

const tabs: { key: AnomalyType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'price', label: '价格' },
  { key: 'fund', label: '资金' },
  { key: 'volume', label: '成交量' },
];

export default function AnomalyTabs({ activeTab, onTabChange }: AnomalyTabsProps) {
  return (
    <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-primary-light text-white'
              : 'bg-bg-card text-text-secondary border border-white/10'
          }`}
        >
          {tab.key === 'all' ? tab.label : ANOMALY_LABELS[tab.key as AnomalyType]}
        </button>
      ))}
    </div>
  );
}
