import { useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Star, Zap, BarChart2, User } from 'lucide-react';

const tabs = [
  { key: 'home', label: '机会', icon: TrendingUp, path: '/' },
  { key: 'anomaly', label: '异动', icon: Zap, path: '/anomaly' },
  { key: 'watchlist', label: '自选', icon: Star, path: '/watchlist' },
  { key: 'review', label: '复盘', icon: BarChart2, path: '/review' },
  { key: 'profile', label: '我的', icon: User, path: '/profile' },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/anomaly') return 'anomaly';
    if (location.pathname === '/watchlist') return 'watchlist';
    if (location.pathname === '/review') return 'review';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
