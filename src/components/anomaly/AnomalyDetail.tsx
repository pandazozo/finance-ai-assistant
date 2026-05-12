import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { Anomaly } from '@/services/mockData';
import { formatChange } from '@/utils/format';
import { ANOMALY_LABELS } from '@/utils/constants';
import { useAppStore } from '@/stores/useAppStore';
import NewsItem from '@/components/common/NewsItem';

interface AnomalyDetailProps {
  data: Anomaly;
  onClose: () => void;
}

export default function AnomalyDetail({ data, onClose }: AnomalyDetailProps) {
  const { addToWatchList, isInWatchList, addSubscription } = useAppStore();
  const isUp = data.change >= 0;

  const handleAddToWatchList = () => {
    if (!isInWatchList(data.stockCode)) {
      addToWatchList({ code: data.stockCode, name: data.stockName, price: 0, change: data.change });
    }
  };

  const handleSubscribe = () => {
    addSubscription({
      type: 'stock',
      target: data.stockCode,
      anomalyType: data.type,
      threshold: Math.abs(data.change),
      enabled: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl bg-bg-dark overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-bg-dark/95 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isUp ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
              }`}>
                {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-text-primary">{data.stockName}</span>
                  <span className="text-xs text-text-secondary font-mono">{data.stockCode}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-sm font-medium ${isUp ? 'text-up' : 'text-down'}`}>
                    {formatChange(data.change)}
                  </span>
                  <span className="text-xs text-text-secondary">{ANOMALY_LABELS[data.type]}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          <div className="px-4 pb-3 flex items-center gap-2 text-text-secondary/60">
            <span className="text-xs">异动时间：{data.time}</span>
          </div>
        </div>

        <div 
          className="overflow-y-auto" 
          style={{ 
            maxHeight: 'calc(85vh - 140px)',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          <div className="p-4 space-y-4 pb-6">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <span className="w-1 h-4 rounded-full bg-up" />
                关联资讯 {data.newsCount > 0 ? `(${data.newsCount}条)` : ''}
              </h3>
              {data.newsCount > 0 ? (
                <div className="space-y-2">
                  {data.news.map((news) => (
                    <NewsItem key={news.id} {...news} />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-medium">无消息催化</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    此异动暂无关联资讯，纯盘面资金行为。建议关注是否有潜在消息面变化。
                  </p>
                </div>
              )}
            </section>

            <section className="p-4 rounded-xl bg-primary-light/10 border border-primary-light/20">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-light mb-2">
                💡 AI解读
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {data.aiInsight}
              </p>
            </section>

            <section className="flex gap-3">
              <button
                onClick={handleAddToWatchList}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isInWatchList(data.stockCode)
                    ? 'bg-primary-light/20 text-primary-light'
                    : 'bg-primary-light text-white active:bg-primary-light/80'
                }`}
              >
                {isInWatchList(data.stockCode) ? '已加入自选' : '加入自选'}
              </button>
              <button
                onClick={handleSubscribe}
                className="flex-1 py-3 rounded-xl font-medium text-sm bg-bg-card text-text-primary border border-white/10 active:bg-white/5 flex items-center justify-center gap-2"
              >
                <Bell size={16} />
                开启预警
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
