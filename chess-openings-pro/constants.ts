
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
        children: [
          {
            id: 'r2',
            san: 'c5',
            children: [
              {
                id: 'r3',
                san: 'Nf3',
                children: [
                  {
                    id: 'r4',
                    san: 'd6',
                    children: [
                      {
                        id: 'r5',
                        san: 'd4',
                        children: [
                          {
                            id: 'r6',
                            san: 'cxd4',
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