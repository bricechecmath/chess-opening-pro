
export type ChessColor = 'white' | 'black';
export type AppTheme = 'light' | 'dark';
export type BoardTheme = 'blue' | 'green' | 'wood' | 'ocean' | 'forest';
export type PieceStyle = 'neo' | 'alpha' | 'classic' | 'cburnett';
export type BgColor = 'slate' | 'zinc' | 'neutral' | 'blue';

export interface UserSettings {
  theme: AppTheme;
  bgColor: BgColor;
  soundEnabled: boolean;
  soundVolume: number;
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
}

export interface MoveNode {
  id: string;
  san: string;
  fen: string; // The FEN after this move is played
  comment?: string;
  children: MoveNode[];
  parentId?: string;
}

export interface OpeningLine {
  id: string;
  name: string;
  color: ChessColor;
  pgn: string;
  tree: MoveNode[]; 
  comments: string;
  notes: string;
  masteryScore: number; 
  errorsCount: number;
  lastReview: string; 
  nextReview: string; 
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lichessUrl?: string;
}

export interface Stats {
  masteryPercentage: number;
  totalLines: number;
  solidLines: number;
  weakLines: number;
  reliabilityScore: number;
}

export interface UserProfile {
  username: string;
  email?: string;
  lichessUsername?: string;
  lichessAccessToken?: string;
  isLichessConnected: boolean;
  elo: number;
  level: number;
  xp: number;
  hasOnboarded: boolean;
  isLoggedIn: boolean;
  streak: number;
  isDev?: boolean;
}
