import { X, TrendingUp, TrendingDown, Clock, Newspaper, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatChange } from '@/utils/format';
import { Anomaly } from '@/services/mockData';

interface AnomalyDetailProps {
  data: Anomaly;
  onClose: () => void;
}

export default function AnomalyDetail({ data, onClose }: AnomalyDetailProps) {
  const navigate = useNavigate();
  const isUp = data.change > 0;

  const handleStockClick = () => {
    onClose();
    navigate(`/stock/${data.stockCode}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl bg-bg-dark animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="h-full flex flex-col"
          style={{ 
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          <div className="flex-none flex-shrink-0 bg-bg-dark/95 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isUp ? 'bg-up/10' : 'bg-down/10'
                }`}>
                  {isUp ? (
                    <TrendingUp size={20} className="text-up" />
                  ) : (
                    <TrendingDown size={20} className="text-down" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{data.stockName}</h2>
                  <span className="text-xs text-text-secondary font-mono">{data.stockCode}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center"
              >
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              minHeight: 0
            }}
          >
            <div className="p-4 space-y-4 pb-24">
              <section className={`p-4 rounded-xl ${
                isUp ? 'bg-up/5 border border-up/20' : 'bg-down/5 border border-down/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">异动涨跌幅</span>
                  <span className={`text-2xl font-bold ${isUp ? 'text-up' : 'text-down'}`}>
                    {formatChange(data.change)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-secondary/60">
                  <Clock size={12} />
                  <span className="text-xs">异动时间：{data.time}</span>
                </div>
              </section>

              {data.aiInsight && (
                <section className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-accent mb-3">
                    <AlertCircle size={16} />
                    AI智能解读
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {data.aiInsight}
                  </p>
                </section>
              )}

              {data.news && data.news.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                    <Newspaper size={16} />
                    相关资讯
                    <span className="px-1.5 py-0.5 rounded bg-primary-light/20 text-primary-light text-xs">
                      {data.news.length}条
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {data.news.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl bg-bg-card border border-white/5"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-primary-light">{item.source}</span>
                          <span className="text-xs text-text-secondary/60">·</span>
                          <span className="text-xs text-text-secondary/60">{item.time}</span>
                        </div>
                        <h4 className="text-sm font-medium text-text-primary mb-1">{item.title}</h4>
                        {item.summary && (
                          <p className="text-xs text-text-secondary leading-relaxed">{item.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <button
                  onClick={handleStockClick}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-primary text-white active:bg-primary/90"
                >
                  <span className="font-medium">查看 {data.stockName} 详情</span>
                  <ExternalLink size={18} />
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
