import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, RotateCcw, Volume2, Activity, Award, Clock, Settings2, X, Minus, Plus, Pause, Sun, ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInDays, startOfDay, subDays, isSameDay, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { alarmService, ActiveMeditation } from '../services/alarm/AlarmService';
import { meditationService } from '../services/MeditationService';
import { useI18n } from '../hooks/useI18n';
import { useUI } from '../UIContext';

interface MeditationSession {
  id: string;
  date: string;
  durationMin: number;
}

interface MeditationStats {
  sessions: MeditationSession[];
}

export function MeditationScreen() {
  const { t } = useI18n();
  const { setShowSettings: setShowGlobalSettings } = useUI();
  const loadStats = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zen_meditation_stats');
      return saved ? JSON.parse(saved) : { sessions: [] };
    }
    return { sessions: [] };
  };

  const [stats, setStats] = useState<MeditationStats>(loadStats);
  const [isPaused, setIsPaused] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  const [chartView, setChartView] = useState<'day' | 'week' | 'month'>('day');
  const [chartOffset, setChartOffset] = useState(0);

  const toggleWakeLock = async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLock) {
        await wakeLock.release();
        setWakeLock(null);
      } else {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        lock.addEventListener('release', () => setWakeLock(null));
      }
    } catch (err) {
      console.error('Wake Lock failed:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [wakeLock]);

  const [settings, setSettings] = useState({
    durationHours: 0,
    durationMinutes: 15,
    intervalMinutes: 0,
    intervalSeconds: 0,
    soundEnabled: true,
    delaySeconds: 5,
    bellType: 'bowl',
  });

  const totalDurationMin = (settings.durationHours || 0) * 60 + (settings.durationMinutes || 0);
  const totalDurationMs = totalDurationMin * 60 * 1000;
  const intervalMs = ((settings.intervalMinutes || 0) * 60 + (settings.intervalSeconds || 0)) * 1000;

  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const lastTickRef = useRef<number>(Date.now());

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const init = async () => {
      await alarmService.requestPermission();
      
      // Reconcile sessions that finished in background
      await alarmService.recheckMeditation();
      
      // Check for existing session
      const savedActive = localStorage.getItem('active_meditation');

      if (savedActive) {
        const active: ActiveMeditation = JSON.parse(savedActive);
        const elapsed = Date.now() - active.startTime;
        if (elapsed < active.durationMs) {
          setRemainingMs(active.durationMs - elapsed);
          setIsRunning(true);
        } else {
          const savedStats = localStorage.getItem('zen_meditation_stats');
          if (savedStats) setStats(JSON.parse(savedStats));
          setRemainingMs(totalDurationMs);
          setIsRunning(false);
        }
      }
    };

    init();
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBell = (type: string = settings.bellType) => {
    if (!settings.soundEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const now = ctx.currentTime;
    let fundamental = 523.25; // C5
    let partials = [1, 1.503, 1.997, 2.502, 3.011];
    let duration = 4;

    if (type === 'gong') {
      fundamental = 130.81; // C3
      partials = [1, 2.05, 3.1, 4.2];
      duration = 6;
    } else if (type === 'chime') {
      fundamental = 1046.5; // C6
      partials = [1, 1.2, 1.5];
      duration = 2;
    } else if (type === 'tibetan') {
      fundamental = 261.63; // C4
      partials = [1, 1.8, 2.7, 5.4];
      duration = 5;
    } else if (type === 'woodblock') {
      fundamental = 800;
      partials = [1, 1.5];
      duration = 0.2;
    } else if (type === 'bell') {
      fundamental = 880; // A5
      partials = [1, 2, 3];
      duration = 3;
    }
    
    partials.forEach((p, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(fundamental * p, now);
      gain.gain.setValueAtTime(0.15 / partials.length, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration + i * 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 1);
    });
  };

  // Setup Initial Time when settings change
  useEffect(() => {
    if (!isRunning && !isPaused && !isFinished && countdown === 0) {
      setRemainingMs(totalDurationMs);
    }
  }, [totalDurationMs, isRunning, isPaused, isFinished, countdown]);

  // Main Timer Logic (Includes delay countdown)
  useEffect(() => {
    let countdownInterval: number | null = null;

    if (isRunning) {
      if (countdown > 0) {
        lastTickRef.current = Date.now();
        countdownInterval = window.setInterval(() => {
          const now = Date.now();
          const delta = now - lastTickRef.current;
          lastTickRef.current = now;

          setCountdown(prev => {
            const next = prev - (delta / 1000);
            if (next <= 0) {
              if (countdownInterval) clearInterval(countdownInterval);
              playBell(); // Start session bell
              alarmService.startMeditation(remainingMs, intervalMs);
              startActualTimer(remainingMs);
              return 0;
            }
            return next;
          });
        }, 100);
      } else {
        // Start or resume actual timer
        alarmService.startMeditation(remainingMs, intervalMs);
        startActualTimer(remainingMs);
      }
    } else {
      alarmService.stopForegroundTimer();
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      alarmService.stopForegroundTimer();
    };
  }, [isRunning]);

  const startActualTimer = (ms: number) => {
    alarmService.startForegroundTimer(
      ms,
      (rem) => setRemainingMs(rem),
      () => {
        handleComplete();
        if (wakeLock) wakeLock.release();
      },
      intervalMs,
      () => playBell()
    );
  };

  const handleComplete = async () => {
    setIsRunning(false);
    setIsFinished(true);
    playBell(); // End bell
    
    await alarmService.stopMeditation();

    // Save session
    const newSession: MeditationSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationMin: totalDurationMin,
    };
    
    const newStats = { ...stats, sessions: [...stats.sessions, newSession] };
    setStats(newStats);
    localStorage.setItem('zen_meditation_stats', JSON.stringify(newStats));


  };

  const handleStop = async () => {
    setIsRunning(false);
    setIsPaused(false);
    if (wakeLock) wakeLock.release();
    await alarmService.stopMeditation();

    const elapsedMs = totalDurationMs - remainingMs;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    
    if (elapsedMin >= 5) {
      const newSession: MeditationSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        durationMin: elapsedMin,
      };
      
      const newStats = { ...stats, sessions: [...stats.sessions, newSession] };
      setStats(newStats);
      localStorage.setItem('zen_meditation_stats', JSON.stringify(newStats));


    }
    
    resetTimer();
  };

  const toggleTimer = async () => {
    if (!isRunning && !isPaused && remainingMs === totalDurationMs) {
      // Starting fresh
      if (settings.delaySeconds > 0) {
        setCountdown(settings.delaySeconds);
      } else {
        playBell();
        alarmService.startMeditation(remainingMs, intervalMs);
      }
      setIsRunning(true);
      setIsPaused(false);
    } else if (isRunning) {
      // Pause
      setIsRunning(false);
      setIsPaused(true);
      alarmService.stopForegroundTimer();
      await alarmService.stopMeditation();
    } else if (isPaused) {
      // Resume
      setIsRunning(true);
      setIsPaused(false);
      alarmService.startMeditation(remainingMs, intervalMs);
    } else if (isFinished) {
      resetTimer();
      setIsRunning(true);
      if (settings.delaySeconds > 0) setCountdown(settings.delaySeconds);
      else {
        playBell();
        alarmService.startMeditation(totalDurationMs, intervalMs);
      }
    }
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemainingMs(totalDurationMs);
    setCountdown(0);
    if (wakeLock) wakeLock.release();
    
    await alarmService.stopMeditation();
  };

  const today = startOfDay(new Date());
  
  // Calculate chart data dynamically based on view and offset
  let chartData: { label: string; minutes: number; isCurrent: boolean; _start?: Date; _end?: Date; _date?: Date }[] = [];
  
  if (chartView === 'day') {
    const endDay = subDays(today, chartOffset * 7);
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(endDay, 6 - i);
      return {
        label: format(d, 'E')[0],
        minutes: 0,
        isCurrent: chartOffset === 0 && isSameDay(d, today),
        _date: d,
      };
    });
    
    stats.sessions.forEach(s => {
      const sDate = startOfDay(new Date(s.date));
      const dayData = chartData.find(d => isSameDay(d._date!, sDate));
      if (dayData) {
        dayData.minutes += s.durationMin;
      }
    });
  } else if (chartView === 'week') {
    const endWeekDate = subWeeks(today, chartOffset * 7);
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = subWeeks(endWeekDate, 6 - i);
      const start = startOfWeek(d, { weekStartsOn: 1 });
      const end = endOfWeek(d, { weekStartsOn: 1 });
      return {
        label: format(start, 'dd/MM'),
        minutes: 0,
        isCurrent: chartOffset === 0 && i === 6,
        _start: start,
        _end: end,
      };
    });
    
    stats.sessions.forEach(s => {
      const sDate = startOfDay(new Date(s.date));
      const weekData = chartData.find(d => sDate >= d._start! && sDate <= d._end!);
      if (weekData) {
        weekData.minutes += s.durationMin;
      }
    });
  } else if (chartView === 'month') {
    const endMonthDate = subMonths(today, chartOffset * 6);
    chartData = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(endMonthDate, 5 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      return {
        label: format(start, 'MMM'),
        minutes: 0,
        isCurrent: chartOffset === 0 && i === 5,
        _start: start,
        _end: end,
      };
    });
    
    stats.sessions.forEach(s => {
      const sDate = startOfDay(new Date(s.date));
      const monthData = chartData.find(d => sDate >= d._start! && sDate <= d._end!);
      if (monthData) {
        monthData.minutes += s.durationMin;
      }
    });
  }

  const maxMinutesInChart = Math.max(...chartData.map(d => d.minutes), 20);
  
  // Keep original weeklyMinutes calculation for the stats cards (always last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
  const weeklyMinutes = stats.sessions.reduce((acc, s) => {
    const sDate = startOfDay(new Date(s.date));
    if (last7Days.some(d => isSameDay(d, sDate))) return acc + s.durationMin;
    return acc;
  }, 0);
  
  const totalMinutes = stats.sessions.reduce((acc, curr) => acc + curr.durationMin, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const hasSession = stats.sessions.some(s => isSameDay(startOfDay(new Date(s.date)), d));
    if (hasSession) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  const milestone = 500; 
  const progressPercent = Math.min((weeklyMinutes / milestone) * 100, 100);

  const hours = Math.floor(remainingMs / 3600000);
  const mins = Math.floor((remainingMs % 3600000) / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  
  const timeString = hours > 0 
    ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = isFinished ? 0 : totalDurationMs === 0 ? 0 : circumference - ((remainingMs / totalDurationMs) * circumference);

  const isDistractionFree = isRunning || countdown > 0 || isPaused;

  return (
    <div className="flex flex-col min-h-screen relative bg-[var(--bg-main)]">
      
      {/* Dynamic/Notch-compatible Vector Illustration Header (Stillness: ripple/lotus theme) */}
      <div 
        className="w-full h-[18vh] min-h-[140px] bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-cyan-500/10 sticky top-0 z-10 flex items-center justify-center overflow-hidden"
      >
        {/* Styled CSS/SVG Zen Concentric Rings Art */}
        <svg className="absolute w-[180px] h-[180px] text-teal-600/30 dark:text-teal-400/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="1 1" />
          {/* lotus/leaf silhouette */}
          <path d="M 50 40 C 45 48, 45 52, 50 60 C 55 52, 55 48, 50 40" fill="currentColor" opacity="0.6" />
          <path d="M 42 45 C 48 48, 52 48, 58 45 C 52 52, 48 52, 42 45" fill="currentColor" opacity="0.4" />
        </svg>
        
        {/* Settings gear overlays on top right of header */}
        <button
          onClick={() => setShowGlobalSettings(true)}
          className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-all"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>

      {/* Card Overlay container (Oval at the top overlapping the header) */}
      <div className="relative z-20 mt-[-2.5rem] bg-[var(--bg-main)] rounded-t-[3rem] px-4 pt-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.25)] flex flex-col gap-6">
        
        {/* Title & Tagline info inside the card */}
        <div className="px-2 text-center">
          <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 leading-none mb-1.5">
            {t('common.stillness') || 'Stillness'}
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
            Calm your mind and practice mindfulness
          </p>
        </div>

        {/* ── Original Meditation Content wrapper ── */}
        <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ── Timer Section ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex flex-col items-center pt-8 pb-4 relative transition-all duration-700",
        isDistractionFree ? "min-h-[70vh] justify-center" : ""
      )}>
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="150" cy="150" r="120" stroke="var(--sm-surface)" strokeWidth="4" fill="none" className="opacity-40" />
            <circle
              cx="150" cy="150" r="120"
              stroke="var(--sm-accent)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          <div className="text-center z-10 flex flex-col items-center">
            {countdown > 0 ? (
              <>
                <span className="text-sm font-bold uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--sm-text-muted)' }}>
                  {t('meditation.startingIn')}
                </span>
                <div className="font-serif text-6xl font-medium tracking-tight" style={{ color: 'var(--sm-accent)'}}>
                  {Math.ceil(countdown)}
                </div>
              </>
            ) : (
              <>
                <span className="text-sm font-bold uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--sm-text-muted)' }}>
                  {isFinished ? t('meditation.complete') : (isPaused ? 'Paused' : t('meditation.remaining'))}
                </span>
                <div className="font-serif text-6xl font-medium tracking-tight" style={{ color: 'var(--sm-text-primary)'}}>
                  {timeString}
                </div>
              </>
            )}
            
            {/* Quick settings button (only when stopped) */}
            {!isDistractionFree && !isFinished && (
               <button 
                 onClick={() => setShowSettings(true)}
                 className="absolute -bottom-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                 style={{ 
                   backgroundColor: 'var(--sm-surface)',
                   color: 'var(--sm-text-secondary)',
                 }}
               >
                 <Settings2 size={14} /> {t('meditation.configure')}
               </button>
            )}

            {isDistractionFree && (
              <button
                onClick={toggleWakeLock}
                className={cn(
                  "flex items-center mt-6 gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                  wakeLock 
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-transparent"
                )}
              >
                <Sun size={12} className={cn(wakeLock && "animate-pulse")} />
                {wakeLock ? 'Screen Always On' : 'Keep Screen On'}
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 w-full max-w-[280px] justify-between">
          {!isDistractionFree ? (
            <>
              <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90"
                style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-secondary)' }}
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                onClick={toggleTimer}
                className="flex-1 h-14 rounded-full flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-xs transition-transform active:scale-95 border shadow-[0_0_20px_rgba(212,136,32,0.2)]"
                style={{ 
                  background: 'linear-gradient(135deg, var(--sm-accent), rgb(180 110 20))',
                  color: '#fff',
                  borderColor: 'var(--sm-accent-shadow)'
                }}
              >
                <Play size={16} fill="currentColor" /> {t('meditation.startMeditation')}
              </button>

              <button 
                onClick={() => setSettings(s => ({...s, soundEnabled: !s.soundEnabled}))}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-90 relative"
                style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-secondary)' }}
              >
                <Volume2 size={18} />
                {!settings.soundEnabled && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-6 h-[2px] rotate-45 bg-red-500/80 rounded-full" />
                   </div>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleStop}
                className="flex-1 h-14 rounded-full flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-xs transition-all active:scale-95 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Square size={16} fill="currentColor" /> Stop
              </button>
              
              <button 
                onClick={toggleTimer}
                className="flex-1 h-14 rounded-full flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-xs transition-all active:scale-95 bg-amber-600 text-white shadow-lg shadow-amber-600/20"
              >
                {isRunning ? (
                  <><Pause size={16} fill="currentColor" /> Pause</>
                ) : (
                  <><Play size={16} fill="currentColor" /> Resume</>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Stats Area ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isDistractionFree && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 gap-4 mt-8"
          >
            <div className="rounded-[2rem] p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-xl" style={{ color: 'var(--sm-text-primary)' }}>{t('meditation.yourJourney')}</h3>
            <Activity size={20} style={{ color: 'var(--sm-text-muted)' }} />
          </div>

          {/* Prominent Streak */}
          <div className="flex justify-center items-center flex-col mb-8 py-6 rounded-3xl" style={{ border: '1px solid var(--sm-accent-muted)', backgroundColor: 'var(--sm-accent-subtle)' }}>
             <Award size={24} style={{ color: 'var(--sm-accent)' }} className="mb-2" />
             <p className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>{t('meditation.currentStreak')}</p>
             <div className="font-serif text-5xl font-medium tracking-tight" style={{ color: 'var(--sm-accent)' }}>{currentStreak} <span className="text-2xl">{t('meditation.days')}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <div className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>{t('meditation.weeklyTime')}</div>
              <div className="font-serif text-3xl" style={{ color: 'var(--sm-accent)' }}>
                {Math.floor(weeklyMinutes / 60) > 0 ? `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m` : `${weeklyMinutes}m`}
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <div className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>{t('meditation.sessions')}</div>
              <div className="font-serif text-3xl" style={{ color: 'var(--sm-accent)' }}>{stats.sessions.filter(s => differenceInDays(today, new Date(s.date)) < 7).length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm uppercase tracking-widest font-bold" style={{ color: 'var(--sm-text-muted)' }}>
              <span>{t('meditation.nextMilestone')}</span>
              <span style={{ color: 'var(--sm-accent)' }}>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 rounded-full w-full overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--sm-accent)' }} />
            </div>
            <p className="text-xs italic text-center mt-6 mb-2 opacity-70" style={{ color: 'var(--sm-text-secondary)' }}>
              "Silence is the sleep that nourishes wisdom."
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl" style={{ color: 'var(--sm-text-primary)' }}>{t('meditation.meditationHistory')}</h3>
            <Activity size={20} style={{ color: 'var(--sm-text-muted)' }} />
          </div>

          {/* Chart Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-stone-100 dark:bg-stone-900 rounded-full p-1" style={{ backgroundColor: 'var(--sm-surface)' }}>
              {(['day', 'week', 'month'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => { setChartView(view); setChartOffset(0); }}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all",
                    chartView === view 
                      ? "shadow-sm" 
                      : "opacity-60 hover:opacity-100"
                  )}
                  style={chartView === view ? { backgroundColor: 'var(--sm-card-bg)', color: 'var(--sm-accent)' } : { color: 'var(--sm-text-secondary)' }}
                >
                  {view === 'day' ? 'Day' : view === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setChartOffset(prev => prev + 1)}
                className="p-1.5 rounded-full transition-colors opacity-60 hover:opacity-100"
                style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-primary)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setChartOffset(prev => Math.max(0, prev - 1))}
                disabled={chartOffset === 0}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  chartOffset === 0 ? "opacity-30 cursor-not-allowed" : "opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-primary)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between h-32 pt-4 pb-2 border-b" style={{ borderColor: 'var(--sm-border)' }}>
            {chartData.map((item, i) => {
              const h = item.minutes > 0 ? (item.minutes / maxMinutesInChart) * 100 : 0;
              return (
                <div key={`chart-col-${chartView}-${chartOffset}-${i}`} className="flex flex-col items-center gap-3" style={{ width: `${100 / chartData.length}%` }}>
                  <div className="w-full flex justify-center h-20 items-end">
                    <motion.div 
                      key={`bar-${chartView}-${chartOffset}-${i}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-2 sm:w-3 rounded-full"
                      style={{ 
                        backgroundColor: item.minutes > 0 
                      ? (item.isCurrent ? 'var(--sm-accent)' : 'var(--sm-text-disabled)') 
                      : 'transparent',
                        minHeight: item.minutes > 0 ? '4px' : '0'
                      }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap" style={{ color: item.isCurrent ? 'var(--sm-accent)' : 'var(--sm-text-muted)' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          
            <div className="flex justify-between items-center mt-4 text-xs font-medium" style={{ color: 'var(--sm-text-secondary)' }}>
              <span>
                {chartView === 'day' ? t('meditation.dailyAverage') : chartView === 'week' ? 'Weekly Average' : 'Monthly Average'}
              </span>
              <span style={{ color: 'var(--sm-accent)' }}>
                {(chartData.reduce((acc, curr) => acc + curr.minutes, 0) / chartData.length).toFixed(1)} {t('meditation.mins')}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* ── Settings Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-md bg-black/35 dark:bg-black/55"
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="glass-card w-full max-w-lg max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl relative bg-white/92 dark:bg-stone-950/95 border border-stone-200/60 dark:border-yellow-950 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 pb-4 border-b border-stone-100 dark:border-white/5">
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {t('meditation.sessionSettings')}
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full transition-colors text-stone-400 dark:text-amber-700/70 hover:text-amber-700 dark:hover:text-amber-500"
                >
                  <X size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 scrollbar-hide">
                {/* Duration Section */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-4 text-stone-400 dark:text-amber-700/70">{t('meditation.durationLabel')}</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full">
                        <select 
                          value={settings.durationHours}
                          onChange={(e) => setSettings({...settings, durationHours: parseInt(e.target.value)})}
                          className="w-full bg-stone-50 dark:bg-stone-900/50 px-4 py-5 rounded-2xl border border-stone-200 dark:border-amber-900/30 outline-none font-serif text-3xl text-center text-amber-700 dark:text-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={`hour-${i}`} value={i}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-stone-950 text-[10px] font-black uppercase tracking-tighter text-stone-400 pointer-events-none">Hours</span>
                      </div>
                    </div>
                    <span className="text-2xl font-serif text-stone-300">:</span>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full">
                        <select 
                          value={settings.durationMinutes}
                          onChange={(e) => setSettings({...settings, durationMinutes: parseInt(e.target.value)})}
                          className="w-full bg-stone-50 dark:bg-stone-900/50 px-4 py-5 rounded-2xl border border-stone-200 dark:border-amber-900/30 outline-none font-serif text-3xl text-center text-amber-700 dark:text-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                        >
                          {[0, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                            <option key={`min-${m}`} value={m}>{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-stone-950 text-[10px] font-black uppercase tracking-tighter text-stone-400 pointer-events-none">Minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interval Section */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-4 text-stone-400 dark:text-amber-700/70">{t('meditation.intervalBell')}</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full">
                        <select 
                          value={settings.intervalMinutes}
                          onChange={(e) => setSettings({...settings, intervalMinutes: parseInt(e.target.value)})}
                          className="w-full bg-stone-50 dark:bg-stone-900/50 px-4 py-5 rounded-2xl border border-stone-200 dark:border-amber-900/30 outline-none font-serif text-3xl text-center text-amber-700 dark:text-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 60 }).map((_, i) => (
                            <option key={`int-min-${i}`} value={i}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-stone-950 text-[10px] font-black uppercase tracking-tighter text-stone-400 pointer-events-none">Minutes</span>
                      </div>
                    </div>
                    <span className="text-2xl font-serif text-stone-300">:</span>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full">
                        <select 
                          value={settings.intervalSeconds}
                          onChange={(e) => setSettings({...settings, intervalSeconds: parseInt(e.target.value)})}
                          className="w-full bg-stone-50 dark:bg-stone-900/50 px-4 py-5 rounded-2xl border border-stone-200 dark:border-amber-900/30 outline-none font-serif text-3xl text-center text-amber-700 dark:text-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                        >
                          {[0, 15, 30, 45].map(s => (
                            <option key={`int-sec-${s}`} value={s}>{s.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-stone-950 text-[10px] font-black uppercase tracking-tighter text-stone-400 pointer-events-none">Seconds</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2 text-stone-400 dark:text-amber-700/70">{t('meditation.preparationCheck')}</label>
                  <select 
                    value={settings.delaySeconds}
                    onChange={(e) => setSettings({...settings, delaySeconds: parseInt(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl outline-none font-serif text-lg border border-stone-200 dark:border-amber-900/30 text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-900/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  >
                     <option value={0}>{t('meditation.noDelay')}</option>
                     <option value={5}>5 {t('meditation.seconds')}</option>
                     <option value={10}>10 {t('meditation.seconds')}</option>
                     <option value={30}>30 {t('meditation.seconds')}</option>
                     <option value={60}>1 {t('meditation.minutes')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2 text-stone-400 dark:text-amber-700/70">{t('meditation.bellType')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['bowl', 'gong', 'chime', 'tibetan', 'woodblock', 'bell'].map(bell => (
                      <button
                        key={`bell-option-${bell}`}
                        onClick={() => {
                          setSettings({...settings, bellType: bell});
                          playBell(bell);
                        }}
                        className={cn(
                          "py-4 text-xs font-black rounded-xl capitalize border transition-all active:scale-95",
                          settings.bellType === bell
                            ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20"
                            : "bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-amber-900/30 text-stone-500 dark:text-amber-700"
                        )}
                      >
                        {bell}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-stone-100 dark:border-white/5 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-5 rounded-full font-black tracking-widest text-xs uppercase text-white shadow-xl transition-all active:scale-95 bg-gradient-to-r from-amber-700 to-amber-600 hover:shadow-amber-600/30"
                >
                  {t('meditation.saveSettings')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
}