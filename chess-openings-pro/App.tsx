
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './pages/Dashboard';
import Repertoire from './pages/Repertoire';
import Study from './pages/Study';
import Settings from './pages/Settings';
import { storageService } from './services/storage';
import { UserProfile, OpeningLine, UserSettings } from './types';
import { Terminal, LayoutDashboard, BookOpen, GraduationCap, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [lines, setLines] = useState<OpeningLine[]>(storageService.getLines());
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());

  // GESTION DU RETOUR OAUTH
  useEffect(() => {
    // 1. On parse les paramètres de l'URL (Lichess renvoie dans query ?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    // 2. On parse les paramètres du fragment (Google renvoie dans #access_token=...)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const code = urlParams.get('code');
    const accessToken = hashParams.get('access_token');
    const state = urlParams.get('state') || hashParams.get('state');
    
    const savedState = localStorage.getItem('auth_state');
    const provider = localStorage.getItem('auth_provider');

    if ((code || accessToken) && state) {
      // Nettoyage immédiat pour éviter les boucles
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem('auth_state');
      localStorage.removeItem('auth_provider');

      // Vérification du state pour la sécurité
      if (state !== savedState) {
        console.warn("OAuth State Mismatch - Security Warning");
      }

      if (code && provider === 'lichess') {
        // Retour Lichess : on simule la validation du jeton
        handleLogin('lichess_player@lichess.org', 'LichessMaster', true);
      } else if (accessToken && provider === 'google') {
        // Retour Google : on simule la lecture du profil
        handleLogin('google_user@gmail.com', 'GoogleChessPlayer', false);
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      root.classList.remove('dark');
      const bgMap = {
        slate: '#f8fafc',
        zinc: '#fafafa',
        neutral: '#fafaf9',
        blue: '#f0f9ff'
      };
      document.body.style.backgroundColor = bgMap[settings.bgColor] || '#f8fafc';
    }
    storageService.saveSettings(settings);
  }, [settings]);

  const handleLogin = (email: string, username: string, isLichessLogin: boolean = false, isDev: boolean = false) => {
    const updatedProfile: UserProfile = { 
      ...profile, 
      email, 
      username, 
      isLoggedIn: true,
      isDev: isDev,
      isLichessConnected: isLichessLogin || profile.isLichessConnected,
      lichessUsername: isLichessLogin ? username : profile.lichessUsername
    };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  const handleNavigate = (page: string) => setActivePage(page);
  const handleUpdateSettings = (newSettings: UserSettings) => setSettings(newSettings);
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
  };

  const handleAddLine = (newLine: OpeningLine) => {
    const updatedLines = [newLine, ...lines];
    setLines(updatedLines);
    storageService.saveLines(updatedLines);
  };

  const handleUpdateLine = (id: string, updates: Partial<OpeningLine>) => {
    const updatedLines = storageService.updateLine(id, updates);
    setLines(updatedLines);
  };

  const handleDeleteLine = (id: string) => {
    const updatedLines = storageService.deleteLine(id);
    setLines(updatedLines);
  };

  if (!profile.isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!profile.hasOnboarded) {
    return <Onboarding initialProfile={profile} onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard lines={lines} profile={profile} onReview={() => handleNavigate('study')} />;
      case 'repertoire':
        return <Repertoire lines={lines} profile={profile} onAddLine={handleAddLine} onUpdateLine={handleUpdateLine} onDeleteLine={handleDeleteLine} />;
      case 'study':
        return <Study lines={lines} settings={settings} profile={profile} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={handleUpdateSettings} />;
      default:
        return <div className="p-20 text-center font-black uppercase text-slate-300">En développement</div>;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'repertoire', label: 'Répertoire', icon: <BookOpen size={20} /> },
    { id: 'study', label: 'Étudier', icon: <GraduationCap size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${settings.theme === 'dark' ? 'text-slate-100 bg-slate-900' : 'text-slate-900'} transition-colors duration-300 relative`}>
      {profile.isDev && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-[999] bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-2xl border border-orange-400 animate-pulse">
          <Terminal size={12} /> MODE DÉVELOPPEUR
        </div>
      )}
      
      <div className="hidden md:block">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
        <Topbar profile={profile} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex md:hidden items-center justify-around h-16 px-4 z-50">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleNavigate(item.id)} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activePage === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.icon}
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
