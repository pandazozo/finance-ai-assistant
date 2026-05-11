import { X, Star, Flame, Clock, Plus } from 'lucide-react';
import { Opportunity } from '@/services/mockData';
import { formatChange } from '@/utils/format';
import { useAppStore } from '@/stores/useAppStore';
import NewsItem from '@/components/common/NewsItem';

interface OpportunityDetailProps {
  data: Opportunity;
  onClose: () => void;
}

export default function OpportunityDetail({ data, onClose }: OpportunityDetailProps) {
  const { addToWatchList, isInWatchList } = useAppStore();

  const handleAddToWatchList = (stock: { code: string; name: string; change: number }) => {
    if (!isInWatchList(stock.code)) {
      addToWatchList({ ...stock, price: 0 });
    }
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
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-up/10">
                <Flame size={14} className="text-up" />
                <span className="text-sm font-semibold text-up">{data.heatIndex}</span>
              </div>
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: Math.floor(data.score) }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <h2 className="text-xl font-bold text-text-primary mb-1">{data.topic}</h2>
            <p className="text-sm text-text-secondary">{data.topicDescription}</p>
            <div className="flex items-center gap-1 mt-2 text-text-secondary/60">
              <Clock size={12} />
              <span className="text-xs">更新时间：{data.updatedAt}</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)] scrollbar-hide pb-6">
          <div className="p-4 space-y-4">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <span className="w-1 h-4 rounded-full bg-primary-light" />
                驱动逻辑
              </h3>
              <div className="space-y-2">
                {data.drivers.map((driver, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light/20 text-primary-light text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-text-secondary">{driver}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <span className="w-1 h-4 rounded-full bg-accent" />
                关联个股
              </h3>
              <div className="space-y-2">
                {data.stocks.map((stock) => (
                  <div 
                    key={stock.code}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-text-secondary font-mono block">{stock.code}</span>
                        <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-text-secondary">相关度</span>
                        <span className="text-sm font-medium text-primary-light ml-1">
                          {(stock.relevance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                        {formatChange(stock.change)}
                      </span>
                      <button
                        onClick={() => handleAddToWatchList(stock)}
                        className={`p-2 rounded-lg transition-colors ${
                          isInWatchList(stock.code)
                            ? 'bg-primary-light/20 text-primary-light'
                            : 'bg-bg-dark text-text-secondary active:bg-white/10'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <span className="w-1 h-4 rounded-full bg-up" />
                相关资讯
              </h3>
              <div className="space-y-2">
                {data.news.map((news) => (
                  <NewsItem key={news.id} {...news} />
                ))}
              </div>
            </section>

            <section className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-accent mb-2">
                💡 AI参考建议
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                建议关注{data.topic}板块的持续性，注意控制仓位。该题材短期热度较高，追高需谨慎，建议逢低布局核心标的。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
