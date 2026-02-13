
import React from 'react';
import { UserProfile } from '../types';
import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  profile: UserProfile;
}

const Topbar: React.FC<TopbarProps> = ({ profile }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une ligne..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 lg:w-96 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm text-slate-500 uppercase tracking-tighter font-semibold">Cote ELO</span>
          <span className="text-lg font-bold text-slate-900">{profile.elo}</span>
        </div>

        <div className="h-10 w-px bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">Bonjour, {profile.username}</p>
              <p className="text-xs text-blue-600 font-medium">Niveau {profile.level}</p>
            </div>
            <img 
              src={`https://picsum.photos/seed/${profile.username}/100`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
