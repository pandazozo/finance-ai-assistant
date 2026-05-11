import { Newspaper } from 'lucide-react';

interface NewsItemProps {
  title: string;
  source: string;
  time: string;
  summary?: string;
  onClick?: () => void;
}

export default function NewsItem({ title, source, time, summary, onClick }: NewsItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl bg-bg-dark/50 border border-white/5 ${
        onClick ? 'cursor-pointer active:bg-white/5' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Newspaper size={12} className="text-primary-light" />
        <span className="text-xs text-text-secondary">{source}</span>
        <span className="text-xs text-text-secondary/60">·</span>
        <span className="text-xs text-text-secondary/60">{time}</span>
      </div>
      <h4 className="text-sm text-text-primary leading-snug mb-1">{title}</h4>
      {summary && (
        <p className="text-xs text-text-secondary/80 leading-relaxed line-clamp-2">{summary}</p>
      )}
    </div>
  );
}
