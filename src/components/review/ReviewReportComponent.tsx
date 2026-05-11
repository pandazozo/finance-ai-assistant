import { TrendingUp, TrendingDown, Flame, ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { ReviewReport } from '@/services/mockData';
import { formatChange } from '@/utils/format';
import ReviewSection from '@/components/review/ReviewSection';

interface ReviewReportProps {
  data: ReviewReport;
}

export default function ReviewReportComponent({ data }: ReviewReportProps) {
  return (
    <div className="space-y-4">
      <ReviewSection title="市场总览" icon={<TrendingUp size={16} className="text-primary-light" />}>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {data.indices.map((index) => (
            <div key={index.name} className="p-3 rounded-xl bg-bg-dark/50">
              <div className="text-xs text-text-secondary mb-1">{index.name}</div>
              <div className="text-lg font-semibold text-text-primary">
                {index.value.toFixed(2)}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                index.change >= 0 ? 'text-up' : 'text-down'
              }`}>
                {index.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {formatChange(index.change)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-up font-medium">{data.indices[0].change > 0 ? '↑' : '↓'}</span>
              <span className="text-text-secondary">涨停：85家</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-down font-medium">↓</span>
              <span className="text-text-secondary">跌停：12家</span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary/60">
          <span>成交量：8234亿</span>
          <span>·</span>
          <span>北向资金：+52.3亿</span>
        </div>
      </ReviewSection>

      <ReviewSection title="今日热点" icon={<Flame size={16} className="text-accent" />}>
        <div className="space-y-3">
          {data.hotSectors.map((sector, index) => (
            <div key={sector.name} className="p-3 rounded-xl bg-bg-dark/50 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-text-primary">{sector.name}</span>
                </div>
                <span className="text-sm font-semibold text-up">
                  {formatChange(sector.change)}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-2">{sector.driver}</p>
              <div className="flex flex-wrap gap-1">
                {sector.leaders.map((leader) => (
                  <span key={leader} className="px-2 py-0.5 rounded text-xs bg-bg-card text-text-secondary">
                    {leader}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ReviewSection>

      <ReviewSection title="明日展望" icon={<Lightbulb size={16} className="text-accent" />}>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-up" />
              <span className="text-sm font-medium text-up">潜在机会</span>
            </div>
            <ul className="space-y-2">
              {data.outlook.opportunities.map((opp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-up mt-0.5">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-accent" />
              <span className="text-sm font-medium text-accent">风险提示</span>
            </div>
            <ul className="space-y-2">
              {data.outlook.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ReviewSection>

      {data.portfolio.length > 0 && (
        <ReviewSection title="持仓复盘" icon={<TrendingUp size={16} className="text-primary-light" />}>
          <div className="space-y-3">
            {data.portfolio.map((item) => (
              <div key={item.stockCode} className="p-3 rounded-xl bg-bg-dark/50 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-mono">{item.stockCode}</span>
                    <span className="text-sm font-medium text-text-primary">{item.stockName}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.change >= 0 ? 'text-up' : 'text-down'}`}>
                    {formatChange(item.change)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{item.comment}</p>
              </div>
            ))}
          </div>
        </ReviewSection>
      )}
    </div>
  );
}
