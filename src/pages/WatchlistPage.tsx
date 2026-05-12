import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchList, useAlertConfig, StockItem } from '@/stores';
import { api, StockQuote } from '@/services/api';

interface SearchResult {
  code: string;
  name: string;
  market: string;
}

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { stocks, addStock, removeStock } = useWatchList();
  const { threshold, enabled } = useAlertConfig();
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = useCallback(async () => {
    if (stocks.length === 0) return;
    try {
      const codes = stocks.map(s => s.code);
      const res = await api.getQuote(codes);
      if (res.code === 0 && res.data.quotes) {
        const quoteMap: Record<string, StockQuote> = {};
        res.data.quotes.forEach((q: StockQuote) => {
          quoteMap[q.code] = q;
        });
        setQuotes(quoteMap);
      }
    } catch (err) {
      console.error('获取行情失败:', err);
    }
  }, [stocks]);

  const searchStocks = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.searchStocks(keyword);
      if (res.code === 0 && res.data.stocks) {
        setSearchResults(res.data.stocks);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStocks(searchKeyword);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchKeyword]);

  const handleAddStock = (code: string, name: string) => {
    addStock(code, name);
    setSearchKeyword('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleRemoveStock = (code: string) => {
    removeStock(code);
  };

  const handleStockClick = (code: string) => {
    navigate(`/stock/${code}`);
  };

  const getAlertStatus = (quote: StockQuote | undefined) => {
    if (!quote || !enabled) return null;
    return Math.abs(quote.changePercent) >= threshold;
  };

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-text-primary">我的自选</h1>
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-full bg-primary text-white"
          >
            <Plus size={20} />
          </button>
        </div>

        {showSearch && (
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索股票代码或名称"
                className="w-full pl-10 pr-4 py-2 bg-bg-card rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-bg-card rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => handleAddStock(stock.code, stock.name)}
                    className="w-full px-4 py-3 flex items-center justify-between border-b border-border last:border-b-0 hover:bg-bg-hover text-left"
                  >
                    <div>
                      <span className="font-medium text-text-primary">{stock.name}</span>
                      <span className="ml-2 text-sm text-text-secondary">{stock.code}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{stock.market}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchKeyword('');
                setSearchResults([]);
              }}
              className="mt-2 text-sm text-text-secondary hover:text-text-primary"
            >
              取消
            </button>
          </div>
        )}

        {stocks.length === 0 && !showSearch && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-card flex items-center justify-center">
              <TrendingUp className="text-text-secondary" size={32} />
            </div>
            <p className="text-text-secondary mb-4">暂无自选股</p>
            <button
              onClick={() => setShowSearch(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              添加自选
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {stocks.map((stock) => {
          const quote = quotes[stock.code];
          const hasAlert = getAlertStatus(quote);

          return (
            <div
              key={stock.code}
              onClick={() => handleStockClick(stock.code)}
              className="p-4 border-b border-border cursor-pointer hover:bg-bg-hover active:bg-bg-card"
            >
              {hasAlert && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="text-red-500" size={16} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{stock.name}</span>
                    <span className="text-sm text-text-secondary">{stock.code}</span>
                  </div>
                  {quote ? (
                    <div className="mt-1">
                      <span className="text-lg font-bold text-text-primary">
                        {quote.price.toFixed(2)}
                      </span>
                      <span className={`ml-2 text-sm font-medium flex items-center inline-flex gap-1 ${quote.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {quote.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-text-secondary">加载中...</div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStock(stock.code);
                  }}
                  className="p-2 text-text-secondary hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {stocks.length > 0 && (
        <div className="flex-none p-3 text-xs text-text-secondary text-center bg-bg-card border-t border-border">
          异动提醒阈值：{threshold}% · {enabled ? '已开启' : '已关闭'}
        </div>
      )}
    </div>
  );
}
