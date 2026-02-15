
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, ChevronRight, Trophy, Zap, Globe, User, Check, ExternalLink, Loader2 } from 'lucide-react';

interface OnboardingProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

const LICHESS_CLIENT_ID = 'chess-prep-pro-app'; 

const Onboarding: React.FC<OnboardingProps> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isLichessDone, setIsLichessDone] = useState(initialProfile.isLichessConnected);
  const [formData, setFormData] = useState({
    elo: initialProfile.elo || 1500,
    lichessUsername: initialProfile.lichessUsername || ''
  });

  const handleLichessAuth = () => {
    setIsAuthorizing(true);
    const redirectUri = window.location.origin.replace(/\/$/, "");
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('auth_state', state);
    localStorage.setItem('auth_provider', 'lichess');

    // Redirection réelle vers Lichess pour authentification
    const scope = 'preference:read study:read';
    const lichessUrl = `https://lichess.org/oauth/authorize?response_type=code&client_id=${LICHESS_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    // On simule une petite attente avant redirection pour l'UI
    setTimeout(() => {
      window.location.href = lichessUrl;
    }, 500);
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      onComplete({
        ...initialProfile,
        lichessUsername: formData.lichessUsername || initialProfile.lichessUsername,
        elo: formData.elo,
        isLichessConnected: isLichessDone,
        hasOnboarded: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
        <div className="flex gap-2 justify-center mb-10">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-black text-white tracking-tight">Configuration Profile</h2>
            <p className="text-slate-400 font-medium">Déterminez votre niveau pour adapter les exercices.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estimation Elo</label>
                <div className="relative">
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="number"
                    value={formData.elo}
                    onChange={(e) => setFormData({...formData, elo: parseInt(e.target.value)})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                 <Globe size={24} />
               </div>
               <h2 className="text-3xl font-black text-white tracking-tight">Synchronisation Lichess</h2>
            </div>
            <p className="text-slate-400 text-sm">Indispensable pour importer vos études et jouer vos variantes directement.</p>
            
            <div className="p-8 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center text-center gap-4 transition-all">
              {isLichessDone ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 scale-110 transition-transform">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl tracking-tight">Compte Associé</p>
                    <p className="text-slate-500 text-xs mt-1">Vos études sont prêtes à être importées.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center border border-slate-700">
                    <Globe size={32} />
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={handleLichessAuth}
                      disabled={isAuthorizing}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-50 transition-all disabled:opacity-50"
                    >
                      {isAuthorizing ? <Loader2 className="animate-spin" size={18} /> : "Connecter Lichess"}
                      {!isAuthorizing && <ExternalLink size={16} />}
                    </button>
                    <button 
                      onClick={handleNext}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors py-2"
                    >
                      Plus tard
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Via Lichess OAuth2</p>
                </>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          className="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-black shadow-2xl shadow-blue-900/40 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {step === 2 ? "FINALISER" : "CONTINUER"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
