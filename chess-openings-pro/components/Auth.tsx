
import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2, UserMinus, User } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, username: string, options?: { isSkip?: boolean, isDev?: boolean }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    
    setTimeout(() => {
      const isDev = (username === 'KingWoulfic' || email === 'KingWoulfic') && password === 'Brice-2008';
      onLogin(
        email || (isDev ? 'king@woulfic.dev' : 'user@chess.pro'), 
        username || (isDev ? 'KingWoulfic' : 'Joueur'), 
        { isDev }
      );
      setLoading(null);
    }, 600);
  };

  const handleSkip = () => {
    setLoading('skip');
    setTimeout(() => {
      onLogin('guest@chess.pro', 'Invité', { isSkip: true });
      setLoading(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col md:flex-row items-stretch overflow-hidden">
      <div className="hidden md:flex flex-col justify-between p-12 bg-blue-600 relative overflow-hidden w-[40%]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-12">
            <Shield size={32} fill="white" />
            <span className="text-2xl font-black tracking-tighter uppercase">Chess Prep Pro</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter">
            DOMINE <br/>CHAQUE <br/><span className="text-blue-200 text-7xl">OUVERTURE.</span>
          </h1>
        </div>
        <div className="relative z-10 text-blue-100 text-xs font-bold uppercase tracking-widest opacity-60">
          <p>© 2025 • Design by KingWoulfic</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center p-8 overflow-y-auto relative">
        <button 
          onClick={handleSkip}
          className="absolute top-8 right-8 flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          {loading === 'skip' ? <Loader2 className="animate-spin" size={14} /> : <UserMinus size={14} />}
          Accès Rapide (Invité)
        </button>

        <div className="w-full max-w-md space-y-10">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {isLogin ? "Connexion" : "Créer un profil"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Préparez votre répertoire comme un Grand Maître.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identifiant</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="text" value={username || email} onChange={(e) => { setUsername(e.target.value); setEmail(e.target.value); }} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]">
              {loading === 'email' ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={18} />}
              {isLogin ? "Se Connecter" : "S'inscrire"}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
              {isLogin ? "Nouveau ici ? Créer un compte" : "Déjà membre ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
