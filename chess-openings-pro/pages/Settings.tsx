
import React from 'react';
import { UserSettings, AppTheme, BoardTheme, PieceStyle, BgColor } from '../types';
import { 
  Sun, Moon, Volume2, VolumeX, Palette, Layout, Square, User,
  Check, Save, RefreshCw
} from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (newSettings: UserSettings) => void;
}

const PIECE_ASSETS: Record<PieceStyle, string> = {
  neo: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/',
  alpha: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/',
  classic: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/',
  cburnett: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/'
};

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const update = (key: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const bgColors: {id: BgColor, class: string, hex: string, label: string}[] = [
    { id: 'slate', class: 'bg-slate-50', hex: '#f8fafc', label: 'Ardoise' },
    { id: 'zinc', class: 'bg-zinc-50', hex: '#fafafa', label: 'Zinc' },
    { id: 'neutral', class: 'bg-neutral-50', hex: '#fafaf9', label: 'Neutre' },
    { id: 'blue', class: 'bg-blue-50/30', hex: '#f0f9ff', label: 'Bleu Doux' }
  ];

  const boardThemes: {id: BoardTheme, colors: [string, string], label: string}[] = [
    { id: 'blue', colors: ['#ebecd0', '#779556'], label: 'Classique' },
    { id: 'green', colors: ['#eeeed2', '#769656'], label: 'Vert' },
    { id: 'wood', colors: ['#decba4', '#8b4513'], label: 'Bois' },
    { id: 'ocean', colors: ['#e1e1e1', '#5d8aa8'], label: 'Océan' },
    { id: 'forest', colors: ['#e9edcc', '#344e41'], label: 'Forêt' }
  ];

  const pieceStyles: {id: PieceStyle, label: string}[] = [
    { id: 'neo', label: 'Néo' },
    { id: 'alpha', label: 'Alpha' },
    { id: 'classic', label: 'Classique' },
    { id: 'cburnett', label: 'CBurnett' }
  ];

  const currentBoardColors = boardThemes.find(t => t.id === settings.boardTheme)?.colors || ['#fff', '#eee'];
  const getPreviewPieceUrl = (p: string) => `${PIECE_ASSETS[settings.pieceStyle]}${p}.svg`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Paramètres</h2>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Personnalisez votre plateforme d'entraînement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance Section */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-all">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <Palette className="text-blue-500" size={20} />
            <h3 className="font-bold text-lg">Apparence</h3>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Thème Général</label>
            <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => update('theme', 'light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${settings.theme === 'light' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                <Sun size={18} /> Clair
              </button>
              <button 
                onClick={() => update('theme', 'dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${settings.theme === 'dark' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                <Moon size={18} /> Sombre
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Couleur d'arrière-plan (Mode Clair)</label>
            <div className="grid grid-cols-2 gap-3">
              {bgColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => update('bgColor', color.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    settings.bgColor === color.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600`} style={{ backgroundColor: color.hex }}></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{color.label}</span>
                  {settings.bgColor === color.id && <Check size={14} className="ml-auto text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Audio Section */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <Volume2 className="text-blue-500" size={20} />
            <h3 className="font-bold text-lg">Sons & Audio</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 size={20} className="text-blue-500" /> : <VolumeX size={20} className="text-slate-400" />}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Effets sonores</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Déplacement des pièces</p>
              </div>
            </div>
            <button 
              onClick={() => update('soundEnabled', !settings.soundEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Volume</label>
              <span className="text-xs font-bold text-blue-600">{settings.soundVolume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.soundVolume}
              onChange={(e) => update('soundVolume', parseInt(e.target.value))}
              disabled={!settings.soundEnabled}
              className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-30"
            />
          </div>
        </section>

        {/* Board & Pieces Customization */}
        <section className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <Layout className="text-blue-500" size={20} />
            <h3 className="font-bold text-lg">Personnalisation du plateau</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Thème de l'échiquier</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {boardThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => update('boardTheme', theme.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        settings.boardTheme === theme.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex-1" style={{ backgroundColor: theme.colors[0] }}></div>
                        <div className="flex-1" style={{ backgroundColor: theme.colors[1] }}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-slate-400">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Style des pièces</label>
                <div className="grid grid-cols-2 gap-3">
                  {pieceStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => update('pieceStyle', style.id)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all group ${
                        settings.pieceStyle === style.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-bold text-sm w-full text-center">{style.label}</span>
                      {settings.pieceStyle === style.id && <Check size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Aperçu en temps réel</p>
              
              <div 
                className="w-56 h-56 grid grid-cols-4 grid-rows-4 rounded-xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative"
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-full h-full"
                    style={{ 
                      backgroundColor: (Math.floor(i / 4) + i) % 2 === 0 
                        ? currentBoardColors[0] 
                        : currentBoardColors[1]
                    }}
                  ></div>
                ))}
                {/* Preview Pieces using REAL Lichess assets */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none p-2">
                   <div className="col-start-2 row-start-2 flex items-center justify-center">
                      <img src={getPreviewPieceUrl('wQ')} className="w-[90%] h-[90%]" alt="" />
                   </div>
                   <div className="col-start-3 row-start-3 flex items-center justify-center">
                      <img src={getPreviewPieceUrl('bP')} className="w-[90%] h-[90%]" alt="" />
                   </div>
                   {/* Target indicator preview */}
                   <div className="col-start-2 row-start-3 flex items-center justify-center">
                      <div className="w-1/4 h-1/4 rounded-full bg-black/20 dark:bg-white/30"></div>
                   </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col items-center gap-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Configuration Actuelle</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{settings.boardTheme} • {settings.pieceStyle}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button 
          onClick={() => {
            if(confirm("Voulez-vous vraiment réinitialiser tous les paramètres ?")) {
                localStorage.clear();
                window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-6 py-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all w-full sm:w-auto justify-center"
        >
          <RefreshCw size={18} />
          Réinitialiser
        </button>
        <button className="flex items-center gap-2 px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto justify-center">
          <Save size={20} />
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default Settings;
