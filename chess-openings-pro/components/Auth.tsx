
import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2, Globe, Chrome, UserMinus } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, username: string, isLichess?: boolean, isDev?: boolean) => void;
}

/**
 * CONFIGURATION OAUTH
 */
const LICHESS_CLIENT_ID = 'chess-prep-pro-app'; 
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'lichess' | 'email' | 'skip' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider('email');
    
    setTimeout(() => {
      const isDev = (username === 'KingWoulfic' || email === 'KingWoulfic') && password === 'Brice-2008';
      onLogin(
        email || (isDev ? 'king@woulfic.dev' : 'user@chess.pro'), 
        username || (isDev ? 'KingWoulfic' : (email ? email.split('@')[0] : 'Joueur')), 
        false, 
        isDev
      );
      setLoadingProvider(null);
    }, 800);
  };

  const handleSkip = () => {
    setLoadingProvider('skip');
    setTimeout(() => {
      onLogin('guest@chess.pro', 'Invité', false, false);
      setLoadingProvider(null);
    }, 500);
  };

  const handleSocialLogin = (provider: 'google' | 'lichess') => {
    setLoadingProvider(provider);
    const redirectUri = window.location.origin.replace(/\/$/, "");
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('auth_state', state);
    localStorage.setItem('auth_provider', provider);

    if (provider === 'lichess') {
      const scope = 'preference:read study:read';
      const lichessUrl = `https://lichess.org/oauth/authorize?response_type=code&client_id=${LICHESS_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      window.location.href = lichessUrl;
    } else {
      const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&state=${state}&prompt=select_account`;
      window.location.href = googleUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col md:flex-row items-stretch overflow-hidden">
      <div className="hidden md:flex flex-col justify-between p-12 bg-blue-600 relative overflow-hidden w-[40%]">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-blue-500 blur-[150px] opacity-50 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-12">
            <Shield size={32} fill="white" />
            <span className="text-2xl font-black tracking-tighter uppercase">Chess Prep Pro</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter">
            MAÎTRISE <br/>TON <br/><span className="text-blue-200">RÉPERTOIRE.</span>
          </h1>
        </div>
        <div className="relative z-10 text-blue-100 text-sm font-medium">
          <p>© 2025 Chess Prep Pro. <br/>By KingWoulfic.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center p-8 overflow-y-auto relative">
        {/* Skip Button Top Right */}
        <button 
          onClick={handleSkip}
          className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          {loadingProvider === 'skip' ? <Loader2 className="animate-spin" size={14} /> : <UserMinus size={14} />}
          Passer l'étape
        </button>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLogin ? "Bon retour" : "Créer un profil"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Connectez vos comptes pour une synchronisation totale.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 py-4 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300"
            >
              {loadingProvider === 'google' ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} className="text-red-500" />}
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('lichess')}
              className="flex items-center justify-center gap-3 py-4 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300"
            >
              {loadingProvider === 'lichess' ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} className="text-orange-500" />}
              Lichess
            </button>
          </div>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">OU EMAIL</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email ou Pseudo</label>
              <input required type="text" value={username || email} onChange={(e) => { setUsername(e.target.value); setEmail(e.target.value); }} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]">
              {loadingProvider === 'email' ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={18} />}
              {isLogin ? "Connexion" : "S'inscrire"}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
              {isLogin ? "Pas de compte ? Créer mon profil" : "Déjà membre ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
