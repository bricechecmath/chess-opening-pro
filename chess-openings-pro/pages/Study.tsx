
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { OpeningLine, UserSettings, UserProfile, MoveNode } from '../types';
import { Play, ChevronLeft, CheckCircle2, Lightbulb, Zap, GitPullRequest, Layers, Target, Trophy, ChevronRight, History, RotateCcw } from 'lucide-react';
import ChessBoard from '../components/ChessBoard';
import { Move } from 'chess.js';
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
  const [currentLeafIndex, setCurrentLeafIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'error' | 'success' | 'completed' | 'switching'>('idle');
  const [feedback, setFeedback] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  const isTransitioningRef = useRef(false);
  const computerTimeoutRef = useRef<number | null>(null);

  const currentLine = useMemo(() => lines.find(l => l.id === selectedLineId), [lines, selectedLineId]);

  // Récupération récursive de toutes les fins de variantes
  const getLeaves = (nodes: MoveNode[]): string[] => {
    let leaves: string[] = [];
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        leaves.push(node.id);
      } else {
        leaves.push(...getLeaves(node.children));
      }
    }
    return leaves;
  };

  const totalLeafIds = useMemo(() => {
    if (!currentLine?.tree || currentLine.tree.length === 0) return [];
    return Array.from(new Set(getLeaves(currentLine.tree)));
  }, [currentLine]);

  const targetLeafId = useMemo(() => totalLeafIds[currentLeafIndex] || null, [totalLeafIds, currentLeafIndex]);

  const leadsToLeaf = useCallback((node: MoveNode, leafId: string): boolean => {
    if (node.id === leafId) return true;
    return (node.children || []).some(child => leadsToLeaf(child, leafId));
  }, []);

  const startBranch = useCallback((index: number, isAuto = false) => {
    if (!currentLine) return;
    
    if (totalLeafIds.length === 0) {
      setFeedback("Erreur : L'arbre est vide après analyse.");
      return;
    }
    
    const targetId = totalLeafIds[index];
    if (!targetId) {
      finishStudy();
      return;
    }

    setCurrentLeafIndex(index);
    setStatus('idle');
    setCurrentNode(null);
    setCurrentFen('start');
    setMoveHistory([]);
    setFeedback(isAuto ? 'Nouvelle variante...' : 'À vous de jouer !');
    isTransitioningRef.current = false;

    // Si on étudie les Noirs, l'ordinateur fait le premier coup
    if (currentLine.color === 'black') {
      const firstMove = currentLine.tree.find(n => leadsToLeaf(n, targetId));
      if (firstMove) {
        setStatus('waiting');
        computerTimeoutRef.current = window.setTimeout(() => {
          setCurrentNode(firstMove);
          setCurrentFen(firstMove.fen);
          setMoveHistory([firstMove.san]);
          setStatus('idle');
          if (firstMove.children.length === 0) handleLeafReached(index);
        }, 600);
      }
    }
  }, [currentLine, totalLeafIds, leadsToLeaf]);

  const handleUserMove = (move: Move) => {
    if (!isTraining || !currentLine || !targetLeafId || isTransitioningRef.current || status === 'error' || status === 'switching') return;

    const candidates = currentNode ? currentNode.children : currentLine.tree;
    const expectedNode = candidates.find(n => leadsToLeaf(n, targetLeafId));
    const matchedNode = candidates.find(n => n.san === move.san);

    if (matchedNode) {
      // Si le coup est bon mais appartient à une autre branche, on pivote dynamiquement
      if (matchedNode.id !== expectedNode?.id) {
        const newBranchIdx = totalLeafIds.findIndex(id => leadsToLeaf(matchedNode, id));
        if (newBranchIdx !== -1) setCurrentLeafIndex(newBranchIdx);
      }

      setCurrentNode(matchedNode);
      setCurrentFen(matchedNode.fen);
      setMoveHistory(prev => [...prev, matchedNode.san]);
      setFeedback('Excellent !');

      if (matchedNode.children.length === 0) {
        handleLeafReached(currentLeafIndex);
      } else {
        playComputerMove(matchedNode);
      }
    } else {
      setStatus('error');
      setErrorCount(prev => prev + 1);
      const hint = expectedNode?.san || "un coup du répertoire";
      setFeedback(`Faux. Jouez : ${hint}`);
      
      const lastFen = currentFen;
      setTimeout(() => {
        setCurrentFen(' ' + lastFen); 
        setTimeout(() => { setCurrentFen(lastFen); setStatus('idle'); }, 50);
      }, 1200);
    }
  };

  const playComputerMove = (fromNode: MoveNode) => {
    if (isTransitioningRef.current) return;
    setStatus('waiting');
    
    computerTimeoutRef.current = window.setTimeout(() => {
      const currentTargetId = totalLeafIds[currentLeafIndex];
      const nextNode = fromNode.children.find(n => leadsToLeaf(n, currentTargetId)) || fromNode.children[0];
      
      if (nextNode) {
        setCurrentNode(nextNode);
        setCurrentFen(nextNode.fen);
        setMoveHistory(prev => [...prev, nextNode.san]);
        setStatus('idle');
        if (nextNode.children.length === 0) handleLeafReached(currentLeafIndex);
      }
    }, 600);
  };

  const handleLeafReached = (index: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setStatus('switching');

    setTimeout(() => {
      if (index >= totalLeafIds.length - 1) {
        finishStudy();
      } else {
        startBranch(index + 1, true);
      }
    }, 1000);
  };

  const finishStudy = () => {
    setStatus('completed');
    setIsTraining(false);
    isTransitioningRef.current = false;
    
    if (currentLine) {
        const bonus = errorCount === 0 ? 15 : 5;
        storageService.updateLine(currentLine.id, {
            masteryScore: Math.min(100, (currentLine.masteryScore || 0) + bonus),
            lastReview: new Date().toISOString()
        });
    }
  };

  const reset = () => {
    setSelectedLineId(null);
    setIsTraining(false);
    setStatus('idle');
    if (computerTimeoutRef.current) clearTimeout(computerTimeoutRef.current);
  };

  if (!selectedLineId) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 animate-in fade-in duration-500">
        <div className="text-center space-y-4 pt-10">
          <div className="inline-flex p-6 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl mb-6">
            <Target size={48} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Entraînement</h2>
          <p className="text-slate-500 font-medium">Choisissez une étude pour pratiquer vos lignes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lines.map((line) => (
            <button 
              key={line.id}
              onClick={() => setSelectedLineId(line.id)}
              className="group text-left bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm active:scale-95"
            >
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${line.color === 'white' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white shadow-xl'}`}>
                <Zap size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">{line.name}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">{line.color === 'white' ? 'Blancs' : 'Noirs'}</p>
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                 <span className="text-slate-400">Score</span>
                 <span className="text-blue-600">{line.masteryScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${line.masteryScore}%` }}></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const progress = totalLeafIds.length > 0 ? Math.round((currentLeafIndex / totalLeafIds.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20 px-2">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
        <button onClick={reset} className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
          <ChevronLeft size={18} /> Quitter
        </button>
        <div className="flex-1 mx-12">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5 text-slate-400">
              <span className="text-blue-600">Progrès</span>
              <span>{currentLeafIndex + 1}/{totalLeafIds.length} Lignes</span>
           </div>
           <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden flex flex-col items-center">
          {status === 'completed' && (
            <div className="absolute inset-0 z-50 bg-emerald-600 flex flex-col items-center justify-center text-white p-12 text-center animate-in fade-in duration-500">
               <Trophy size={100} className="mb-8 animate-bounce" />
               <h3 className="text-5xl font-black mb-4 tracking-tighter uppercase">Terminé !</h3>
               <p className="text-emerald-100 mb-12 text-lg font-medium">Toutes les branches ont été mémorisées.</p>
               <button onClick={reset} className="w-full max-w-xs py-6 bg-white text-emerald-600 rounded-2xl font-black uppercase text-xs hover:shadow-2xl transition-all">Quitter</button>
            </div>
          )}

          {status === 'switching' && (
             <div className="absolute inset-0 z-40 bg-blue-600/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in zoom-in duration-300 text-center p-8">
                <RotateCcw size={64} className="mb-6 animate-spin-slow" />
                <h4 className="text-3xl font-black uppercase tracking-tighter">Variante Validée</h4>
                <p className="text-blue-100 text-[11px] font-black uppercase tracking-widest mt-3">Préparation de la suivante...</p>
             </div>
          )}

          <div className="w-full max-w-[500px] shadow-2xl rounded-2xl overflow-hidden border-8 border-slate-100 dark:border-slate-900">
            <ChessBoard 
              fen={currentFen}
              onMove={handleUserMove}
              boardTheme={settings.boardTheme}
              pieceStyle={settings.pieceStyle}
              orientation={currentLine.color}
              interactive={isTraining && status !== 'switching' && status !== 'completed'}
              soundEnabled={settings.soundEnabled}
            />
          </div>
          
          <div className="mt-8 min-h-[56px] flex items-center justify-center">
             {feedback && status !== 'switching' && (
               <div className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl animate-in slide-in-from-bottom-4 ${status === 'error' ? 'bg-red-500 animate-shake' : 'bg-blue-600'}`}>
                 {feedback}
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative border border-slate-800 overflow-hidden">
             <h3 className="text-3xl font-black mt-6 tracking-tighter leading-tight uppercase">{currentLine.name}</h3>
             {!isTraining && status !== 'completed' && (
                <button onClick={() => { setIsTraining(true); startBranch(0); }} className="mt-10 w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-4 active:scale-95">
                  <Play size={22} fill="white" /> Lancer le Drill
                </button>
             )}
             {isTraining && (
               <div className="mt-10 space-y-6">
                  <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">
                    Notation
                  </p>
                  <div className="flex flex-wrap gap-2 min-h-[80px] p-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner overflow-y-auto max-h-40 no-scrollbar">
                    {moveHistory.map((move, i) => (
                      <span key={i} className={`text-sm font-black ${i % 2 === 0 ? 'text-white' : 'text-slate-400'}`}>
                        {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''}{move}
                      </span>
                    ))}
                  </div>
               </div>
             )}
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 mb-6">
               <Lightbulb size={18} className="text-amber-500" /> Indices
            </h4>
            <div className="flex flex-wrap gap-2">
              {(currentNode ? currentNode.children : currentLine.tree).map(node => (
                <span key={node.id} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${targetLeafId && leadsToLeaf(node, targetLeafId) ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-20'}`}>
                  {node.san}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
