import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { api, StockQuote, AIConclusion, RiskPreference } from '@/services/api';
import { useRiskPreference } from '@/stores';

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { config: riskConfig } = useRiskPreference();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [conclusion, setConclusion] = useState<AIConclusion | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col h-full bg-bg-dark">
      <div className="flex items-center p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="text-text-primary" size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-text-primary">{quote?.name || code}</h1>
          <span className="text-sm text-text-secondary">{code}</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
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

        <div className="bg-bg-card rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-3">风险提示</div>
          <p className="text-sm text-text-secondary">
            本产品仅供投资参考，不构成任何投资建议。投资者据此操作，风险自担。
            AI分析结果可能存在误差，仅供参考。
          </p>
        </div>
      </div>

      <div className="p-4 bg-bg-card border-t border-border">
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
