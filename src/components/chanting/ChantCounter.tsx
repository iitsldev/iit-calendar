import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Minus, Plus, Hand } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../hooks/useI18n';

interface ChantCounterProps {
  currentCount: number;
  onCountChange: (value: number) => void;
  onCommit: () => void;
  targetCount: number;
}

export function ChantCounter({ currentCount, onCountChange, onCommit, targetCount }: ChantCounterProps) {
  const { t } = useI18n();
  const controls = useAnimation();
  const [manualValue, setManualValue] = useState(currentCount.toString());

  useEffect(() => {
    setManualValue(currentCount.toString());
  }, [currentCount]);

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

  return (
    <div className="flex flex-col items-center py-10">
      {/* Display and Controls */}
      <div className="flex items-center justify-center gap-8 mb-12 w-full max-w-xs">
        <button
          onClick={() => onCountChange(Math.max(0, currentCount - 1))}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm border border-[var(--border-subtle)] active:scale-90 transition-transform bg-[var(--bg-card)]"
        >
          <Minus size={24} className="text-[var(--text-muted)]" />
        </button>

        <div className="text-center flex flex-col items-center">
          <input
            type="number"
            value={manualValue}
            onChange={(e) => handleManualChange(e.target.value)}
            className="font-serif text-7xl font-medium tracking-tight bg-transparent text-center focus:outline-none w-48 text-[var(--accent)]"
          />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-2">
            {t('chant.ofChants', { count: targetCount })}
          </p>
        </div>

        <button
          onClick={() => onCountChange(currentCount + 1)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm border border-[var(--border-subtle)] active:scale-90 transition-transform bg-[var(--bg-card)]"
        >
          <Plus size={24} className="text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Big Tap Button */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-4">
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
        {/* Decorative Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#7f5700]/10" />
        <div className="absolute inset-4 rounded-full border border-white dark:border-slate-800 shadow-xl" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#d48820] to-[#7f5700] p-1 shadow-[0_0_40px_rgba(212,136,32,0.3)]">
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-[#e8ac41] to-[#d48820] relative overflow-hidden">
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
        onClick={onCommit}
        disabled={currentCount === 0}
        className={cn(
          "mt-12 px-12 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all shadow-lg active:scale-95",
          currentCount > 0 
            ? "bg-slate-900 text-white hover:bg-slate-800" 
            : "bg-slate-100 text-primary-300 pointer-events-none"
        )}
      >
        {t('chant.logSession')}
      </button>
    </div>
  );
}
