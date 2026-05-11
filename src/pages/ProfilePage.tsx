import { useState } from 'react';
import { X, Star, Trash2, Bell, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import Header from '@/components/layout/Header';
import { formatChange } from '@/utils/format';

export default function ProfilePage() {
  const { watchList, removeFromWatchList, subscriptions, removeSubscription } = useAppStore();
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const MenuItem = ({ 
    icon, 
    title, 
    badge, 
    onClick 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    badge?: number;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 active:bg-white/5"
    >
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="text-sm text-text-primary">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-up/10 text-up text-xs">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight size={16} className="text-text-secondary/50" />
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-bg-dark">
      <Header title="我的" showSearch={false} />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-16">
        <div className="p-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-white/5 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center">
              <span className="text-white text-lg font-semibold">投</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">投资者</h2>
              <p className="text-xs text-text-secondary mt-0.5">自选股 {watchList.length} 只</p>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-white/5 overflow-hidden mb-4">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-text-primary">我的自选</h3>
            </div>
            {watchList.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {watchList.map((stock) => (
                  <div 
                    key={stock.code}
                    className="flex items-center justify-between p-4 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Star size={16} className="text-accent" fill="currentColor" />
                      <div>
                        <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                        <span className="text-xs text-text-secondary font-mono ml-2">{stock.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                        {formatChange(stock.change)}
                      </span>
                      <button
                        onClick={() => removeFromWatchList(stock.code)}
                        className="p-1.5 rounded-lg active:bg-white/10 text-text-secondary/50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-text-secondary">
                <Star size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无自选股</p>
                <p className="text-xs text-text-secondary/60 mt-1">从机会详情中添加</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-bg-card border border-white/5 overflow-hidden mb-4">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-text-primary">功能设置</h3>
            </div>
            <MenuItem 
              icon={<Bell size={18} />} 
              title="预警订阅" 
              badge={subscriptions.length}
              onClick={() => setShowSubscriptions(true)}
            />
            <MenuItem 
              icon={<Star size={18} />} 
              title="关注板块" 
              onClick={() => {}}
            />
          </div>

          <div className="rounded-2xl bg-bg-card border border-white/5 overflow-hidden">
            <MenuItem icon={<span className="text-sm">⚙️</span>} title="设置" onClick={() => {}} />
            <MenuItem icon={<span className="text-sm">❓</span>} title="帮助与反馈" onClick={() => {}} />
            <MenuItem icon={<span className="text-sm">📖</span>} title="关于我们" onClick={() => {}} />
          </div>
        </div>
      </div>

      {showSubscriptions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-3xl bg-bg-dark overflow-hidden animate-slide-up">
            <div className="sticky top-0 z-10 bg-bg-dark/95 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-text-primary">预警订阅</h2>
                <button 
                  onClick={() => setShowSubscriptions(false)}
                  className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center"
                >
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[calc(70vh-80px)] overflow-y-auto">
              {subscriptions.length > 0 ? (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div 
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-white/5"
                    >
                      <div>
                        <span className="text-sm font-medium text-text-primary">{sub.target}</span>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {sub.anomalyType === 'all' ? '全部异动' : `${sub.anomalyType}异动`} · 阈值{sub.threshold}%
                        </p>
                      </div>
                      <button
                        onClick={() => removeSubscription(sub.id)}
                        className="p-2 rounded-lg active:bg-white/10 text-text-secondary/50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Bell size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无预警订阅</p>
                  <p className="text-xs text-text-secondary/60 mt-1">从异动详情中添加</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
