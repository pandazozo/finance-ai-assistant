import { TrendingUp, TrendingDown, BarChart2, Calendar, Sparkles, Clock, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ReviewData {
  date: string;
  marketSummary: {
    upCount: number;
    downCount: number;
    flatCount: number;
    avgChange: number;
  };
  topGainers: Array<{
    code: string;
    name: string;
    change: number;
    price: number;
  }>;
  topLosers: Array<{
    code: string;
    name: string;
    change: number;
    price: number;
  }>;
  hotTopics: Array<{
    title: string;
    stocks: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  aiSummary: string;
  tradingSuggestions: string[];
}

const mockReviewData: ReviewData = {
  date: new Date().toLocaleDateString('zh-CN'),
  marketSummary: {
    upCount: 2156,
    downCount: 2342,
    flatCount: 482,
    avgChange: -0.23
  },
  topGainers: [
    { code: '600519', name: '贵州茅台', change: 3.52, price: 1856.00 },
    { code: '300750', name: '宁德时代', change: 2.85, price: 192.50 },
    { code: '601318', name: '中国平安', change: 2.34, price: 45.80 }
  ],
  topLosers: [
    { code: '300059', name: '东方财富', change: -3.21, price: 14.50 },
    { code: '000001', name: '平安银行', change: -2.56, price: 11.20 },
    { code: '600036', name: '招商银行', change: -2.12, price: 32.80 }
  ],
  hotTopics: [
    {
      title: '新能源汽车销量超预期',
      stocks: ['宁德时代', '比亚迪', '亿纬锂能'],
      sentiment: 'positive'
    },
    {
      title: '白酒板块持续反弹',
      stocks: ['贵州茅台', '五粮液', '泸州老窖'],
      sentiment: 'positive'
    },
    {
      title: '银行板块整体回调',
      stocks: ['招商银行', '平安银行', '兴业银行'],
      sentiment: 'negative'
    }
  ],
  aiSummary: '今日市场整体呈现震荡格局，沪深两市涨跌互现。新能源汽车和白酒板块表现强势，银行板块出现回调。建议投资者关注业绩确定性强的蓝筹股，控制仓位，保持谨慎乐观。',
  tradingSuggestions: [
    '关注新能源汽车产业链的投资机会',
    '白酒板块可适当配置防御性仓位',
    '银行板块短期观望为主',
    '建议整体仓位控制在60%以内'
  ]
};

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReviewData(mockReviewData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
        <div className="flex-none p-4 border-b border-border">
          <h1 className="text-lg font-bold text-text-primary">智能复盘</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">AI正在分析市场数据...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewData) return null;

  const { marketSummary, topGainers, topLosers, hotTopics, aiSummary, tradingSuggestions } = reviewData;

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">智能复盘</h1>
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <Calendar size={14} />
            <span>{reviewData.date}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={16} className="text-primary-light" />
              <h3 className="text-sm font-semibold text-text-primary">市场概览</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-bg-dark/50">
                <div className="text-lg font-bold text-up">{marketSummary.upCount}</div>
                <div className="text-xs text-text-secondary">上涨</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-bg-dark/50">
                <div className="text-lg font-bold text-down">{marketSummary.downCount}</div>
                <div className="text-xs text-text-secondary">下跌</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-bg-dark/50">
                <div className="text-lg font-bold text-text-primary">{marketSummary.flatCount}</div>
                <div className="text-xs text-text-secondary">平盘</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-bg-dark/50">
                <div className={`text-lg font-bold ${marketSummary.avgChange >= 0 ? 'text-up' : 'text-down'}`}>
                  {marketSummary.avgChange >= 0 ? '+' : ''}{marketSummary.avgChange}%
                </div>
                <div className="text-xs text-text-secondary">平均</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary-light" />
              <h3 className="text-sm font-semibold text-text-primary">AI 复盘总结</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{aiSummary}</p>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-up" />
              <h3 className="text-sm font-semibold text-text-primary">今日涨幅榜</h3>
            </div>
            <div className="space-y-2">
              {topGainers.map((stock, index) => (
                <Link
                  key={stock.code}
                  to={`/stock/${stock.code}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-dark/50 hover:bg-bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-up/20 flex items-center justify-center text-xs font-bold text-up">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{stock.name}</div>
                      <div className="text-xs text-text-secondary">{stock.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-up">+{stock.change}%</div>
                    <div className="text-xs text-text-secondary">¥{stock.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-down" />
              <h3 className="text-sm font-semibold text-text-primary">今日跌幅榜</h3>
            </div>
            <div className="space-y-2">
              {topLosers.map((stock, index) => (
                <Link
                  key={stock.code}
                  to={`/stock/${stock.code}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-dark/50 hover:bg-bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-down/20 flex items-center justify-center text-xs font-bold text-down">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{stock.name}</div>
                      <div className="text-xs text-text-secondary">{stock.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-down">{stock.change}%</div>
                    <div className="text-xs text-text-secondary">¥{stock.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">热点话题</h3>
            </div>
            <div className="space-y-3">
              {hotTopics.map((topic, index) => (
                <div key={index} className="p-3 rounded-lg bg-bg-dark/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{topic.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      topic.sentiment === 'positive' 
                        ? 'bg-up/20 text-up' 
                        : topic.sentiment === 'negative' 
                          ? 'bg-down/20 text-down' 
                          : 'bg-text-secondary/20 text-text-secondary'
                    }`}>
                      {topic.sentiment === 'positive' ? '利好' : topic.sentiment === 'negative' ? '利空' : '中性'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {topic.stocks.map((stock, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-bg-dark text-text-secondary">
                        {stock}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-card border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight size={16} className="text-primary-light" />
              <h3 className="text-sm font-semibold text-text-primary">交易建议</h3>
            </div>
            <div className="space-y-2">
              {tradingSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 flex-shrink-0"></div>
                  <p className="text-sm text-text-secondary leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
