import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { BoardTheme, PieceStyle } from '../types';

interface ChessBoardProps {
  fen?: string;
  onMove?: (move: Move) => void;
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  orientation?: 'white' | 'black';
  interactive?: boolean;
  soundEnabled?: boolean;
}

const PIECE_ASSETS: Record<PieceStyle, string> = {
  neo: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/',
  alpha: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/alpha/',
  classic: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/merida/',
  cburnett: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/'
};

const THEMES: Record<BoardTheme, { light: string, dark: string }> = {
  blue: { light: '#ebecd0', dark: '#779556' },
  green: { light: '#eeeed2', dark: '#769656' },
  wood: { light: '#decba4', dark: '#8b4513' },
  ocean: { light: '#e1e1e1', dark: '#5d8aa8' },
  forest: { light: '#e9edcc', dark: '#344e41' }
};

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  fen = 'start', 
  onMove, 
  boardTheme, 
  pieceStyle, 
  orientation = 'white',
  interactive = true,
  soundEnabled = true
}) => {
  const createGame = (f: string) => {
    try {
      return new Chess(f === 'start' || !f ? undefined : f);
    } catch (e) {
      return new Chess();
    }
  };

  const [game, setGame] = useState(createGame(fen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [dragSquare, setDragSquare] = useState<Square | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGame(createGame(fen));
    setSelectedSquare(null);
  }, [fen]);

  const getPieceUrl = (color: string, type: string) => {
    const piece = `${color}${type.toUpperCase()}`;
    return `${PIECE_ASSETS[pieceStyle]}${piece}.svg`;
  };

  const playSound = (isCapture = false) => {
    if (!soundEnabled) return;
    const url = isCapture 
      ? 'https://images.chesscomfiles.com/chess-themes/sounds/_standard_/capture.mp3'
      : 'https://images.chesscomfiles.com/chess-themes/sounds/_standard_/move-self.mp3';
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const makeMove = (from: Square, to: Square) => {
    if (!interactive) return false;
    try {
      const tempGame = new Chess(game.fen());
      const move = tempGame.move({ from, to, promotion: 'q' });
      if (move) {
        const isCapture = move.captured !== undefined;
        setGame(tempGame);
        setSelectedSquare(null);
        playSound(isCapture);
        if (onMove) onMove(move);
        return true;
      }
    } catch (e) {}
    return false;
  };

  const getSquareFromCoords = (x: number, y: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const cellSize = rect.width / 8;
    const col = Math.floor((x - rect.left) / cellSize);
    const row = Math.floor((y - rect.top) / cellSize);

    if (col < 0 || col > 7 || row < 0 || row > 7) return null;

    const files = orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    const ranks = orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

    return (files[col] + ranks[row]) as Square;
  };

  const startDrag = (clientX: number, clientY: number, square: Square, target: HTMLElement) => {
    if (!interactive) return;
    const piece = game.get(square);
    const isUserColor = piece?.color === (orientation === 'white' ? 'w' : 'b');
    
    if (selectedSquare) {
      if (makeMove(selectedSquare, square)) return;
      if (piece && isUserColor) {
        setSelectedSquare(square);
        setDragSquare(square);
      } else {
        setSelectedSquare(null);
      }
    } else if (piece && isUserColor) {
      setSelectedSquare(square);
      setDragSquare(square);
    }

    if (piece && isUserColor) {
      const rect = target.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
      setDragPosition({ x: clientX, y: clientY });
    }
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (dragSquare) {
      setDragPosition({ x: clientX, y: clientY });
    }
  };

  const endDrag = (clientX: number, clientY: number) => {
    if (!dragSquare) return;
    const targetSquare = getSquareFromCoords(clientX, clientY);
    if (targetSquare && targetSquare !== dragSquare) {
      makeMove(dragSquare, targetSquare);
    }
    setDragSquare(null);
  };

  // Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent, square: Square) => {
    startDrag(e.clientX, e.clientY, square, e.currentTarget as HTMLElement);
  };

  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent, square: Square) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, square, e.currentTarget as HTMLElement);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => endDrag(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (dragSquare) {
        // Prevent scrolling while dragging
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (dragSquare) {
        const touch = e.changedTouches[0];
        endDrag(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragSquare]);

  const board = game.board();
  const theme = THEMES[boardTheme] || THEMES.blue;
  const rows = orientation === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const cols = orientation === 'white' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const possibleMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }) : [];

  return (
    <div 
      ref={boardRef}
      className="relative aspect-square w-full select-none shadow-2xl rounded-lg overflow-hidden border-2 md:border-4 border-slate-900/10"
      style={{ touchAction: 'none' }}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {rows.map((r) => (
          cols.map((c) => {
            const piece = board[r][c];
            const squareName = (['a','b','c','d','e','f','g','h'][c] + (8-r)) as Square;
            const isLight = (r + c) % 2 === 0;
            const isSelected = selectedSquare === squareName;
            const isDragSource = dragSquare === squareName;
            
            const moveInfo = possibleMoves.find(m => m.to === squareName);
            const isTarget = !!moveInfo;
            const isCapture = moveInfo && (game.get(squareName) !== null || moveInfo.flags.includes('e'));

            return (
              <div 
                key={squareName}
                onMouseDown={(e) => handleMouseDown(e, squareName)}
                onTouchStart={(e) => handleTouchStart(e, squareName)}
                className="relative flex items-center justify-center transition-colors duration-150"
                style={{ 
                  backgroundColor: isSelected ? '#f59e0b88' : (isLight ? theme.light : theme.dark)
                }}
              >
                {isTarget && !isCapture && (
                  <div className={`absolute w-1/4 h-1/4 rounded-full z-10 pointer-events-none ${isLight ? 'bg-black/15' : 'bg-white/20'}`}></div>
                )}
                {isTarget && isCapture && (
                  <div className={`absolute w-[80%] h-[80%] border-2 md:border-4 rounded-full z-10 pointer-events-none ${isLight ? 'border-black/10' : 'border-white/15'}`}></div>
                )}

                {piece && !isDragSource && (
                  <img 
                    src={getPieceUrl(piece.color, piece.type)} 
                    alt="" 
                    draggable="false"
                    className="w-[95%] h-[95%] pointer-events-none select-none drop-shadow-md" 
                  />
                )}

                {c === (orientation === 'white' ? 0 : 7) && (
                  <span className={`absolute top-0.5 left-0.5 text-[7px] md:text-[8px] font-bold pointer-events-none ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {8-r}
                  </span>
                )}
                {r === (orientation === 'white' ? 7 : 0) && (
                  <span className={`absolute bottom-0.5 right-0.5 text-[7px] md:text-[8px] font-bold pointer-events-none ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {['a','b','c','d','e','f','g','h'][c]}
                  </span>
                )}
              </div>
            );
          })
        ))}
      </div>

      {dragSquare && (() => {
        const piece = game.get(dragSquare);
        if (!piece) return null;
        return (
          <div 
            className="fixed pointer-events-none z-[100] flex items-center justify-center"
            style={{ 
              left: dragPosition.x - dragOffset.x, 
              top: dragPosition.y - dragOffset.y,
              width: boardRef.current ? boardRef.current.offsetWidth / 8 : 0,
              height: boardRef.current ? boardRef.current.offsetWidth / 8 : 0
            }}
          >
            <img 
               src={getPieceUrl(piece.color, piece.type)} 
               alt="" 
               draggable="false"
               className="w-[110%] h-[110%] drop-shadow-2xl scale-125"
            />
          </div>
        );
      })()}
    </div>
  );
};

export default ChessBoard;