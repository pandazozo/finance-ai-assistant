import { useAppStore } from '@/stores/useAppStore';
import TabBar from '@/components/layout/TabBar';
import HomePage from '@/pages/HomePage';
import AnomalyPage from '@/pages/AnomalyPage';
import ReviewPage from '@/pages/ReviewPage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
  const { activeTab } = useAppStore();

  const renderPage = () => {
    switch (activeTab) {
      case 'opportunity':
        return <HomePage />;
      case 'anomaly':
        return <AnomalyPage />;
      case 'review':
        return <ReviewPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-dark">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          {renderPage()}
        </div>
        <TabBar />
      </div>
    </div>
  );
}
