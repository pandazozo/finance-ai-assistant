import { Flame, Star, Clock } from 'lucide-react';
import { Opportunity } from '@/services/mockData';
import { formatChange, generateStars } from '@/utils/format';

interface OpportunityCardProps {
  data: Opportunity;
  onClick: () => void;
}

export default function OpportunityCard({ data, onClick }: OpportunityCardProps) {
  const topStocks = data.stocks.slice(0, 3);

  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-2xl bg-bg-card border border-white/5 cursor-pointer active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-text-primary">{data.topic}</h3>
            <div className="flex items-center gap-0.5 text-accent">
              {Array.from({ length: Math.floor(data.score) }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </div>
          </div>
          <p className="text-xs text-text-secondary line-clamp-2">{data.topicDescription}</p>
        </div>
        
        <div className="flex flex-col items-end ml-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-up/10">
            <Flame size={12} className="text-up" />
            <span className="text-sm font-medium text-up">{data.heatIndex}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-text-secondary/60">
            <Clock size={10} />
            <span className="text-[10px]">{data.updatedAt}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {topStocks.map((stock) => (
          <div 
            key={stock.code}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-dark/50 border border-white/5"
          >
            <span className="text-xs text-text-secondary font-mono">{stock.code}</span>
            <span className="text-xs text-text-primary font-medium">{stock.name}</span>
            <span className={`text-[10px] font-medium ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
              {formatChange(stock.change)}
            </span>
          </div>
        ))}
        {data.stocks.length > 3 && (
          <div className="flex items-center px-2 py-1 text-xs text-text-secondary">
            +{data.stocks.length - 3}只
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
          <span className="text-xs text-text-secondary">
            {data.news.length}条相关资讯
          </span>
        </div>
        <span className="text-xs text-primary-light">查看详情 →</span>
      </div>
    </div>
  );
}
