
import { OpeningLine, UserProfile, UserSettings } from '../types';
import { MOCK_LINES, INITIAL_PROFILE, DEFAULT_SETTINGS } from '../constants';

const KEY_LINES = 'gm_prep_lines';
const KEY_PROFILE = 'gm_prep_profile';
const KEY_SETTINGS = 'gm_prep_settings';

export const storageService = {
  getLines: (): OpeningLine[] => {
    const data = localStorage.getItem(KEY_LINES);
    if (!data) {
      // Si c'est la première fois, on initialise avec les mock lines
      localStorage.setItem(KEY_LINES, JSON.stringify(MOCK_LINES));
      return MOCK_LINES;
    }
    return JSON.parse(data);
  },

  saveLines: (lines: OpeningLine[]) => {
    localStorage.setItem(KEY_LINES, JSON.stringify(lines));
  },

  getProfile: (): UserProfile => {
    const data = localStorage.getItem(KEY_PROFILE);
    return data ? JSON.parse(data) : INITIAL_PROFILE;
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
  },

  getSettings: (): UserSettings => {
    const data = localStorage.getItem(KEY_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  },

  addLine: (line: OpeningLine) => {
    const lines = storageService.getLines();
    const updated = [line, ...lines];
    storageService.saveLines(updated);
    return updated;
  },

  deleteLine: (id: string) => {
    const lines = storageService.getLines();
    const newLines = lines.filter(l => l.id !== id);
    storageService.saveLines(newLines);
    return newLines;
  },

  updateLine: (id: string, updates: Partial<OpeningLine>) => {
    const lines = storageService.getLines();
    const newLines = lines.map(l => l.id === id ? { ...l, ...updates } : l);
    storageService.saveLines(newLines);
    return newLines;
  }
};
