import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertTriangle, Sparkles, RefreshCw, Newspaper } from 'lucide-react';
import { api, StockQuote, AIConclusion, RiskPreference } from '@/services/api';
import { llmService, AnalysisResponse } from '@/services/llmService';
import { newsService, NewsItem } from '@/services/newsService';
import { useRiskPreference } from '@/stores';

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { config: riskConfig } = useRiskPreference();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [conclusion, setConclusion] = useState<AIConclusion | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse['data'] | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return;
      setLoading(true);
      try {
        const quoteRes = await api.getQuote([code]);
        if (quoteRes.code === 0 && quoteRes.data.quotes?.[0]) {
          setQuote(quoteRes.data.quotes[0]);
        }

        const conclusionRes = await api.getAIConclusion(code, riskConfig);
        if (conclusionRes.code === 0 && conclusionRes.data) {
          setConclusion(conclusionRes.data.conclusion);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, riskConfig]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!code) return;
      setNewsLoading(true);
      try {
        const res = await newsService.getNews(code, 10);
        if (res.code === 0) {
          setNews(res.data.news);
        }
      } catch (err) {
        console.error('获取资讯失败:', err);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [code]);

  const handleGetAnalysis = async () => {
    if (!code || analysisLoading) return;
    setAnalysisLoading(true);
    try {
      const res = await llmService.getAnalysis(code, riskConfig, false);
      if (res.code === 0) {
        setAnalysis(res.data);
      }
    } catch (err) {
      console.error('获取AI分析失败:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getConclusionColor = (label: string) => {
    switch (label) {
      case '强烈推荐': return 'text-red-500 bg-red-500/10';
      case '推荐': return 'text-orange-500 bg-orange-500/10';
      case '中性': return 'text-yellow-500 bg-yellow-500/10';
      case '谨慎': return 'text-blue-500 bg-blue-500/10';
      case '回避': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const handleJump = () => {
    window.location.href = 'weixin://';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-dark">
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <div className="flex-none flex items-center p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="text-text-primary" size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-text-primary">{quote?.name || code}</h1>
          <span className="text-sm text-text-secondary">{code}</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
        {quote && (
          <div className="bg-bg-card rounded-lg p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">
                {quote.price.toFixed(2)}
              </span>
              <span className={`text-lg font-medium ${quote.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}
              </span>
              <span className={`text-lg font-medium ${quote.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                ({quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
              <div>
                <div className="text-text-secondary">开盘</div>
                <div className="text-text-primary">{quote.open.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-secondary">最高</div>
                <div className="text-text-primary">{quote.high.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-secondary">最低</div>
                <div className="text-text-primary">{quote.low.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-secondary">昨收</div>
                <div className="text-text-primary">{quote.prevClose.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {conclusion && (
          <div className="bg-bg-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-text-primary">AI决策结论</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConclusionColor(conclusion.label)}`}>
                {conclusion.label}
              </span>
            </div>
            <div className="mb-3">
              <div className="text-sm text-text-secondary mb-1">综合评分</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${conclusion.score}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-primary">{conclusion.score}</span>
              </div>
            </div>
            <p className="text-text-primary mb-3">{conclusion.explanation}</p>

            {conclusion.signals && conclusion.signals.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-text-secondary mb-2">关键信号</div>
                <div className="space-y-2">
                  {conclusion.signals.map((signal, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <span className="text-text-primary">{signal.signal}</span>
                      <span className="text-sm text-primary">+{signal.score}分</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conclusion.riskTips && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-yellow-500">{conclusion.riskTips}</p>
              </div>
            )}
          </div>
        )}

        {analysis ? (
          <div className="bg-bg-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-text-primary">{llmService.getSourceLabel(analysis.source as 'llm' | 'rule_engine')}</h2>
              </div>
              {analysis.fallback && (
                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded">
                  规则分析
                </span>
              )}
            </div>
            <p className="text-text-primary whitespace-pre-wrap">{analysis.analysis}</p>
            {analysis.fallback && (
              <p className="text-sm text-text-secondary mt-3 italic">{analysis.message}</p>
            )}
            <div className="text-xs text-text-secondary mt-3">
              生成时间: {analysis.generatedAt}
            </div>
          </div>
        ) : (
          <button
            onClick={handleGetAnalysis}
            disabled={analysisLoading}
            className="w-full bg-bg-card rounded-lg p-4 flex items-center justify-center gap-2 hover:bg-bg-card/80 disabled:opacity-50"
          >
            {analysisLoading ? (
              <>
                <RefreshCw className="animate-spin text-primary" size={20} />
                <span className="text-text-primary">AI分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="text-primary" size={20} />
                <span className="text-text-primary">获取AI深度分析</span>
              </>
            )}
          </button>
        )}

        {news.length > 0 && (
          <div className="bg-bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-text-primary">相关资讯</h2>
              <span className="text-sm text-text-secondary">({news.length})</span>
            </div>
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg ${newsService.getImpactBgColor(item.impactScore)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-text-primary text-sm font-medium flex-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.isImportant && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">
                          重要
                        </span>
                      )}
                      <span className={`text-sm font-medium ${newsService.getImpactColor(item.impactScore)}`}>
                        {newsService.formatImpactScore(item.impactScore)}
                      </span>
                    </div>
                  </div>
                  {item.breakdown && (
                    <div className="mt-2 flex gap-3 text-xs text-text-secondary">
                      <span>时效性: {item.breakdown.timeliness}</span>
                      <span>相关性: {item.breakdown.relevance}</span>
                      <span>权威性: {item.breakdown.authority}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {newsLoading && (
          <div className="bg-bg-card rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-3">资讯加载中...</div>
          </div>
        )}

        <div className="bg-bg-card rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-3">风险提示</div>
          <p className="text-sm text-text-secondary">
            本产品仅供投资参考，不构成任何投资建议。投资者据此操作，风险自担。
            AI分析结果可能存在误差，仅供参考。
          </p>
        </div>
      </div>

      <div className="fixed bottom-14 left-0 right-0 p-4 bg-bg-dark border-t border-border safe-area-inset-bottom">
        <button
          onClick={handleJump}
          className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <ExternalLink size={18} />
          跳转交易
        </button>
      </div>
    </div>
  );
}
