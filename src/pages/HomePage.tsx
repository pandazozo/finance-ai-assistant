import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { dataService } from '@/services/dataService';
import { Opportunity } from '@/services/mockData';
import Header from '@/components/layout/Header';
import OpportunityCard from '@/components/opportunity/OpportunityCard';
import OpportunityDetail from '@/components/opportunity/OpportunityDetail';
import SearchBar from '@/components/opportunity/SearchBar';

export default function HomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { selectedOpportunityId, setSelectedOpportunity } = useAppStore();

  const fetchOpportunities = async () => {
    const data = await dataService.getOpportunities();
    setOpportunities(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOpportunities();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedOpportunity = opportunities.find(o => o.id === selectedOpportunityId);

  return (
    <div className="h-full flex flex-col bg-bg-dark">
      <Header 
        title="今日机会"
        onSearchClick={() => setShowSearch(true)}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">加载中...</span>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">投资机会</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  基于实时资讯AI挖掘 · {opportunities.length}条机会
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

            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                data={opp}
                onClick={() => setSelectedOpportunity(opp.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
      
      {selectedOpportunity && (
        <OpportunityDetail
          data={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}
