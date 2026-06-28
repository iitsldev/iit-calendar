import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Minus, Plus, Hand, Play, Pause, RotateCcw, Clock, Settings2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';

interface ChantCounterProps {
  currentCount: number;
  onCountChange: (value: number) => void;
  onCommit: (durationMin?: number) => void;
  targetCount: number;
}

export function ChantCounter({ currentCount, onCountChange, onCommit, targetCount }: ChantCounterProps) {
  const { t } = useI18n();
  const controls = useAnimation();
  const [manualValue, setManualValue] = useState(currentCount.toString());

  // Timer states
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState({ hours: 0, minutes: 0 }); // 0 means stopwatch
  const totalDurationMs = (timerSettings.hours * 60 + timerSettings.minutes) * 60 * 1000;
  
  const [remainingMs, setRemainingMs] = useState(totalDurationMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const isStarted = isRunning || isFinished || elapsedMs > 0 || currentCount > 0;

  useEffect(() => {
    setManualValue(currentCount.toString());
  }, [currentCount]);

  useEffect(() => {
    if (!isRunning && !isFinished && elapsedMs === 0) {
      setRemainingMs(totalDurationMs);
    }
  }, [totalDurationMs, isRunning, isFinished, elapsedMs]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setElapsedMs(elapsed);
        
        if (totalDurationMs > 0) {
          const rem = totalDurationMs - elapsed;
          if (rem <= 0) {
            setRemainingMs(0);
            setIsRunning(false);
            setIsFinished(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else {
            setRemainingMs(rem);
          }
        } else {
          // Stopwatch mode
          setRemainingMs(0);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, totalDurationMs]);

  const toggleTimer = () => {
    if (!isRunning && !isFinished) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedMs;
    } else if (isRunning) {
      setIsRunning(false);
    } else if (isFinished) {
      resetTimer();
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingMs(totalDurationMs);
    setElapsedMs(0);
    onCountChange(0); // Reset count as well
  };

  const handleCommit = () => {
    const min = Math.floor(elapsedMs / 60000);
    resetTimer();
    onCommit(min > 0 ? min : undefined);
  };

  const handleTap = async () => {
    onCountChange(currentCount + 1);
    await controls.start({
      scale: [1, 0.95, 1],
      transition: { duration: 0.1 }
    });
  };

  const handleManualChange = (val: string) => {
    setManualValue(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onCountChange(parsed);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center py-6 min-h-[50vh] transition-all duration-500">
      
      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center flex-1 w-full"
        >
          <div className="text-center mb-10">
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">
              Duration
            </div>
            <button 
              onClick={() => setShowTimeSettings(true)}
              className="font-serif text-6xl font-medium tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity flex items-center justify-center gap-3"
            >
              {timerSettings.hours > 0 ? `${timerSettings.hours}:${timerSettings.minutes.toString().padStart(2, '0')}:00` : `${timerSettings.minutes.toString().padStart(2, '0')}:00`}
              <Settings2 size={24} className="text-amber-500/50" />
            </button>
            <div className="mt-4 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface)] px-4 py-2 rounded-full inline-block border border-[var(--border-subtle)]">
              {timerSettings.hours === 0 && timerSettings.minutes === 0 ? "Stopwatch Mode (No limit)" : "Countdown Mode"}
            </div>
          </div>
          
          <button 
            onClick={toggleTimer}
            className="h-16 px-10 rounded-full flex items-center justify-center gap-3 font-bold tracking-widest uppercase text-sm transition-transform active:scale-95 shadow-lg shadow-amber-600/20 bg-gradient-to-br from-amber-500 to-amber-700 text-white"
          >
            <Play size={20} fill="currentColor" /> Start Chanting
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col items-center w-full"
        >
          {/* Timer Header */}
          <div className="flex justify-between w-full max-w-xs mb-8 items-center px-6 py-3 bg-[var(--bg-card)] rounded-full border border-[var(--border-subtle)] shadow-sm">
            <div className="flex items-center gap-2 text-[var(--accent)] font-serif text-2xl tracking-tight">
              <Clock size={18} className="text-[var(--text-muted)]" />
              {totalDurationMs > 0 ? formatTime(remainingMs) : formatTime(elapsedMs)}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTimer} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                {isRunning ? <Pause fill="currentColor" size={16} /> : <Play fill="currentColor" size={16} />}
              </button>
              <button 
                onClick={resetTimer} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Display and Controls */}
          <div className="flex items-center justify-center gap-6 mb-10 w-full max-w-xs">
            <button
              onClick={() => onCountChange(Math.max(0, currentCount - 1))}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-[var(--border-subtle)] active:scale-90 transition-transform bg-[var(--bg-card)]"
            >
              <Minus size={20} className="text-[var(--text-muted)]" />
            </button>

            <div className="text-center flex flex-col items-center">
              <input
                type="number"
                value={manualValue}
                onChange={(e) => handleManualChange(e.target.value)}
                className="font-serif text-6xl font-medium tracking-tight bg-transparent text-center focus:outline-none w-32 text-[var(--text-primary)]"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
                {t('chant.ofChants', { count: targetCount })}
              </p>
            </div>

            <button
              onClick={() => onCountChange(currentCount + 1)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-[var(--border-subtle)] active:scale-90 transition-transform bg-[var(--bg-card)]"
            >
              <Plus size={20} className="text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Big Tap Button */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-3">
              {[-10, 10, 108].map(num => (
                <button
                  key={num}
                  onClick={() => onCountChange(Math.max(0, currentCount + num))}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-muted)] text-[10px] font-black tracking-widest text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all active:scale-95"
                >
                  {num > 0 ? '+' : ''}{num}
                </button>
              ))}
            </div>
            
            <motion.button
              animate={controls}
              onClick={handleTap}
              className="relative w-64 h-64 flex items-center justify-center group"
            >
              <div className="absolute inset-0 rounded-full border-2 border-amber-600/10" />
              <div className="absolute inset-4 rounded-full border border-white dark:border-slate-800 shadow-xl" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-1 shadow-[0_0_40px_rgba(212,136,32,0.3)]">
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 relative overflow-hidden">
                  <motion.div
                    initial={false}
                    className="absolute inset-0 bg-white opacity-0"
                    whileTap={{ opacity: 0.15 }}
                  />
                  <Hand size={48} className="text-white mb-2" />
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-white">{t('chant.tapToChant')}</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Done Button */}
          <button
            onClick={handleCommit}
            disabled={currentCount === 0 && elapsedMs < 60000}
            className={cn(
              "mt-10 px-12 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all shadow-lg active:scale-95",
              (currentCount > 0 || elapsedMs >= 60000)
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 pointer-events-none"
            )}
          >
            {t('chant.logSession')}
          </button>
        </motion.div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showTimeSettings && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-md bg-black/40">
            <motion.div
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm bg-white dark:bg-stone-950 rounded-[2.5rem] p-8 shadow-2xl border border-stone-200 dark:border-stone-800"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif text-2xl font-bold">Chant Duration</h3>
                <button onClick={() => setShowTimeSettings(false)} className="text-stone-400"><X /></button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    <select 
                      value={timerSettings.hours}
                      onChange={(e) => setTimerSettings({...timerSettings, hours: parseInt(e.target.value)})}
                      className="w-full bg-stone-50 dark:bg-stone-900 px-4 py-4 rounded-2xl border-none outline-none font-serif text-3xl text-center text-amber-600 focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
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
                      value={timerSettings.minutes}
                      onChange={(e) => setTimerSettings({...timerSettings, minutes: parseInt(e.target.value)})}
                      className="w-full bg-stone-50 dark:bg-stone-900 px-4 py-4 rounded-2xl border-none outline-none font-serif text-3xl text-center text-amber-600 focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                    >
                      {[0, 1, 5, 10, 15, 20, 25, 30, 45].map(m => (
                        <option key={`min-${m}`} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-stone-950 text-[10px] font-black uppercase tracking-tighter text-stone-400 pointer-events-none">Minutes</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowTimeSettings(false)}
                className="w-full py-5 rounded-full font-black tracking-widest text-xs uppercase text-white shadow-xl transition-all active:scale-95 bg-amber-600"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
