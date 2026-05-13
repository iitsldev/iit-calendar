export type CalendarType = 'myanmar' | 'thai' | 'srilanka' | 'lunar';
export type PaliScript = 'roman' | 'sinhala' | 'burmese' | 'thai';
export type ThemeColor = 'saffron' | 'indigo' | 'emerald' | 'rose' | 'slate';
export type FontSize = number;

export interface Settings {
  calendarType: CalendarType;
  lat: number;
  lng: number;
  address?: string;
  dawnMethod: string;
  language: string;
  paliScript: PaliScript;
  themeColor: ThemeColor;
  darkMode: boolean;
  fontSize: FontSize;
  solarNoonBell: boolean;
}

export interface Chant {
  id: string;
  title: string;
  content?: string;
  category?: string;
}

export interface UserChant extends Chant {
  totalCount: number;
  lastUsed?: number; // timestamp
  isCustom?: boolean;
  milestone?: number;
}

export interface ChantSession {
  id: string;
  chantId: string;
  count: number;
  timestamp: number;
}

export interface UserChantStats {
  totalSessions: number;
  streakDays: number;
  lastSessionDate?: string;
  distribution: Record<string, number>; // chantId -> total count
}
