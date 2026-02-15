
import React from 'react';
import { OpeningLine, Stats, UserProfile } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { AlertTriangle, CheckCircle2, TrendingUp, ChevronRight, Zap, Trophy, Shield } from 'lucide-react';

const data = [
  { name: 'Lun', mastered: 4000 },
  { name: 'Mar', mastered: 3000 },
  { name: 'Mer', mastered: 2000 },
  { name: 'Jeu', mastered: 2780 },
  { name: 'Ven', mastered: 4890 },
  { name: 'Sam', mastered: 2390 },
  { name: 'Dim', mastered: 3490 },
];

interface DashboardProps {
  lines: OpeningLine[];
  profile: UserProfile;
  onReview: (line: OpeningLine) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lines, profile, onReview }) => {
  const stats: Stats = {
    masteryPercentage: lines.length > 0 ? Math.round(lines.reduce((acc, l) => acc + l.masteryScore, 0) / lines.length) : 0,
    totalLines: lines.length,
    solidLines: lines.filter(l => l.masteryScore > 80).length,
    weakLines: lines.filter(l => l.masteryScore < 50).length,
    reliabilityScore: 88
  };

  const linesToReview = lines
    .filter(l => new Date(l.nextReview) <= new Date())
    .sort((a, b) => a.masteryScore - b.masteryScore);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-4 md:pb-0">
      {/* Welcome Banner - Optimized for mobile */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white border border-slate-800 shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none hidden md:block">
            <Trophy size={180} />
         </div>
         <div className="relative z-10 max-w-2xl text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <div className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Pro Player</div>
                <div className="flex items-center gap-1.5 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                   <Zap size={14} fill="currentColor" />
                   {profile.streak} Jours
                </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 leading-tight">Bonjour, {profile.username}</h1>
            <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed mb-8">Tes adversaires n'attendent que tes imprécisions. Prêt à réviser ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <button 
                onClick={() => linesToReview.length > 0 && onReview(linesToReview[0])}
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all text-xs uppercase tracking-widest"
               >
                  Réviser
               </button>
               <button className="hidden sm:block px-6 py-4 bg-slate-800 text-white rounded-2xl font-black border border-slate-700 hover:bg-slate-700 transition-all text-xs uppercase tracking-widest">
                  Paramètres
               </button>
            </div>
         </div>
      </div>

      {/* Overview Cards - Scrollable on very small screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Maîtrise" value={`${stats.masteryPercentage}%`} icon={<TrendingUp size={20} className="text-blue-500" />} color="blue" />
        <StatCard title="Variantes" value={stats.solidLines} icon={<CheckCircle2 size={20} className="text-emerald-500" />} color="emerald" />
        <StatCard title="Priorités" value={stats.weakLines} icon={<AlertTriangle size={20} className="text-amber-500" />} color="amber" />
        <StatCard title="Cote" value={profile.elo} icon={<Shield size={20} className="text-indigo-500" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">Activité</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cette semaine</p>
            </div>
          </div>
          <div className="h-48 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="mastered" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMastered)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">À réviser</h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
            {linesToReview.length > 0 ? linesToReview.map((line) => (
              <div 
                key={line.id} 
                className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-blue-50/50 dark:active:bg-blue-900/10 transition-all cursor-pointer"
                onClick={() => onReview(line)}
              >
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate">{line.name}</span>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${line.masteryScore}%` }}></div>
                  </div>
                </div>
                <div className="text-blue-600">
                  <ChevronRight size={18} />
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 opacity-50 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tout est à jour</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => linesToReview.length > 0 && onReview(linesToReview[0])}
            className="mt-6 w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
          >
            Lancer
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) => (
  <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm active:translate-y-1 transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 bg-${color}-500/10 rounded-xl`}>{icon}</div>
    </div>
    <div className="space-y-1">
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
    </div>
  </div>
);

export default Dashboard;
