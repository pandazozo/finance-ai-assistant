import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Flame, Clock, Plus, ExternalLink } from 'lucide-react';
import { Opportunity } from '@/services/mockData';
import { dataService } from '@/services/dataService';
import { formatChange } from '@/utils/format';
import { useAppStore } from '@/stores/useAppStore';
import NewsItem from '@/components/common/NewsItem';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToWatchList, isInWatchList } = useAppStore();
  const [data, setData] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const opportunities = await dataService.getOpportunities();
        const found = opportunities.find(o => o.id === id);
        setData(found || null);
      } catch (e) {
        console.error('Failed to fetch opportunity', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToWatchList = (stock: { code: string; name: string; change: number }) => {
    if (!isInWatchList(stock.code)) {
      addToWatchList({ ...stock, price: 0 });
    }
  };

  const handleStockClick = (code: string) => {
    navigate(`/stock/${code}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-bg-dark">
        <div className="flex-none p-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full bg-bg-dark">
        <div className="flex-none p-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">未找到该机会</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-bg-card"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-text-primary">机会详情</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-up/10">
                <Flame size={14} className="text-up" />
                <span className="text-sm font-semibold text-up">{data.heatIndex}</span>
              </div>
              <div className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: Math.floor(data.score) }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-text-secondary/60">
              <Clock size={12} />
              <span className="text-xs">{data.updatedAt}</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">{data.topic}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{data.topicDescription}</p>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <span className="w-1 h-4 rounded-full bg-primary-light" />
              驱动逻辑
            </h3>
            <div className="space-y-2">
              {data.drivers.map((driver, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-xl bg-bg-card border border-white/5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-light/20 text-primary-light text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm text-text-secondary">{driver}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <span className="w-1 h-4 rounded-full bg-accent" />
              关联个股
            </h3>
            <div className="space-y-2">
              {data.stocks.map((stock) => (
                <div 
                  key={stock.code}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-white/5"
                >
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => handleStockClick(stock.code)}
                  >
                    <div>
                      <span className="text-xs text-text-secondary font-mono block">{stock.code}</span>
                      <span className="text-sm font-medium text-text-primary">{stock.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-text-secondary">相关度</span>
                      <span className="text-sm font-medium text-primary-light ml-1">
                        {(stock.relevance * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatChange(stock.change)}
                    </span>
                    <button
                      onClick={() => handleAddToWatchList(stock)}
                      className={`p-2 rounded-lg transition-colors ${
                        isInWatchList(stock.code)
                          ? 'bg-primary-light/20 text-primary-light'
                          : 'bg-bg-dark text-text-secondary active:bg-white/10'
                      }`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <span className="w-1 h-4 rounded-full bg-up" />
              相关资讯
            </h3>
            <div className="space-y-2">
              {data.news.map((news) => (
                <NewsItem key={news.id} {...news} />
              ))}
            </div>
          </section>

          <section className="p-4 rounded-xl bg-accent/10 border border-accent/20">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-accent mb-2">
              💡 AI参考建议
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              建议关注{data.topic}板块的持续性，注意控制仓位。该题材短期热度较高，追高需谨慎，建议逢低布局核心标的。
            </p>
          </section>

          {data.stocks.length > 0 && (
            <section>
              <button
                onClick={() => handleStockClick(data.stocks[0].code)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-primary text-white active:bg-primary/90"
              >
                <span className="font-medium">查看 {data.stocks[0].name} 详情</span>
                <ExternalLink size={18} />
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
