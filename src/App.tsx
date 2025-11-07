import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Peminjaman } from './components/Peminjaman';
import { Pengembalian } from './components/Pengembalian';
import { ELKM } from './components/ELKM';
import { Inventaris } from './components/Inventaris';
import { Jurnal } from './components/Jurnal';
import { Teamwork } from './components/Teamwork';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user && (currentTab === 'inventaris' || currentTab === 'jurnal')) {
    return <Login />;
  }

  const handleTabChange = (tab: string) => {
    if ((tab === 'inventaris' || tab === 'jurnal') && !user) {
      return;
    }
    setCurrentTab(tab);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onNavigate={handleTabChange} />;
      case 'pinjam':
        return <Peminjaman />;
      case 'kembali':
        return <Pengembalian />;
      case 'elkm':
        return <ELKM />;
      case 'inventaris':
        return <Inventaris />;
      case 'jurnal':
        return <Jurnal />;
      case 'teamwork':
        return <Teamwork />;
      default:
        return <Home onNavigate={handleTabChange} />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <Layout currentTab={currentTab} onTabChange={handleTabChange}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
