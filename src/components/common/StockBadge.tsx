import { formatChange } from '@/utils/format';

interface StockBadgeProps {
  code: string;
  name: string;
  change?: number;
  onClick?: () => void;
  showChange?: boolean;
}

export default function StockBadge({ code, name, change, onClick, showChange = true }: StockBadgeProps) {
  const isUp = change !== undefined ? change >= 0 : true;
  
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-dark/50 border border-white/10 ${
        onClick ? 'cursor-pointer active:bg-white/5' : ''
      }`}
    >
      <span className="text-[11px] text-text-secondary font-mono">{code}</span>
      <span className="text-sm text-text-primary font-medium">{name}</span>
      {showChange && change !== undefined && (
        <span className={`text-xs font-medium ${isUp ? 'text-up' : 'text-down'}`}>
          {formatChange(change)}
        </span>
      )}
    </div>
  );
}
