import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Target, Clock, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BacktestResult {
  strategyId: string;
  period: string;
  totalReturn: number;
  benchmarkReturn: number;
  maxDrawdown: number;
  winRate: number;
  sharpeRatio: number;
  trades: Array<{
    stockCode: string;
    stockName: string;
    buyDate: string;
    buyPrice: number;
    sellDate: string;
    sellPrice: number;
    return: number;
  }>;
  metricsType: string;
  dataWarning?: string;
}

interface BacktestChartProps {
  result: BacktestResult;
}

export default function BacktestResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ruleId = params.get('ruleId');
    const stockCode = params.get('stockCode') || '600519';
    const period = params.get('period') || '1Y';

    if (!ruleId) {
      alert('缺少规则ID');
      navigate(-1);
      return;
    }

    const fetchBacktest = async () => {
      try {
        const response = await fetch('/api/v3/backtest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruleId, stockCode, period })
        });
        const data = await response.json();
        if (data.code === 0) {
          setResult(data.data);
        }
      } catch (error) {
        console.error('获取回测结果失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBacktest();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-text-secondary">加载回测结果...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <div className="text-red-500">获取回测结果失败</div>
      </div>
    );
  }

  const getReturnColor = (value: number) => value >= 0 ? 'text-red-500' : 'text-green-500';
  const getReturnBgColor = (value: number) => value >= 0 ? 'bg-red-500/10' : 'bg-green-500/10';

  const chartData = {
    labels: ['策略收益', '基准收益'],
    datasets: [
      {
        label: '收益率对比 (%)',
        data: [result.totalReturn, result.benchmarkReturn],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      },
      title: {
        display: true,
        text: '策略 vs 基准收益对比',
        color: '#F3F4F6'
      }
    },
    scales: {
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary">
      <div className="border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-card rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">回测结果</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {result.dataWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-500">提示</div>
              <div className="text-sm text-text-secondary">{result.dataWarning}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              {result.totalReturn >= 0 ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
              <span className="text-sm text-text-secondary">总收益率</span>
            </div>
            <div className={`text-2xl font-bold ${getReturnColor(result.totalReturn)}`}>
              {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
            </div>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-text-secondary">基准收益</span>
            </div>
            <div className={`text-2xl font-bold ${getReturnColor(result.benchmarkReturn)}`}>
              {result.benchmarkReturn >= 0 ? '+' : ''}{result.benchmarkReturn.toFixed(2)}%
            </div>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-text-secondary">胜率</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {result.winRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-text-secondary">夏普比率</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {result.sharpeRatio.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">收益对比图</h2>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {result.maxDrawdown !== 0 && (
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">最大回撤</span>
              <span className="text-lg font-bold text-red-500">
                {result.maxDrawdown.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-bg-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${Math.min(Math.abs(result.maxDrawdown), 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">交易记录</h2>
          {result.trades && result.trades.length > 0 ? (
            <div className="space-y-3">
              {result.trades.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-bg-dark rounded-lg">
                  <div>
                    <div className="font-medium">{trade.stockName}</div>
                    <div className="text-sm text-text-secondary">
                      {trade.buyDate} → {trade.sellDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getReturnColor(trade.return)}`}>
                      {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(2)}%
                    </div>
                    <div className="text-sm text-text-secondary">
                      ¥{trade.buyPrice} → ¥{trade.sellPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-text-secondary py-8">
              暂无交易记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
