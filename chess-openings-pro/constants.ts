
import { OpeningLine, UserProfile, UserSettings } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  bgColor: 'slate',
  soundEnabled: true,
  soundVolume: 70,
  boardTheme: 'blue',
  pieceStyle: 'neo'
};

export const INITIAL_PROFILE: UserProfile = {
  username: "",
  email: "",
  lichessUsername: "",
  lichessAccessToken: "",
  isLichessConnected: false,
  elo: 1500,
  level: 1,
  xp: 0,
  hasOnboarded: false,
  isLoggedIn: false,
  streak: 0
};

export const MOCK_LINES: OpeningLine[] = [
  {
    id: '1',
    name: 'Sicilienne Najdorf',
    color: 'black',
    // Added missing pgn property to satisfy OpeningLine interface requirement
    pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4',
    tree: [
      {
        id: 'r1',
        san: 'e4',
        // Added missing fen property
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        children: [
          {
            id: 'r2',
            san: 'c5',
            // Added missing fen property
            fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
            children: [
              {
                id: 'r3',
                san: 'Nf3',
                // Added missing fen property
                fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
                children: [
                  {
                    id: 'r4',
                    san: 'd6',
                    // Added missing fen property
                    fen: 'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
                    children: [
                      {
                        id: 'r5',
                        san: 'd4',
                        // Added missing fen property
                        fen: 'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3',
                        children: [
                          {
                            id: 'r6',
                            san: 'cxd4',
                            // Added missing fen property
                            fen: 'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4',
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    comments: 'Ligne principale de la Najdorf.',
    notes: '',
    masteryScore: 85,
    errorsCount: 2,
    lastReview: new Date().toISOString(),
    nextReview: new Date(Date.now() + 86400000).toISOString(),
    difficulty: 'hard',
    tags: ['tactique']
  }
];
