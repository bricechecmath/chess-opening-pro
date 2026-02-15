
import React, { useState } from 'react';
import { OpeningLine, ChessColor, UserProfile, MoveNode } from '../types';
import { Plus, Trash2, Edit3, X, AlertTriangle, GitBranch, FileText, ExternalLink } from 'lucide-react';
import { PgnParser } from '../services/pgnParser';

interface RepertoireProps {
  lines: OpeningLine[];
  profile: UserProfile;
  onAddLine: (line: OpeningLine) => void;
  onUpdateLine: (id: string, updates: Partial<OpeningLine>) => void;
  onDeleteLine: (id: string) => void;
}

const Repertoire: React.FC<RepertoireProps> = ({ lines, profile, onAddLine, onUpdateLine, onDeleteLine }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<ChessColor>('white');
  const [newPgn, setNewPgn] = useState('');

  const extractLichessUrl = (pgn: string): string | undefined => {
    const match = pgn.match(/\[ChapterURL\s+"(.*?)"\]/);
    return match ? match[1] : undefined;
  };

  const extractOpeningName = (pgn: string): string | undefined => {
    const match = pgn.match(/\[(Opening|ChapterName|StudyName)\s+"(.*?)"\]/);
    return match ? match[2] : undefined;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPgn.trim()) return;

    // Utilisation du nouveau parser pro
    const tree = PgnParser.parse(newPgn);
    const lichessUrl = extractLichessUrl(newPgn);
    const detectedName = extractOpeningName(newPgn);
    
    const finalName = newName || detectedName || "Ouverture Sans Nom";

    if (editingId) {
      onUpdateLine(editingId, { name: finalName, color: newColor, tree, pgn: newPgn, lichessUrl });
    } else {
      onAddLine({
        id: Math.random().toString(36).substr(2, 9),
        name: finalName,
        color: newColor,
        pgn: newPgn,
        tree,
        comments: "",
        notes: "",
        masteryScore: 0,
        errorsCount: 0,
        lastReview: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        difficulty: 'medium',
        tags: [],
        lichessUrl
      });
    }
    closeForm();
  };

  const handleEdit = (line: OpeningLine) => {
    setEditingId(line.id);
    setNewName(line.name);
    setNewColor(line.color);
    setNewPgn(line.pgn);
    setIsCreating(true);
  };

  const closeForm = () => { setIsCreating(false); setEditingId(null); setNewName(''); setNewPgn(''); };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-4 max-w-6xl mx-auto">
      {deletingId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Supprimer ?</h3>
              <div className="flex flex-col gap-3">
                 <button onClick={() => { onDeleteLine(deletingId); setDeletingId(null); }} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs">Confirmer</button>
                 <button onClick={() => setDeletingId(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl font-black uppercase text-xs">Annuler</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Répertoire</h2>
          <p className="text-slate-500 font-medium italic">Système d'import PGN Professionnel</p>
        </div>
        <button onClick={() => { closeForm(); setIsCreating(true); }} className="flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl text-xs uppercase tracking-widest active:scale-95">
          <Plus size={20} /> Importer PGN
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lines.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
             <FileText size={48} className="mx-auto text-slate-300" />
             <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Votre répertoire est vide</p>
          </div>
        )}
        {lines.map((line) => (
          <div key={line.id} className="group p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all relative overflow-hidden shadow-sm">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <button onClick={() => handleEdit(line)} className="p-3 bg-white dark:bg-slate-700 shadow-xl rounded-xl text-slate-500 hover:text-blue-600 transition-all"><Edit3 size={16} /></button>
               <button onClick={() => setDeletingId(line.id)} className="p-3 bg-white dark:bg-slate-700 shadow-xl rounded-xl text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${line.color === 'white' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white shadow-xl'}`}>
                  <GitBranch size={24} />
               </div>
               <div>
                  <h4 className="font-black text-slate-900 dark:text-white truncate max-w-[180px] uppercase text-lg tracking-tight leading-tight">{line.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{line.color === 'white' ? 'Blancs' : 'Noirs'}</p>
               </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                 <span className="text-slate-400">Maîtrise</span>
                 <span className="text-blue-600">{line.masteryScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${line.masteryScore}%` }}></div>
              </div>
              {line.lichessUrl && (
                <a 
                  href={line.lichessUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors border border-slate-100 dark:border-slate-700"
                >
                  <ExternalLink size={12} /> Source Lichess
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
            <div className="p-10 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Import de Répertoire</h3>
              <button onClick={closeForm} className="p-4 bg-white dark:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Côté Joueur</label>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                     <button type="button" onClick={() => setNewColor('white')} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase transition-all ${newColor === 'white' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-500'}`}>Blancs</button>
                     <button type="button" onClick={() => setNewColor('black')} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase transition-all ${newColor === 'black' ? 'bg-slate-800 shadow-lg text-white' : 'text-slate-500'}`}>Noirs</button>
                  </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du système</label>
                   <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Titre (ou extrait auto du PGN)" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Texte PGN (Lichess, Chess.com...)</label>
                <textarea required rows={10} value={newPgn} onChange={(e) => setNewPgn(e.target.value)} placeholder="Collez votre PGN ici..." className="w-full px-6 py-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] font-mono text-xs outline-none focus:ring-4 focus:ring-blue-500/10 resize-none transition-all dark:text-blue-100" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeForm} className="flex-1 py-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-[1.5rem] font-black uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">Annuler</button>
                <button type="submit" className="flex-[2] py-6 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-2xl text-xs uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95">Valider l'import</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repertoire;
