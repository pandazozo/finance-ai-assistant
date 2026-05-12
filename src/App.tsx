import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDisclaimer } from '@/stores';
import TabBar from '@/components/layout/TabBar';
import HomePage from '@/pages/HomePage';
import WatchlistPage from '@/pages/WatchlistPage';
import StockDetailPage from '@/pages/StockDetailPage';
import SettingsPage from '@/pages/SettingsPage';
import AnomalyPage from '@/pages/AnomalyPage';
import OpportunityDetailPage from '@/pages/OpportunityDetailPage';
import AnomalyDetailPage from '@/pages/AnomalyDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import DisclaimerModal from '@/components/DisclaimerModal';

export default function App() {
  const { confirmed, confirm } = useDisclaimer();

  return (
    <BrowserRouter>
      <div className="h-screen w-screen overflow-hidden bg-bg-dark">
        {!confirmed && (
          <DisclaimerModal onConfirm={confirm} />
        )}
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/stock/:code" element={<StockDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/anomaly" element={<AnomalyPage />} />
              <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
              <Route path="/anomaly/:id" element={<AnomalyDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <TabBar />
        </div>
      </div>
    </BrowserRouter>
  );
}
