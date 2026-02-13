
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

// Structure arborescente pour les coups
export interface MoveNode {
  id: string;
  san: string; // ex: "e4", "Nf3"
  comment?: string;
  children: MoveNode[]; // children[0] est la ligne principale, les autres sont des variantes
  parentId?: string; // Pour remonter facilement
}

export interface OpeningLine {
  id: string;
  name: string;
  color: ChessColor;
  pgn: string; // Stockage du texte source pour édition
  tree: MoveNode[]; 
  comments: string;
  notes: string;
  masteryScore: number; 
  errorsCount: number;
  lastReview: string; 
  nextReview: string; 
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
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

export interface Stats {
  masteryPercentage: number;
  totalLines: number;
  solidLines: number;
  weakLines: number;
  reliabilityScore: number;
}
