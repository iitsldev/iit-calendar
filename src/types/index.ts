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
