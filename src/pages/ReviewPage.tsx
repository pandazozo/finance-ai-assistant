import { useState, useEffect } from 'react';
import { Calendar, Share2, RefreshCw } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { ReviewReport } from '@/services/mockData';
import Header from '@/components/layout/Header';
import ReviewReportComponent from '@/components/review/ReviewReportComponent';

export default function ReviewPage() {
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = async () => {
    const data = await dataService.getReviewReport();
    setReport(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReport();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '今日复盘',
        text: '查看今日市场复盘报告',
        url: window.location.href,
      });
    }
  };

  const formatReportDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  };

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <Header 
        title="智能复盘" 
        showSearch={false}
        rightElement={
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className={`w-9 h-9 rounded-full bg-bg-card flex items-center justify-center active:bg-white/10 transition-colors ${
                refreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw size={16} className="text-text-secondary" />
            </button>
            <button 
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center active:bg-white/10"
            >
              <Share2 size={16} className="text-text-secondary" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">加载中...</span>
          </div>
        ) : report ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar size={16} />
                <span className="text-sm">{formatReportDate(report.date)}</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-primary-light/10 text-xs text-primary-light">
                AI生成
              </span>
            </div>
            
            <ReviewReportComponent data={report} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
            <span className="text-4xl mb-3">📋</span>
            <span className="text-sm">暂无复盘数据</span>
            <span className="text-xs text-text-secondary/60 mt-1">收盘后自动生成</span>
          </div>
        )}
      </div>
    </div>
  );
}
