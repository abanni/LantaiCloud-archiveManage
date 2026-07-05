import React, { useState, useEffect } from 'react';
import { Sidebar, ViewState } from './components/Navigation';
import { IngestModule } from './views/IngestModule';
import { SearchModule } from './views/SearchModule';
import { UtilizationModule } from './views/UtilizationModule';
import { StatisticsModule } from './views/StatisticsModule';
import { Dashboard } from './views/Dashboard';
import { ArchiveManagement } from './views/ArchiveManagement';
import { ComprehensiveSearch } from './views/ComprehensiveSearch';
import { FullTextSearch } from './views/FullTextSearch';
import { Login } from './components/Login';
import UserSwitcher from './components/UserSwitcher';
import { User, SelectionItem } from './types';
import { MOCK_USERS } from './constants';

const DEMO_USER = MOCK_USERS[0]; // hjj - 管理科科长

const VIEW_HASH: Record<string, string> = {
  home: '/dashboard',
  ingest: '/ingest',
  comprehensive: '/search',
  fulltext: '/fulltext',
  utilize: '/utilize',
  archive_mgmt: '/archive-mgmt',
};
const HASH_VIEW: Record<string, string> = {};
for (const [k, v] of Object.entries(VIEW_HASH)) HASH_VIEW[v] = k;

const App: React.FC = () => {
  // Demo mode: auto-login as hjj
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USER);
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const hash = window.location.hash.replace('#', '');
    const view = HASH_VIEW[hash];
    return (view as ViewState) || ViewState.HOME;
  });

  // Sync hash when view changes
  useEffect(() => {
    const hash = VIEW_HASH[currentView] || '/dashboard';
    if (window.location.hash !== '#' + hash) {
      window.location.hash = hash;
    }
  }, [currentView]);

  // Listen for browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const view = HASH_VIEW[hash];
      if (view) setCurrentView(view as ViewState);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  
  // Global Selection Basket (Shopping Cart for Archives)
  const [basket, setBasket] = useState<SelectionItem[]>([]);

  // Effect to ensure user is not on a restricted page after role switch
  useEffect(() => {
    if (currentUser) {
      // If current view is not in user's permissions
      if (!currentUser.permissions.includes(currentView)) {
        // Redirect to the first available view for this user
        if (currentUser.permissions.length > 0) {
          setCurrentView(currentUser.permissions[0] as ViewState);
        }
      }
    }
  }, [currentUser, currentView]);

  // If not authenticated, show Login screen
  if (!currentUser) {
    return <Login onLogin={(user) => {
      setCurrentUser(user);
      // Set initial view based on permission
      if (user.permissions.length > 0) {
        setCurrentView(user.permissions[0] as ViewState);
      }
    }} />;
  }

  const renderContent = () => {
    // Safety check for rendering
    if (!currentUser.permissions.includes(currentView)) {
      return (
        <div className="flex h-screen items-center justify-center text-slate-500">
           <div className="text-center">
             <h3 className="text-lg font-medium">访问受限</h3>
             <p className="text-sm">当前角色 [{currentUser.department} - {currentUser.role}] 无权访问此模块。</p>
           </div>
        </div>
      );
    }

    switch (currentView) {
      case ViewState.HOME:
        return <Dashboard currentUser={currentUser} onChangeView={setCurrentView} />;
      case ViewState.INGEST:
        return <IngestModule />;
      case ViewState.COMPREHENSIVE:
        return <ComprehensiveSearch basket={basket} setBasket={setBasket} />;
      case ViewState.FULLTEXT:
        return <FullTextSearch basket={basket} setBasket={setBasket} />;
      case ViewState.UTILIZE:
        return (
          <UtilizationModule 
            basket={basket} 
            setBasket={setBasket}
          />
        );
      case ViewState.STATS:
        return <StatisticsModule />;
      case ViewState.ARCHIVE_MGMT:
        return <ArchiveManagement currentUser={currentUser} />;
      default:
        return <SearchModule basket={basket} setBasket={setBasket} onNavigateToUtilize={() => setCurrentView(ViewState.UTILIZE)} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
      />
      <main className="ml-[232px] flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-end px-6 bg-white border-b border-slate-200 flex-shrink-0">
          <UserSwitcher
            currentUser={currentUser}
            onSwitchUser={setCurrentUser}
            onLogout={() => setCurrentUser(null)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 pt-3 space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;