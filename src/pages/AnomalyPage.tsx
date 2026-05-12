import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { dataService } from '@/services/dataService';
import { Anomaly } from '@/services/mockData';
import { AnomalyType } from '@/utils/constants';
import Header from '@/components/layout/Header';
import AnomalyCard from '@/components/anomaly/AnomalyCard';
import AnomalyDetail from '@/components/anomaly/AnomalyDetail';
import AnomalyTabs from '@/components/anomaly/AnomalyTabs';

export default function AnomalyPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AnomalyType | 'all'>('all');
  const { selectedAnomalyId, setSelectedAnomaly } = useAppStore();

  const fetchAnomalies = async () => {
    const data = await dataService.getAnomalies();
    setAnomalies(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnomalies();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAnomalies = activeTab === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.type === activeTab);

  const selectedAnomaly = anomalies.find(a => a.id === selectedAnomalyId);

  return (
    <div className="flex flex-col h-full bg-bg-dark safe-area-inset">
      <Header title="异动情报" showSearch={false} />

      <div className="flex-none">
        <AnomalyTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">加载中...</span>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">实时异动</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  捕捉盘面异动 · {filteredAnomalies.length}条异动
                </p>
              </div>
              <button 
                onClick={handleRefresh}
                className={`p-2 rounded-full bg-bg-card active:bg-white/10 transition-colors ${
                  refreshing ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw size={16} className="text-text-secondary" />
              </button>
            </div>

            {filteredAnomalies.map((anomaly) => (
              <AnomalyCard
                key={anomaly.id}
                data={anomaly}
                onClick={() => setSelectedAnomaly(anomaly.id)}
              />
            ))}

            {filteredAnomalies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                <span className="text-4xl mb-3">📊</span>
                <span className="text-sm">暂无异动数据</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAnomaly && (
        <AnomalyDetail
          data={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
        />
      )}
    </div>
  );
}
