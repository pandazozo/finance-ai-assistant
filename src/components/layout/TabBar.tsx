import { TrendingUp, Activity, BarChart3, User } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const tabs = [
  { key: 'opportunity', label: '机会', icon: TrendingUp, path: '/' },
  { key: 'anomaly', label: '异动', icon: Activity, path: '/anomaly' },
  { key: 'review', label: '复盘', icon: BarChart3, path: '/review' },
  { key: 'profile', label: '我的', icon: User, path: '/profile' },
];

export default function TabBar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-white/10 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive ? 'text-primary-light' : 'text-text-secondary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary-light rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
