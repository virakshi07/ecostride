import React, { useState } from 'react';
import { initializeState, api } from './api';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import Insights from './pages/Insights';
import Community from './pages/Community';
import ProfileRewards from './pages/ProfileRewards';
import Toast from './components/Toast';
import { LayoutDashboard, PlusCircle, Sparkles, Trophy, User, Flame, Coins, Menu, X } from 'lucide-react';

type Screen = 'dashboard' | 'log' | 'insights' | 'community' | 'profile';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  
  // Initialize state once before rendering
  const [coins, setCoins] = useState(() => {
    initializeState();
    return api.getEcoCoins();
  });
  const [streak, setStreak] = useState(() => api.getStreak());
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', subMessage: '' });

  // Sidebar toggle for smaller desktop/tablet views
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation helper to switch screens and sync coins/streak
  const navigateTo = (screen: Screen) => {
    setActiveScreen(screen);
    setCoins(api.getEcoCoins());
    setStreak(api.getStreak());
    setIsSidebarOpen(false);
  };

  const handleActivityLogged = (message: string, subMessage: string) => {
    setToast({ show: true, message, subMessage });
    
    // Refresh header coins and streak immediately
    setCoins(api.getEcoCoins());
    setStreak(api.getStreak());
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        // Adding a key based on coins ensures the Dashboard re-mounts and fetches fresh data 
        // if the user logs an activity and returns.
        return <Dashboard key={coins} />;
      case 'log':
        return <LogActivity onActivityLogged={handleActivityLogged} />;
      case 'insights':
        return <Insights />;
      case 'community':
        return <Community />;
      case 'profile':
        return <ProfileRewards />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'log', label: 'Log Activity', icon: <PlusCircle className="h-5 w-5" /> },
    { id: 'insights', label: 'AI Coach', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'community', label: 'Community', icon: <Trophy className="h-5 w-5" /> },
    { id: 'profile', label: 'Rewards', icon: <User className="h-5 w-5" /> }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
      
      {/* 1. Mobile & Tablet Header */}
      <header className="md:hidden sidebar-gradient text-white px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🏃‍♂️</span>
          <h1 className="text-lg font-black tracking-tight uppercase">EcoStride</h1>
        </div>
        
        {/* Mobile Stats & Hamburger */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-amber-400">
            <Coins className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{coins}</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-orange-400">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{streak}d</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
            aria-label="Toggle Navigation menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* 2. Desktop Navigation Sidebar */}
      <aside className={`fixed inset-y-0 left-0 sidebar-gradient text-slate-300 w-64 p-6 flex flex-col justify-between transition-transform duration-300 z-50 shadow-2xl md:shadow-none md:translate-x-0 md:sticky md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="space-y-8">
          {/* Logo & Close for Mobile */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏃‍♂️</span>
              <h1 className="text-xl font-black tracking-wider text-white uppercase">EcoStride</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation Link List */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map(item => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-brand-green text-white shadow-md shadow-emerald-900/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom Footer Info */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          {/* Streak Indicator */}
          <div className="flex items-center justify-between bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">Daily Log Streak</span>
            </div>
            <span className="text-sm font-black text-orange-400">{streak} Days</span>
          </div>

          {/* Eco-Coins Balance */}
          <div className="flex items-center justify-between bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Eco-Coins Balance</span>
            </div>
            <span className="text-sm font-black text-amber-400">{coins} Coins</span>
          </div>
        </div>

      </aside>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Topbar: Desktop Header Banner */}
        <header className="hidden md:flex justify-between items-center bg-white px-8 py-5 border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <span className="inline-flex items-center justify-center p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm font-bold text-lg">🌍</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-wide">Seattle Carbon Community</h2>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Region</span>
            </div>
          </div>

          {/* User Status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-600">
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40 text-orange-600">
                <Flame className="h-4 w-4 fill-orange-600" />
                <span className="text-xs font-black">{streak}d Streak</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40 text-amber-600">
                <Coins className="h-4 w-4 fill-amber-500" />
                <span className="text-xs font-black">{coins} Coins</span>
              </div>
            </div>

            {/* Profile Avatar Trigger */}
            <button 
              onClick={() => navigateTo('profile')}
              className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-base font-black border border-emerald-600 shadow-sm">
                🚶
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700 leading-tight">EcoStrider</p>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Level 4</span>
              </div>
            </button>
          </div>
        </header>

        {/* Primary Page Canvas */}
        <div key={activeScreen} className="flex-grow p-4 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto animate-fade-in">
          {renderActiveScreen()}
        </div>

      </main>

      {/* 4. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden sidebar-gradient border-t border-emerald-950/20 fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2.5 shadow-2xl" aria-label="Mobile Navigation">
        {navItems.map(item => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center space-y-1 py-1 cursor-pointer transition-all
                ${isActive 
                  ? 'text-brand-green scale-110 font-bold' 
                  : 'text-slate-400'
                }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Confirmation Toast Alert */}
      <Toast
        show={toast.show}
        message={toast.message}
        subMessage={toast.subMessage}
        onClose={() => setToast({ ...toast, show: false })}
      />

    </div>
  );
};
export default App;
