import { Search } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({ 
  title = '投资助手', 
  showSearch = true, 
  onSearchClick,
  rightElement 
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-bg-dark/95 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between h-14 px-4 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-light to-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {rightElement}
          {showSearch && (
            <button 
              onClick={onSearchClick}
              className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center active:bg-white/10 transition-colors"
            >
              <Search size={18} className="text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
