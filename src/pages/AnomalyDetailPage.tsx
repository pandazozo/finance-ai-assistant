import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Newspaper, AlertCircle, ExternalLink } from 'lucide-react';
import { Anomaly } from '@/services/mockData';
import { dataService } from '@/services/dataService';
import { formatChange } from '@/utils/format';

export default function AnomalyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const anomalies = await dataService.getAnomalies();
        const found = anomalies.find(a => a.id === id);
        setData(found || null);
      } catch (e) {
        console.error('Failed to fetch anomaly', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStockClick = () => {
    if (data) {
      navigate(`/stock/${data.stockCode}`);
    }
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
          <p className="text-text-secondary">未找到该异动</p>
        </div>
      </div>
    );
  }

  const isUp = data.change > 0;

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
            <h1 className="text-lg font-bold text-text-primary">异动详情</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          <div className={`p-4 rounded-xl ${isUp ? 'bg-up/5 border border-up/20' : 'bg-down/5 border border-down/20'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isUp ? 'bg-up/10' : 'bg-down/10'
              }`}>
                {isUp ? (
                  <TrendingUp size={24} className="text-up" />
                ) : (
                  <TrendingDown size={24} className="text-down" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{data.stockName}</h2>
                <span className="text-xs text-text-secondary font-mono">{data.stockCode}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">异动涨跌幅</span>
              <span className={`text-3xl font-bold ${isUp ? 'text-up' : 'text-down'}`}>
                {formatChange(data.change)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-text-secondary/60">
              <Clock size={12} />
              <span className="text-xs">异动时间：{data.time}</span>
            </div>
          </div>

          {data.aiInsight && (
            <section className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-accent mb-3">
                <AlertCircle size={16} />
                AI智能解读
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {data.aiInsight}
              </p>
            </section>
          )}

          {data.news && data.news.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <Newspaper size={16} />
                相关资讯
                <span className="px-1.5 py-0.5 rounded bg-primary-light/20 text-primary-light text-xs">
                  {data.news.length}条
                </span>
              </h3>
              <div className="space-y-2">
                {data.news.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-bg-card border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary-light">{item.source}</span>
                      <span className="text-xs text-text-secondary/60">·</span>
                      <span className="text-xs text-text-secondary/60">{item.time}</span>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mb-1">{item.title}</h4>
                    {item.summary && (
                      <p className="text-xs text-text-secondary leading-relaxed">{item.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <button
              onClick={handleStockClick}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-primary text-white active:bg-primary/90"
            >
              <span className="font-medium">查看 {data.stockName} 详情</span>
              <ExternalLink size={18} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
