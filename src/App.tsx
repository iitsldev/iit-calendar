import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  Wind, 
  Timer, 
  BookOpen,
  Book,
  Info,
  User as UserIcon
} from 'lucide-react';
import { ThaiCalendar } from './lib/calendar/ThaiCalendar';
import { MyanmarCalendar } from './lib/calendar/MyanmarCalendar';
import { SriLankanCalendar } from './lib/calendar/SriLankanCalendar';
import { TraditionalLunarCalendar } from './lib/calendar/TraditionalLunarCalendar';
import { SunTimesCalculator } from './lib/calendar/SunTimesCalculator';
import { cn } from './lib/utils';

// New specialized components and hooks
import { Settings, CalendarType } from './types';
import { useI18n } from './hooks/useI18n';
import { SettingsModal } from './components/SettingsModal';
import { CalendarScreen } from './screens/CalendarScreen';
import { MeditationScreen } from './screens/MeditationScreen';
import { ChantsScreen } from './screens/ChantsScreen';
import { StudyScreen } from './screens/StudyScreen';
import { BookScreen } from './screens/BookScreen';
import { CSS_VARS } from './theme/index';
import { notificationService } from './services/NotificationService';
import { useUI } from './UIContext';
import { App as CapApp } from '@capacitor/app';

export default function App() {
  const { t } = useI18n();
  
  // Persistence
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('iit_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new settings have defaults
      return {
        calendarType: 'srilanka',
        lat: 6.9271,
        lng: 79.8612,
        dawnMethod: 'astrology',
        language: 'en',
        paliScript: 'roman',
        themeColor: 'saffron',
        darkMode: false,
        fontSize: 16,
        solarNoonBell: false,
        dawnBell: false,
        ...parsed
      };
    }
    return {
      calendarType: 'srilanka',
      lat: 6.9271,
      lng: 79.8612,
      dawnMethod: 'astrology',
      language: 'en',
      paliScript: 'roman',
      themeColor: 'saffron',
      darkMode: false,
      fontSize: 16,
      solarNoonBell: false,
      dawnBell: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('iit_settings', JSON.stringify(settings));
    
    // Apply theme
    const root = document.documentElement;
    root.classList.toggle('dark', settings.darkMode);
    
    // Apply font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Set theme colors (Tailwind variables)
    const colors: Record<string, string> = {
      saffron: '#7f5700',
      indigo: '#6366f1',
      emerald: '#10b981',
      rose: '#f43f5e',
      slate: '#475569'
    };
    
    root.style.setProperty('--accent', colors[settings.themeColor]);

    // Refresh notifications when settings change
    notificationService.refreshAll(settings);
  }, [settings]);

  useEffect(() => {
    // Initial refresh
    notificationService.refreshAll(settings);

    // Listen for app state changes (resume)
    const listener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        notificationService.refreshAll(settings);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [activeTab, setActiveTab] = React.useState('calendar');
  const { showSettings, setShowSettings } = useUI();
  
  // Choose engine based on settings
  const calendarEngine = useMemo(() => {
    const config = { lat: settings.lat, lng: settings.lng };
    switch (settings.calendarType) {
      case 'myanmar': return new MyanmarCalendar(config);
      case 'thai': return new ThaiCalendar(config);
      case 'srilanka': return new SriLankanCalendar(config);
      case 'lunar': return new TraditionalLunarCalendar(config);
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
    <div 
      className="flex flex-col min-h-screen font-sans transition-colors duration-500 UT" 
      lang={settings.language}
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <style>{CSS_VARS}</style>
      
      {/* Top App Bar */}
      <header
        className="px-5 py-3 flex justify-between items-center relative z-[60] rounded-lg border shadow-sm mb-4"
        style={{ backgroundColor: 'var(--bg-header)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-3">
          {/* Compact logo mark */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
          >
            <img src="/logo.png" alt="IIT Logo" className="w-16 h-16 object-contain" />
          </div>

          {/* Title + subtitle */}
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[17px] font-medium tracking-tight leading-none"
              style={{ color: 'var(--text-primary)' }}
            >
              IIT Calendar
            </span>
            <span
              className="text-[11px] uppercase tracking-widest leading-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              {settings.calendarType === 'srilanka' ? t('calendar.srilanka') : settings.calendarType}
              {' · '}{t('calendar.mode')}
               {settings.address && (
                <p className="text-sm font-medium opacity-60 mt-0.5 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {settings.address}
                </p>
              )}
            </span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
          style={{
            borderColor: 'var(--color-border-tertiary, rgba(0,0,0,0.12))',
            color: 'var(--btn-header-text)',
            backgroundColor: 'transparent',
          }}
          aria-label="Settings"
        >
          <SettingsIcon size={17} />
        </button>
      </header>

      <main className="flex-1 px-3 pb-32">
        {activeTab === 'calendar' && (
          <CalendarScreen 
            settings={settings}
            onUpdateSettings={setSettings}
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

        {activeTab === 'chants' && <ChantsScreen settings={settings} />}
        {activeTab === 'study' && <StudyScreen />}
        {activeTab === 'book' && <BookScreen settings={settings} />}
      </main>

      <SettingsModal 
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={setSettings}
        onGetLocation={getCurrentLocation}
      />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card px-6 py-5 rounded-t-[2.5rem] flex justify-around items-center border-t border-white/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] backdrop-blur-3xl overflow-x-auto">
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={22}/>} label={t('common.calendar') || 'Calendar'} />
        <NavButton active={activeTab === 'meditation'} onClick={() => setActiveTab('meditation')} icon={<Timer size={22}/>} label={t('common.stillness') || 'Stillness'} />
        <NavButton active={activeTab === 'chants'} onClick={() => setActiveTab('chants')} icon={<Wind size={22}/>} label={t('common.chants') || 'Chants'} />
        <NavButton active={activeTab === 'book'} onClick={() => setActiveTab('book')} icon={<Book size={22}/>} label={t('common.book') || 'Book'} />
        <NavButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<BookOpen size={22}/>} label={t('common.study') || 'Study'} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 relative group min-w-[64px]">
      <div className={cn(
        "transition-all duration-300",
        active ? "text-saffron scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
      )}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: '1.4em' } as any) : icon}
      </div>
      <span className={cn(
        "text-sm font-black uppercase tracking-widest transition-all",
        active ? "text-slate-700 dark:text-slate-300 opacity-100" : "text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-60"
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
      <div className="w-[192px] h-[192px] flex items-center justify-center mb-8 overflow-hidden">
        <img src="/logo.png" alt="IIT Logo" className="w-[144px] h-[144px] object-contain opacity-20" />
      </div>          <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">{title}</h2>
      <p className="text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">{text}</p>
      <button className="mt-10 px-8 py-4 bg-white dark:bg-slate-800 rounded-full text-sm font-black text-saffron uppercase tracking-widest border border-saffron/20 shadow-sm active:scale-95 transition-all">Coming Soon</button>
    </motion.div>
  );
}
