
import React from 'react';
import { UserProfile } from '../types';
import { Bell, Search, ChevronDown } from 'lucide-react';

interface TopbarProps {
  profile: UserProfile;
  onOpenProfile: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ profile, onOpenProfile }) => {
  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-8">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 text-sm dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Cote ELO</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{profile.elo}</span>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-3 pl-2 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{profile.username}</p>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Niveau {profile.level}</p>
            </div>
            <div className="relative">
              <img 
                src={profile.email?.includes('picsum') ? profile.email : `https://picsum.photos/seed/${profile.username}/100`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
