export type CalendarType = 'myanmar' | 'thai' | 'srilanka' | 'lunar';
export type PaliScript = 'roman' | 'sinhala' | 'burmese' | 'thai';
export type ThemeColor = 'saffron' | 'indigo' | 'emerald' | 'rose' | 'slate';

export interface Settings {
  calendarType: CalendarType;
  lat: number;
  lng: number;
  address?: string;
  timezone: string;
  dst: boolean;
  dawnMethod: string;
  language: string;
  paliScript: PaliScript;
  themeColor: ThemeColor;
  darkMode: boolean;
}
