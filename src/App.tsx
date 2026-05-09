import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  Wind, 
  Timer, 
  BookOpen, 
  Info
} from 'lucide-react';
import { ThaiCalendar } from './lib/calendar/ThaiCalendar';
import { MyanmarCalendar } from './lib/calendar/MyanmarCalendar';
import { AstroLunarCalendar } from './lib/calendar/AstroLunarCalendar';
import { SunTimesCalculator } from './lib/calendar/SunTimesCalculator';
import { cn } from './lib/utils';

// New specialized components and hooks
import { Settings, CalendarType } from './types';
import { useI18n } from './hooks/useI18n';
import { SettingsModal } from './components/SettingsModal';
import { CalendarScreen } from './screens/CalendarScreen';
import { MeditationScreen } from './screens/MeditationScreen';
import { CSS_VARS } from './theme/index';

export default function App() {
  const { t } = useI18n();
  
  // Persistence
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('iit_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new settings have defaults
      return {
        calendarType: 'thai',
        lat: 6.9271,
        lng: 79.8612,
        dawnMethod: 'astrology',
        language: 'en',
        paliScript: 'roman',
        themeColor: 'saffron',
        darkMode: false,
        fontSize: 'normal',
        ...parsed
      };
    }
    return {
      calendarType: 'thai',
      lat: 6.9271,
      lng: 79.8612,
      dawnMethod: 'astrology',
      language: 'en',
      paliScript: 'roman',
      themeColor: 'saffron',
      darkMode: false,
      fontSize: 'normal',
    };
  });

  useEffect(() => {
    localStorage.setItem('iit_settings', JSON.stringify(settings));
    
    // Apply theme
    const root = document.documentElement;
    root.classList.toggle('dark', settings.darkMode);
    
    // Apply font size
    if (settings.fontSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else if (settings.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
    
    // Set theme colors (Tailwind variables)
    const colors: Record<string, string> = {
      saffron: '#7f5700',
      indigo: '#6366f1',
      emerald: '#10b981',
      rose: '#f43f5e',
      slate: '#475569'
    };
    
    root.style.setProperty('--saffron', colors[settings.themeColor]);
  }, [settings]);

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [activeTab, setActiveTab] = React.useState('calendar');
  const [showSettings, setShowSettings] = React.useState(false);
  
  // Choose engine based on settings
  const calendarEngine = useMemo(() => {
    const config = { lat: settings.lat, lng: settings.lng };
    switch (settings.calendarType) {
      case 'myanmar': return new MyanmarCalendar(config);
      case 'thai': return new ThaiCalendar(config);
      case 'srilanka': return new AstroLunarCalendar(config);
      case 'lunar': return new AstroLunarCalendar(config);
      default: return new ThaiCalendar(config);
    }
  }, [settings]);
  
  const sunCalc = useMemo(() => new SunTimesCalculator(settings.lat, settings.lng), [settings.lat, settings.lng]);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSettings(s => ({ ...s, lat: latitude, lng: longitude, address: 'Current Location' }));
      },
      (err) => {
        console.error(err);
        alert("Could not get location. Ensure permissions are granted.");
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-sans transition-colors duration-500" style={{ backgroundColor: 'var(--bg-main)' }}>
      <style>{CSS_VARS}</style>
      
      {/* Top App Bar */}
      <header className="px-6 py-8 flex justify-between items-center relative z-[60]" style={{ backgroundColor: 'var(--bg-header)' }}>
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.9, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-saffron shadow-lg shadow-saffron/5 border border-white dark:border-slate-700"
          >
            <Wind size={28} />
          </motion.div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight leading-none italic" style={{ color: 'var(--text-primary)' }}>IIT Calendar</h1>
            <p className="text-sm font-black uppercase tracking-widest mt-1" style={{ color: 'var(--text-secondary)' }}>
              {settings.calendarType === 'srilanka' ? t('calendar.srilanka') : settings.calendarType} • {t('calendar.mode')}
            </p>
            {settings.address && (
              <p className="text-sm font-medium opacity-60 mt-0.5 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>
                {settings.address}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-full shadow-sm border border-white dark:border-slate-700 transition-colors"
          style={{ backgroundColor: 'var(--btn-header-bg)', color: 'var(--btn-header-text)' }}
        >
          <SettingsIcon size="1.25em" />
        </button>
      </header>

      <main className="flex-1 px-6 pb-32">
        {activeTab === 'calendar' && (
          <CalendarScreen 
            settings={settings}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            calendarEngine={calendarEngine}
            sunCalc={sunCalc}
          />
        )}
        
        <div className={cn(activeTab !== 'meditation' && "hidden")}>
          <MeditationScreen />
        </div>

        {activeTab === 'chants' && <PlaceholderTab icon={<Wind size={64} />} title={t('common.chants')} text="Digital library of sacred vibrations and Pali recitations." />}
        {activeTab === 'study' && <PlaceholderTab icon={<BookOpen size={64} />} title={t('common.study')} text="Deepen your understanding with digital manuscripts and teachings." />}
      </main>

      <SettingsModal 
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={setSettings}
        onGetLocation={getCurrentLocation}
      />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card px-6 py-5 rounded-t-[2.5rem] flex justify-around items-center border-t border-white/80 bg-white/70 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] backdrop-blur-3xl">
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={22}/>} label={t('common.calendar')} />
        <NavButton active={activeTab === 'meditation'} onClick={() => setActiveTab('meditation')} icon={<Timer size={22}/>} label={t('common.stillness')} />
        <NavButton active={activeTab === 'chants'} onClick={() => setActiveTab('chants')} icon={<Wind size={22}/>} label={t('common.chants')} />
        <NavButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<BookOpen size={22}/>} label={t('common.study')} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 relative group min-w-[64px]">
      <div className={cn(
        "transition-all duration-300",
        active ? "text-saffron scale-110" : "text-slate-400 group-hover:text-slate-600"
      )}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: '1.4em' } as any) : icon}
      </div>
      <span className={cn(
        "text-sm font-black uppercase tracking-widest transition-all",
        active ? "text-slate-700 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-60"
      )}>{label}</span>
      {active && <motion.div layoutId="nav" className="absolute -bottom-1 w-1 h-1 bg-saffron rounded-full" />}
    </button>
  );
}

function PlaceholderTab({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-32 h-32 rounded-full bg-saffron/5 flex items-center justify-center text-saffron/20 mb-8">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: '4em' } as any) : icon}
      </div>
      <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{title}</h2>
      <p className="text-slate-400 max-w-sm leading-relaxed">{text}</p>
      <button className="mt-10 px-8 py-4 bg-white rounded-full text-sm font-black text-saffron uppercase tracking-widest border border-saffron/20 shadow-sm active:scale-95 transition-all">Coming Soon</button>
    </motion.div>
  );
}
