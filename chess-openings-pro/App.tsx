
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
import { LayoutDashboard, BookOpen, GraduationCap, Settings as SettingsIcon, X, Camera, User, Trophy, LogOut, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [lines, setLines] = useState<OpeningLine[]>(storageService.getLines());
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [editUsername, setEditUsername] = useState('');
  const [editElo, setEditElo] = useState(1500);
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      root.classList.remove('dark');
      const bgMap = { slate: '#f8fafc', zinc: '#fafafa', neutral: '#fafaf9', blue: '#f0f9ff' };
      document.body.style.backgroundColor = bgMap[settings.bgColor] || '#f8fafc';
    }
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isProfileOpen) {
      setEditUsername(profile.username);
      setEditElo(profile.elo);
      setEditAvatar(profile.email?.includes('http') ? profile.email : `https://picsum.photos/seed/${profile.username}/100`);
    }
  }, [isProfileOpen, profile]);

  const handleLogin = (email: string, username: string, options?: { isSkip?: boolean, isDev?: boolean }) => {
    const updatedProfile: UserProfile = { 
      ...profile, 
      email: profile.email || email, // Use avatar URL if available
      username, 
      isLoggedIn: true,
      isDev: options?.isDev || false,
      hasOnboarded: options?.isSkip || profile.hasOnboarded
    };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = { ...profile, username: editUsername, elo: editElo, email: editAvatar };
    setProfile(updated);
    storageService.saveProfile(updated);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        const resetProfile = { ...profile, isLoggedIn: false };
        setProfile(resetProfile);
        storageService.saveProfile(resetProfile);
    }
  };

  const handleNavigate = (page: string) => setActivePage(page);
  
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

  if (!profile.isLoggedIn) return <Auth onLogin={handleLogin} />;
  if (!profile.hasOnboarded) return <Onboarding initialProfile={profile} onComplete={(p) => { setProfile(p); storageService.saveProfile(p); }} />;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'repertoire', label: 'Livres', icon: <BookOpen size={20} /> },
    { id: 'study', label: 'Drill', icon: <GraduationCap size={20} /> },
    { id: 'settings', label: 'Config', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${settings.theme === 'dark' ? 'text-slate-100 bg-slate-900' : 'text-slate-900'} transition-colors duration-300 relative`}>
      {isProfileOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                 <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Mon Compte</h3>
                 <button onClick={() => setIsProfileOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-full text-slate-500 shadow-sm"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
                 <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => {
                        const url = prompt("URL de votre photo de profil :", editAvatar);
                        if (url) setEditAvatar(url);
                    }}>
                       <img src={editAvatar} className="w-28 h-28 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl object-cover transition-transform group-hover:scale-105" alt="Profile" />
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 rounded-[2.5rem] flex items-center justify-center transition-opacity text-white font-black text-[10px] uppercase tracking-widest">Modifier</div>
                    </div>
                    <button type="button" onClick={() => setEditAvatar(`https://picsum.photos/seed/${Math.random()}/200`)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 px-4 py-2 rounded-xl transition-all"><RefreshCw size={10} /> Image Aléatoire</button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pseudo</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cote Elo</label>
                       <div className="relative">
                          <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input required type="number" value={editElo} onChange={e => setEditElo(parseInt(e.target.value))} className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none" />
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-3 pt-4">
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Sauvegarder</button>
                    <button type="button" onClick={handleLogout} className="w-full py-5 text-red-600 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"><LogOut size={16} /> Déconnexion</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="hidden md:block">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
        <Topbar profile={profile} onOpenProfile={() => setIsProfileOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && <Dashboard lines={lines} profile={profile} onReview={() => handleNavigate('study')} />}
            {activePage === 'repertoire' && <Repertoire lines={lines} profile={profile} onAddLine={handleAddLine} onUpdateLine={handleUpdateLine} onDeleteLine={handleDeleteLine} />}
            {activePage === 'study' && <Study lines={lines} settings={settings} profile={profile} />}
            {activePage === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
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
