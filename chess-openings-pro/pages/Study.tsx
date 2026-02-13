
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { OpeningLine, UserSettings, UserProfile, MoveNode } from '../types';
import { Play, ChevronLeft, CheckCircle2, Lightbulb, Zap, GitPullRequest, Layers, Target, Trophy, ChevronRight, History, RotateCcw } from 'lucide-react';
import ChessBoard from '../components/ChessBoard';
import { Move, Chess } from 'chess.js';
import { storageService } from '../services/storage';

interface StudyProps {
  lines: OpeningLine[];
  settings: UserSettings;
  profile: UserProfile;
}

const Study: React.FC<StudyProps> = ({ lines, settings, profile }) => {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [currentFen, setCurrentFen] = useState('start');
  const [currentNode, setCurrentNode] = useState<MoveNode | null>(null);
  const [targetLeafId, setTargetLeafId] = useState<string | null>(null); // Cible précise du drill
  const [status, setStatus] = useState<'idle' | 'waiting' | 'error' | 'success' | 'completed' | 'switching'>('idle');
  const [feedback, setFeedback] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [completedLeaves, setCompletedLeaves] = useState<string[]>([]); 
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  const computerTimeoutRef = useRef<number | null>(null);

  const currentLine = useMemo(() => lines.find(l => l.id === selectedLineId), [lines, selectedLineId]);

  /**
   * RÉCUPÉRER TOUTES LES FINS DE VARIANTES (FEUILLES)
   */
  const getAllLeafIds = useCallback((nodes: MoveNode[]): string[] => {
    let leaves: string[] = [];
    nodes.forEach(node => {
      if (!node.children || node.children.length === 0) {
        leaves.push(node.id);
      } else {
        leaves = [...leaves, ...getAllLeafIds(node.children)];
      }
    });
    return leaves;
  }, []);

  const totalLeafIds = useMemo(() => {
    if (!currentLine) return [];
    return getAllLeafIds(currentLine.tree);
  }, [currentLine, getAllLeafIds]);

  /**
   * DÉTERMINER SI UN NŒUD MÈNE À UNE FEUILLE SPÉCIFIQUE
   */
  const leadsToSpecificLeaf = useCallback((node: MoveNode, targetId: string): boolean => {
    if (node.id === targetId) return true;
    if (!node.children || node.children.length === 0) return false;
    return node.children.some(child => leadsToSpecificLeaf(child, targetId));
  }, []);

  /**
   * LANCEMENT D'UNE NOUVELLE BRANCHE CIBLÉE
   */
  const startNewBranch = useCallback((isAuto = false, overrideCompleted?: string[]) => {
    if (!currentLine) return;
    
    const completed = overrideCompleted || completedLeaves;
    const remaining = totalLeafIds.filter(id => !completed.includes(id));
    
    if (remaining.length === 0) {
      finishFullSession(errorCount);
      return;
    }

    // CIBLAGE ALÉATOIRE : On pioche une branche non faite au hasard
    const nextTargetId = remaining[Math.floor(Math.random() * remaining.length)];
    setTargetLeafId(nextTargetId);
    
    setStatus('idle');
    setCurrentNode(null);
    setCurrentFen('start');
    setMoveHistory([]);
    setFeedback(isAuto ? 'Cible changée...' : 'Mémorisez le système.');

    // Tour de l'ordi si on joue les Noirs
    if (currentLine.color === 'black') {
      const firstMove = currentLine.tree.find(n => leadsToSpecificLeaf(n, nextTargetId));
      if (firstMove) {
        setStatus('waiting');
        setTimeout(() => {
          const game = new Chess();
          try {
            game.move(firstMove.san);
            setCurrentNode(firstMove);
            setCurrentFen(game.fen());
            setMoveHistory([firstMove.san]);
            setStatus('idle');
            if (firstMove.id === nextTargetId) handleLeafReached(firstMove.id, completed);
          } catch(e) {
            setStatus('idle');
          }
        }, 500);
      }
    }
  }, [currentLine, completedLeaves, totalLeafIds, leadsToSpecificLeaf]);

  const handleUserMove = (move: Move) => {
    if (!isTraining || !currentLine || !targetLeafId || (status !== 'idle' && status !== 'waiting')) return;

    const candidates = currentNode ? currentNode.children : currentLine.tree;
    // On cherche le coup qui mène à notre cible
    const matchedNode = candidates.find(n => n.san === move.san && leadsToSpecificLeaf(n, targetLeafId));

    if (matchedNode) {
      const game = new Chess(currentFen === 'start' ? undefined : currentFen);
      game.move(move);
      
      setCurrentNode(matchedNode);
      setCurrentFen(game.fen());
      setMoveHistory(prev => [...prev, matchedNode.san]);
      setFeedback('Excellent');
      
      if (matchedNode.id === targetLeafId) {
        handleLeafReached(matchedNode.id);
      } else {
        playComputerMove(matchedNode, game.fen());
      }
    } else {
      // ERREUR
      setStatus('error');
      setErrorCount(prev => prev + 1);
      const expected = candidates.find(n => leadsToSpecificLeaf(n, targetLeafId));
      setFeedback(`Faux. Le coup cible était : ${expected?.san || '?'}`);
      
      const lastFen = currentFen;
      setTimeout(() => {
        setCurrentFen(lastFen + ' '); 
        setTimeout(() => { setCurrentFen(lastFen); setStatus('idle'); }, 50);
      }, 1000);
    }
  };

  const playComputerMove = (fromNode: MoveNode, fen: string) => {
    if (!targetLeafId) return;
    setStatus('waiting');
    
    computerTimeoutRef.current = window.setTimeout(() => {
      // L'ordi suit la route vers la cible
      const nextNode = fromNode.children.find(n => leadsToSpecificLeaf(n, targetLeafId));
      if (!nextNode) { setStatus('idle'); return; }

      const game = new Chess(fen);
      try {
        game.move(nextNode.san);
        setCurrentNode(nextNode);
        setCurrentFen(game.fen());
        setMoveHistory(prev => [...prev, nextNode!.san]);
        setStatus('idle');

        if (nextNode.id === targetLeafId) {
          handleLeafReached(nextNode.id);
        }
      } catch (e) {
        setStatus('idle');
      }
    }, 600);
  };

  const handleLeafReached = (leafId: string, overrideCompleted?: string[]) => {
    const currentComp = overrideCompleted || completedLeaves;
    if (currentComp.includes(leafId)) {
        // Sécurité contre les répétitions : si déjà fait, on force un reset vers une autre
        startNewBranch(true, currentComp);
        return;
    }

    const updated = [...new Set([...currentComp, leafId])];
    setCompletedLeaves(updated);

    if (updated.length >= totalLeafIds.length) {
      finishFullSession(errorCount);
    } else {
      setStatus('switching');
      setFeedback('Cible atteinte !');
      setTimeout(() => {
        startNewBranch(true, updated);
      }, 1000);
    }
  };

  const finishFullSession = (errors: number) => {
    setStatus('completed');
    setIsTraining(false);
    setTargetLeafId(null);
    if (currentLine) {
        const bonus = errors === 0 ? 25 : 10;
        const newScore = Math.min(100, (currentLine.masteryScore || 0) + bonus);
        storageService.updateLine(currentLine.id, {
            masteryScore: newScore,
            errorsCount: (currentLine.errorsCount || 0) + errors,
            lastReview: new Date().toISOString()
        });
    }
  };

  const resetStudy = () => {
    setSelectedLineId(null);
    setIsTraining(false);
    setCompletedLeaves([]);
    setTargetLeafId(null);
    setStatus('idle');
    if (computerTimeoutRef.current) clearTimeout(computerTimeoutRef.current);
  };

  if (!selectedLineId) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4">
        <div className="text-center space-y-4 pt-10">
          <div className="inline-flex p-6 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/40 mb-6">
            <Target size={48} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Drill Répertoire</h2>
          <p className="text-slate-500 font-medium text-lg">Sélectionnez une ouverture pour explorer l'arbre complet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lines.map((line) => (
            <button 
              key={line.id}
              onClick={() => { setSelectedLineId(line.id); setCompletedLeaves([]); }}
              className="group text-left bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-2xl transition-all relative overflow-hidden active:scale-95 shadow-sm"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <GitPullRequest size={100} />
              </div>
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${line.color === 'white' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white shadow-xl'}`}>
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 truncate uppercase tracking-tighter leading-tight">{line.name}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{line.color === 'white' ? 'Côté Blanc' : 'Côté Noir'}</p>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Progression</span>
                   <span className="text-blue-600">{line.masteryScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${line.masteryScore}%` }}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const progress = Math.round((completedLeaves.length / (totalLeafIds.length || 1)) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20 px-2">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
        <button onClick={resetStudy} className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
          <ChevronLeft size={18} /> Quitter
        </button>
        <div className="flex-1 max-w-xl mx-12">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5 text-slate-400">
              <span className="flex items-center gap-2 text-blue-600"><Layers size={14} /> Couverture Arbre</span>
              <span>{progress}% ({completedLeaves.length}/{totalLeafIds.length} branches)</span>
           </div>
           <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl">
           <Trophy size={20} className="text-amber-500" />
           <span className="text-xs font-black uppercase tracking-tighter leading-none">{currentLine.name}</span>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
          
          {status === 'completed' && (
            <div className="absolute inset-0 z-50 bg-emerald-600 flex flex-col items-center justify-center text-white p-12 text-center animate-in fade-in duration-500">
               <CheckCircle2 size={100} className="mb-8 animate-bounce" />
               <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase">Maîtrise Validée !</h3>
               <p className="text-emerald-100 mb-12 text-lg font-medium">L'arbre complet a été parcouru sans omissions.</p>
               <button onClick={resetStudy} className="w-full max-w-xs py-6 bg-white text-emerald-600 rounded-2xl font-black uppercase text-xs hover:shadow-2xl transition-all active:scale-95">Retour</button>
            </div>
          )}

          {status === 'switching' && (
             <div className="absolute inset-0 z-40 bg-blue-600/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
                <RotateCcw size={64} className="mb-6 animate-spin-slow" />
                <h4 className="text-3xl font-black uppercase tracking-tighter">Variante Validée</h4>
                <p className="text-blue-100 text-[11px] font-black uppercase tracking-[0.3em] mt-3">Recherche d'une branche inexplorée...</p>
             </div>
          )}

          <div className="w-full max-w-[500px] shadow-2xl rounded-xl">
            <ChessBoard 
              fen={currentFen}
              onMove={handleUserMove}
              boardTheme={settings.boardTheme}
              pieceStyle={settings.pieceStyle}
              orientation={currentLine.color}
              interactive={isTraining && (status === 'idle' || status === 'waiting')}
              soundEnabled={settings.soundEnabled}
            />
          </div>
          
          <div className="mt-10 min-h-[56px] flex items-center justify-center">
             {feedback && status !== 'switching' && (
               <div className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-2xl animate-in slide-in-from-bottom-4 ${status === 'error' ? 'bg-red-500 animate-shake' : 'bg-blue-600'}`}>
                 {feedback}
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative border border-slate-800 overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] opacity-10 pointer-events-none">
                <GitPullRequest size={200} />
             </div>
             <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Aléatoire & Ciblé</span>
             </div>
             <h3 className="text-3xl font-black mt-6 tracking-tighter leading-tight uppercase">{currentLine.name}</h3>
             
             {!isTraining && status !== 'completed' && (
                <button onClick={() => { setIsTraining(true); startNewBranch(); }} className="mt-10 w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-4 active:scale-95">
                  <Play size={22} fill="white" /> Explorer l'Arbre
                </button>
             )}
             
             {isTraining && (
               <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} /> Séquence Active
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[60px] items-center p-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner overflow-hidden">
                    {moveHistory.length === 0 && <span className="text-[11px] text-slate-600 uppercase font-black tracking-widest">Lancement...</span>}
                    {moveHistory.map((move, i) => (
                      <React.Fragment key={i}>
                        <span className={`text-sm font-black ${i % 2 === 0 ? 'text-white' : 'text-slate-400'}`}>
                          {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''}{move}
                        </span>
                        {i < moveHistory.length - 1 && <ChevronRight size={12} className="text-slate-700" />}
                      </React.Fragment>
                    ))}
                  </div>
               </div>
             )}
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-8">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
               <Lightbulb size={18} className="text-amber-500" /> Guide de Branche
            </h4>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Coups attendus (Ligne Cible)</p>
               <div className="flex flex-wrap gap-2">
                 {(currentNode ? currentNode.children : currentLine.tree).map(node => (
                   <span key={node.id} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${targetLeafId && leadsToSpecificLeaf(node, targetLeafId) ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-105' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-40'}`}>
                     {node.san}
                   </span>
                 ))}
                 {(currentNode ? currentNode.children : currentLine.tree).length === 0 && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">Cible en vue</span>}
               </div>
            </div>

            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/20">
               <div className="flex justify-between items-center mb-5">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Map des Variantes</p>
                  <span className="text-[10px] font-black text-blue-600">{completedLeaves.length} / {totalLeafIds.length}</span>
               </div>
               <div className="flex flex-wrap gap-3">
                  {totalLeafIds.map((id) => (
                    <div key={id} className={`w-4 h-4 rounded-full transition-all duration-700 shadow-sm ${completedLeaves.includes(id) ? 'bg-emerald-500 scale-125 shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
