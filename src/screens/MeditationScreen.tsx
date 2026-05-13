import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw, Volume2, Activity, Award, Clock, Settings2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInDays, startOfDay, subDays, isSameDay } from 'date-fns';
import { notificationService, ActiveMeditation } from '../services/NotificationService';

interface MeditationSession {
  id: string;
  date: string;
  durationMin: number;
}

interface MeditationStats {
  sessions: MeditationSession[];
}

export function MeditationScreen() {
  const [stats, setStats] = useState<MeditationStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zen_meditation_stats');
      return saved ? JSON.parse(saved) : { sessions: [] };
    }
    return { sessions: [] };
  });

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
  
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const lastIntervalBellRef = useRef<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    notificationService.requestPermissions();
    
    // Check for existing session
    const savedActive = localStorage.getItem('active_meditation');
    const justFinished = localStorage.getItem('meditation_just_finished');

    if (justFinished) {
      const data = JSON.parse(justFinished);
      // If it was finished recently (last 1 hour), show stats
      if (Date.now() - data.at < 3600000) {
        const savedStats = localStorage.getItem('zen_meditation_stats');
        if (savedStats) setStats(JSON.parse(savedStats));
        // Reset to initial state but don't auto-run
        setRemainingMs(totalDurationMs);
        setIsRunning(false);
      }
      localStorage.removeItem('meditation_just_finished');
    } else if (savedActive) {
      const active: ActiveMeditation = JSON.parse(savedActive);
      const elapsed = Date.now() - active.startTime;
      if (elapsed < active.durationMs) {
        setRemainingMs(active.durationMs - elapsed);
        setIsRunning(true);
        lastIntervalBellRef.current = Math.floor(elapsed / intervalMs);
      } else {
        // notificationService.recheckMeditationSession() in App.tsx handles logging
        const savedStats = localStorage.getItem('zen_meditation_stats');
        if (savedStats) setStats(JSON.parse(savedStats));
        setRemainingMs(totalDurationMs);
        setIsRunning(false);
      }
    }
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
    if (!isRunning && !isFinished && countdown === 0) {
      setRemainingMs(totalDurationMs);
    }
  }, [totalDurationMs, isRunning, isFinished, countdown]);

  // Main Timer Logic (Includes delay countdown)
  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        if (countdown > 0) {
          setCountdown(prev => {
            const next = prev - (delta / 1000);
            if (next <= 0) {
              playBell(); // Start session bell
              lastIntervalBellRef.current = 0;
              notificationService.startMeditation(remainingMs);
              return 0;
            }
            return next;
          });
        } else {
          setRemainingMs((prev) => {
            const next = prev - delta;
            if (next <= 0) {
              handleComplete();
              return 0;
            }

            const elapsedMs = totalDurationMs - next;
            
            if (intervalMs > 0 && elapsedMs > 0) {
              const currentInterval = Math.floor(elapsedMs / intervalMs);
              if (currentInterval > lastIntervalBellRef.current) {
                lastIntervalBellRef.current = currentInterval;
                playBell(); // Interval bell 
              }
            }
            return next;
          });
        }
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalDurationMs, intervalMs, countdown, settings.soundEnabled, settings.bellType]);

  const handleComplete = async () => {
    setIsRunning(false);
    setIsFinished(true);
    playBell(); // End bell
    
    await notificationService.stopMeditation();

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
    await notificationService.stopMeditation();

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
    if (!isRunning && remainingMs === totalDurationMs) {
      // Starting fresh
      if (settings.delaySeconds > 0) {
        setCountdown(settings.delaySeconds);
      } else {
        playBell();
        lastIntervalBellRef.current = 0;
        notificationService.startMeditation(remainingMs);
      }
      setIsRunning(true);
    } else if (isRunning) {
      handleStop();
    } else {
      // It's paused or finished? We removed pause, so this is just finished or stopped.
      if (isFinished) {
        resetTimer();
        setIsRunning(true);
        if (settings.delaySeconds > 0) setCountdown(settings.delaySeconds);
        else {
          playBell();
          notificationService.startMeditation(totalDurationMs);
        }
      } else {
        setIsRunning(true);
        notificationService.startMeditation(remainingMs);
      }
    }
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingMs(totalDurationMs);
    setCountdown(0);
    lastIntervalBellRef.current = 0;
    
    await notificationService.stopMeditation();
  };

  const today = startOfDay(new Date());
  
  const chartDays = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    return {
      date: d,
      label: format(d, 'E')[0],
      minutes: 0
    };
  });

  stats.sessions.forEach(s => {
    const sDate = startOfDay(new Date(s.date));
    const dayData = chartDays.find(d => isSameDay(d.date, sDate));
    if (dayData) {
      dayData.minutes += s.durationMin;
    }
  });

  const maxMinutesInChart = Math.max(...chartDays.map(d => d.minutes), 20);
  const weeklyMinutes = chartDays.reduce((acc, curr) => acc + curr.minutes, 0);
  
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
  
  let timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  if (hours > 0) {
    timeString = `${hours}:${timeString}`;
  }
  
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = isFinished ? 0 : totalDurationMs === 0 ? 0 : circumference - ((remainingMs / totalDurationMs) * circumference);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ── Timer Section ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-8 pb-4 relative">
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
                  Starting In
                </span>
                <div className="font-serif text-6xl font-medium tracking-tight" style={{ color: 'var(--sm-accent)'}}>
                  {Math.ceil(countdown)}
                </div>
              </>
            ) : (
              <>
                <span className="text-sm font-bold uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--sm-text-muted)' }}>
                  {isFinished ? 'Complete' : 'Remaining'}
                </span>
                <div className="font-serif text-6xl font-medium tracking-tight" style={{ color: 'var(--sm-text-primary)'}}>
                  {timeString}
                </div>
              </>
            )}
            
            {/* Quick settings button (only when stopped) */}
            {!isRunning && remainingMs === totalDurationMs && !countdown && (
               <button 
                 onClick={() => setShowSettings(true)}
                 className="absolute -bottom-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                 style={{ 
                   backgroundColor: 'var(--sm-surface)',
                   color: 'var(--sm-text-secondary)',
                 }}
               >
                 <Settings2 size={14} /> Configure
               </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 w-full max-w-[280px] justify-between">
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
            {isRunning ? (
              <><Square size={16} fill="currentColor" /> STOP SESSION</>
            ) : (
              <><Play size={16} fill="currentColor" /> START MEDITATION</>
            )}
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
        </div>
      </div>

      {/* ── Stats Area ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 mt-8">
        
        <div className="rounded-[2rem] p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-xl" style={{ color: 'var(--sm-text-primary)' }}>Your Journey</h3>
            <Activity size={20} style={{ color: 'var(--sm-text-muted)' }} />
          </div>

          {/* Prominent Streak */}
          <div className="flex justify-center items-center flex-col mb-8 py-6 rounded-3xl" style={{ border: '1px solid var(--sm-accent-muted)', backgroundColor: 'var(--sm-accent-subtle)' }}>
             <Award size={24} style={{ color: 'var(--sm-accent)' }} className="mb-2" />
             <p className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>Current Streak</p>
             <div className="font-serif text-5xl font-medium tracking-tight" style={{ color: 'var(--sm-accent)' }}>{currentStreak} <span className="text-2xl">Days</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <div className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>Weekly Time</div>
              <div className="font-serif text-3xl" style={{ color: 'var(--sm-accent)' }}>
                {Math.floor(weeklyMinutes / 60) > 0 ? `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m` : `${weeklyMinutes}m`}
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <div className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: 'var(--sm-text-muted)' }}>Sessions</div>
              <div className="font-serif text-3xl" style={{ color: 'var(--sm-accent)' }}>{stats.sessions.filter(s => differenceInDays(today, new Date(s.date)) < 7).length}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm uppercase tracking-widest font-bold" style={{ color: 'var(--sm-text-muted)' }}>
              <span>Next Milestone</span>
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
            <h3 className="font-serif text-xl" style={{ color: 'var(--sm-text-primary)' }}>Meditation History</h3>
            <Activity size={20} style={{ color: 'var(--sm-text-muted)' }} />
          </div>

          <div className="flex items-end justify-between h-32 pt-4 pb-2 border-b" style={{ borderColor: 'var(--sm-border)' }}>
            {chartDays.map((day, i) => {
              const h = day.minutes > 0 ? (day.minutes / maxMinutesInChart) * 100 : 0;
              const isToday = i === chartDays.length - 1;
              return (
                <div key={`chart-col-${i}`} className="flex flex-col items-center gap-3 w-1/7">
                  <div className="w-full flex justify-center h-20 items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-2 sm:w-3 rounded-full"
                      style={{ 
                        backgroundColor: day.minutes > 0 
                          ? (isToday ? 'var(--sm-accent)' : 'var(--sm-text-disabled)') 
                          : 'transparent',
                        minHeight: day.minutes > 0 ? '4px' : '0'
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold uppercase" style={{ color: isToday ? 'var(--sm-accent)' : 'var(--sm-text-muted)' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center mt-4 text-xs font-medium" style={{ color: 'var(--sm-text-secondary)' }}>
            <span>Daily Average</span>
            <span style={{ color: 'var(--sm-accent)' }}>{(weeklyMinutes / 7).toFixed(1)} mins</span>
          </div>
        </div>
      </div>

      {/* ── Settings Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-md"
            style={{ background: 'var(--sm-overlay)' }}
          >
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="glass-card w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
              style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-2 rounded-full transition-colors"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                <X size={24}/>
              </button>

              <h2 className="font-serif text-2xl font-bold mb-8" style={{ color: 'var(--sm-text-primary)' }}>
                Session Settings
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--sm-text-muted)' }}>Duration (Hours & Minutes)</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="0"
                        value={settings.durationHours}
                        onChange={(e) => setSettings({...settings, durationHours: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent px-4 py-3 rounded-2xl border outline-none font-serif text-xl text-center"
                        style={{ borderColor: 'var(--sm-input-border)', color: 'var(--sm-text-primary)' }}
                        placeholder="Hr"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="0"
                        max="59"
                        value={settings.durationMinutes}
                        onChange={(e) => setSettings({...settings, durationMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent px-4 py-3 rounded-2xl border outline-none font-serif text-xl text-center"
                        style={{ borderColor: 'var(--sm-input-border)', color: 'var(--sm-text-primary)' }}
                        placeholder="Min"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--sm-text-muted)' }}>Interval Bell (Minutes & Seconds)</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="0"
                        value={settings.intervalMinutes}
                        onChange={(e) => setSettings({...settings, intervalMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent px-4 py-3 rounded-2xl border outline-none font-serif text-xl text-center"
                        style={{ borderColor: 'var(--sm-input-border)', color: 'var(--sm-text-primary)' }}
                        placeholder="Min"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="number" 
                        min="0"
                        max="59"
                        value={settings.intervalSeconds}
                        onChange={(e) => setSettings({...settings, intervalSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent px-4 py-3 rounded-2xl border outline-none font-serif text-xl text-center"
                        style={{ borderColor: 'var(--sm-input-border)', color: 'var(--sm-text-primary)' }}
                        placeholder="Sec"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--sm-text-muted)' }}>Preparation Check (sec)</label>
                  <select 
                    value={settings.delaySeconds}
                    onChange={(e) => setSettings({...settings, delaySeconds: parseInt(e.target.value)})}
                    className="w-full bg-transparent px-4 py-3 rounded-2xl border outline-none font-serif text-lg"
                    style={{ 
                      borderColor: 'var(--sm-input-border)',
                      color: 'var(--sm-text-primary)',
                    }}
                  >
                     <option value={0} style={{ background: 'var(--sm-select-bg)' }}>No delay</option>
                     <option value={5} style={{ background: 'var(--sm-select-bg)' }}>5 seconds</option>
                     <option value={10} style={{ background: 'var(--sm-select-bg)' }}>10 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--sm-text-muted)' }}>Bell Type</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {['bowl', 'gong', 'chime', 'tibetan', 'woodblock', 'bell'].map(bell => (
                      <button
                        key={`bell-option-${bell}`}
                        onClick={() => {
                          setSettings({...settings, bellType: bell});
                          playBell(bell);
                        }}
                        className="flex-none w-24 py-3 text-sm rounded-xl capitalize font-medium border transition-colors snap-center"
                        style={{
                           backgroundColor: settings.bellType === bell ? 'var(--sm-accent-muted)' : 'transparent',
                           borderColor: settings.bellType === bell ? 'var(--sm-accent)' : 'var(--sm-input-border)',
                           color: settings.bellType === bell ? 'var(--sm-accent)' : 'var(--sm-text-secondary)',
                        }}
                      >
                        {bell}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-4 py-4 rounded-2xl font-bold tracking-widest text-xs uppercase text-white shadow-lg transition-transform active:scale-95"
                  style={{ background: 'var(--sm-accent)' }}
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}