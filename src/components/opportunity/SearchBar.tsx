import { useState } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { dataService } from '@/services/dataService';

interface SearchBarProps {
  onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchHistory, addSearchHistory, clearSearchHistory, addToWatchList } = useAppStore();

  const handleSearch = async (value: string) => {
    setKeyword(value);
    if (value.trim().length > 0) {
      setLoading(true);
      const res = await dataService.searchStocks(value);
      setResults(res);
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleSelectStock = (stock: { code: string; name: string }) => {
    addSearchHistory(keyword);
    addToWatchList({ ...stock, price: 0, change: 0 });
    setKeyword('');
    setResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-dark">
      <div className="sticky top-0 z-10 bg-bg-dark border-b border-white/5">
        <div className="flex items-center gap-3 p-4 safe-area-top">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bg-card border border-white/10">
            <Search size={18} className="text-text-secondary flex-shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索股票名称/代码"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 outline-none"
              autoFocus
            />
            {keyword && (
              <button onClick={() => handleSearch('')} className="text-text-secondary">
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-sm text-text-secondary active:text-text-primary"
          >
            取消
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
        {!keyword && searchHistory.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock size={14} />
                <span>搜索历史</span>
              </div>
              <button 
                onClick={clearSearchHistory}
                className="text-xs text-text-secondary/60"
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(keyword)}
                  className="px-3 py-1.5 rounded-full bg-bg-card text-sm text-text-secondary border border-white/5"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {!keyword && (
          <div>
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
              <TrendingUp size={14} />
              <span>热门搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['AI芯片', '新能源汽车', '创新药', '低空经济', '存储芯片'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleSearch(keyword)}
                  className="px-3 py-1.5 rounded-full bg-primary-light/10 text-sm text-primary-light border border-primary-light/20"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {keyword && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-card border border-white/5 active:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary font-mono w-16">{stock.code}</span>
                      <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                    </div>
                    <span className="text-xs text-primary-light">+加入自选</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                未找到相关股票
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
