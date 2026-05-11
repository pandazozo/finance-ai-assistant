import { TrendingUp, TrendingDown, Droplets, Minus } from 'lucide-react';
import { Anomaly } from '@/services/mockData';
import { formatChange, formatTime } from '@/utils/format';
import { ANOMALY_LABELS } from '@/utils/constants';

interface AnomalyCardProps {
  data: Anomaly;
  onClick: () => void;
}

export default function AnomalyCard({ data, onClick }: AnomalyCardProps) {
  const getTypeIcon = () => {
    switch (data.type) {
      case 'price':
        return data.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
      case 'fund':
        return data.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
      case 'volume':
        return <Droplets size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  const getTypeColor = () => {
    if (data.type === 'volume') return 'text-primary-light';
    return data.change >= 0 ? 'text-up' : 'text-down';
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl bg-bg-card border border-white/5 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor()} bg-current/10`}>
          {getTypeIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{data.stockName}</span>
            <span className="text-xs text-text-secondary font-mono">{data.stockCode}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded bg-bg-dark/50 text-text-secondary`}>
              {ANOMALY_LABELS[data.type]}
            </span>
            <span className="text-xs text-text-secondary/60">{data.time}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          {data.newsCount > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
              <span className="text-xs text-primary-light">{data.newsCount}条资讯</span>
            </div>
          )}
          {data.newsCount === 0 && (
            <div className="text-xs text-text-secondary/60 mb-1">无消息催化</div>
          )}
          <span className={`text-base font-semibold ${getTypeColor()}`}>
            {formatChange(data.change)}
          </span>
        </div>
      </div>
    </div>
  );
}
