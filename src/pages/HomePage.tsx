import { useState, useEffect } from 'react';
import { RefreshCw, Plus, TrendingUp, TrendingDown, ArrowRight, Flame, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWatchList } from '@/stores';
import { api, StockQuote } from '@/services/api';
import { dataService } from '@/services/dataService';
import { Opportunity } from '@/services/mockData';
import OpportunityCard from '@/components/opportunity/OpportunityCard';

export default function HomePage() {
  const { stocks } = useWatchList();
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
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

  const fetchOpportunities = async () => {
    try {
      const data = await dataService.getOpportunities();
      setOpportunities(data);
    } catch (e) {
      console.error('Fetch opportunities failed', e);
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQuotes(), fetchOpportunities()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchQuotes();
    fetchOpportunities();
    const interval = setInterval(() => {
      fetchQuotes();
      fetchOpportunities();
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
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

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">市场热点</h2>
            <Link to="/anomaly" className="text-xs text-primary flex items-center gap-1">
              <Zap size={12} />
              异动监控 <ArrowRight size={12} />
            </Link>
          </div>
          
          {opportunitiesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
          ) : opportunities.length > 0 ? (
            <div className="space-y-3">
              {opportunities.slice(0, 3).map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  data={opp}
                />
              ))}
              {opportunities.length > 3 && (
                <Link 
                  to="/anomaly"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-bg-card border border-border text-sm text-text-secondary hover:text-primary"
                >
                  查看更多热点
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-bg-card border border-border text-center">
              <Flame size={24} className="mx-auto mb-2 text-text-secondary opacity-50" />
              <p className="text-sm text-text-secondary">暂无市场热点</p>
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">我的自选</h2>
            <Link to="/watchlist" className="text-xs text-primary flex items-center gap-1">
              管理 <ArrowRight size={12} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-secondary">加载中...</span>
            </div>
          ) : stocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 p-4 rounded-xl bg-bg-card border border-border">
              <TrendingUp className="text-text-secondary opacity-50" size={32} />
              <div className="text-center">
                <p className="text-text-secondary mb-2">暂无自选股</p>
                <p className="text-xs text-text-secondary">
                  从上方热点中添加，或搜索添加
                </p>
              </div>
              <Link 
                to="/watchlist" 
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
              >
                <Plus size={16} className="inline mr-1" />
                添加自选
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stocks.map((stock) => {
                const quote = quotes[stock.code];
                const change = quote?.change || 0;
                const changePct = quote?.changePercent || 0;
                const isPositive = change >= 0;

                return (
                  <div 
                    key={stock.code}
                    onClick={() => navigate(`/stock/${stock.code}`)}
                    className="p-4 bg-bg-card rounded-xl border border-border cursor-pointer hover:bg-bg-hover active:bg-bg-card"
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
        </div>

        <div className="px-4">
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
