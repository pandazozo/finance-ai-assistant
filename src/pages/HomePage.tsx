import { useState, useEffect } from 'react';
import { RefreshCw, Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWatchList } from '@/stores';
import { api, StockQuote } from '@/services/api';

export default function HomePage() {
  const { stocks } = useWatchList();
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchQuotes = async () => {
    if (stocks.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const codes = stocks.map(s => s.code);
      const result = await api.getQuote(codes);
      if (result.code === 0 && result.data.quotes) {
        const quoteMap: Record<string, StockQuote> = {};
        result.data.quotes.forEach((q: StockQuote) => {
          quoteMap[q.code] = q;
        });
        setQuotes(quoteMap);
      }
    } catch (e) {
      console.error('Fetch quotes failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30 * 1000);
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div className="h-full flex flex-col bg-bg-dark">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-text-primary">今日市场</h1>
            <p className="text-xs text-text-secondary">实时行情 · 异动提醒</p>
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-2 rounded-full bg-bg-card transition-colors ${
              refreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">加载中...</span>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center">
              <TrendingUp className="text-text-secondary" size={32} />
            </div>
            <div className="text-center">
              <p className="text-text-secondary mb-2">暂无自选股</p>
              <p className="text-xs text-text-secondary">
                添加关注的股票开始使用
              </p>
            </div>
            <Link 
              to="/watchlist" 
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
            >
              添加自选
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">我的自选</h2>
              <Link to="/watchlist" className="text-xs text-primary flex items-center gap-1">
                管理 <ArrowRight size={12} />
              </Link>
            </div>
            
            {stocks.map((stock) => {
              const quote = quotes[stock.code];
              const change = quote?.change || 0;
              const changePct = quote?.changePercent || 0;
              const isPositive = change >= 0;

              return (
                <div 
                  key={stock.code}
                  onClick={() => navigate(`/stock/${stock.code}`)}
                  className="p-4 bg-bg-card rounded-xl border border-border cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-text-primary">
                      {quote?.name || stock.name}
                    </span>
                    <span className="text-xs text-text-secondary">{stock.code}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-text-primary">
                      {quote?.price ? quote.price.toFixed(2) : '--'}
                    </span>
                    <span className={`flex items-center gap-1 text-base font-medium ${
                      isPositive ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 pt-0">
          <div className="bg-bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp size={14} className="text-yellow-500" />
              </div>
              <span className="text-sm font-medium text-text-primary">快速操作</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/watchlist" 
                className="py-3 text-center bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                <Plus size={16} className="inline mr-1" />
                添加自选
              </Link>
              <Link 
                to="/settings" 
                className="py-3 text-center bg-bg-dark text-text-secondary rounded-lg text-sm font-medium border border-border"
              >
                设置
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
