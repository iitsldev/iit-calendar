import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Sunrise, 
  Sun, 
  Sunset 
} from 'lucide-react';
import { SunTimesCalculator } from '../lib/calendar/SunTimesCalculator';
import { Settings } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';

interface SunTimeItemProps {
  icon: React.ReactNode;
  label: string;
  time: string;
  color: string;
  hasBorder?: boolean;
  active: boolean;
}

function SunTimeItem({ icon, label, time, color, hasBorder, active }: SunTimeItemProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1.5 flex-1 transition-all duration-500",
      hasBorder && "border-x border-slate-200/50",
      active ? "scale-100" : "scale-110"
    )}>
      <div className={cn("transition-transform duration-500", active && "scale-125 translate-y-[-4px]", color)}>{icon}</div>
      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-slate-200 dark:text-slate-800 tracking-tight">{time}</span>
    </div>
  );
}

function Marker({ label, time, align }: { label: string, time: string, align: 'start' | 'center' | 'end' }) {
  return (
    <div className={cn(
      "flex flex-col space-y-1",
      align === 'center' && "items-center",
      align === 'end' && "items-end text-right"
    )}>
      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-300 font-mono">{time}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{label}</span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

import { bellService } from '../lib/services/BellService';
import { Bell, BellOff, Volume2 } from 'lucide-react';

export function SunDetails({ 
  expanded, 
  setExpanded, 
  settings, 
  date, 
  calculator,
  activeDawn 
}: { 
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  settings: Settings;
  date: Date;
  calculator: SunTimesCalculator;
  activeDawn: Date;
}) {
  const { t } = useI18n();
  const times = calculator.getStandardTimes(date);
  const currentTime = new Date();
  const [selectedPhase, setSelectedPhase] = React.useState<number | null>(null);
  const [isBellEnabled, setIsBellEnabled] = React.useState(bellService.isSolarNoonBellEnabled());

  // Update bell service when noon changes or toggle changes
  React.useEffect(() => {
    if (times.solarNoon) {
      bellService.setSolarNoonBell(times.solarNoon, isBellEnabled);
    }
  }, [times.solarNoon, isBellEnabled]);

  const toggleBell = async () => {
    if (!isBellEnabled) {
      await bellService.requestPermission();
      // Test bell to announce
      bellService.playBell();
    }
    setIsBellEnabled(!isBellEnabled);
  };

  const safeFormat = (d: Date | undefined | null, fmt: string) => {
    if (!d || isNaN(d.getTime())) return '--:--';
    return format(d, fmt);
  };

  const getPercent = (d: Date | number | undefined) => {
    if (!d) return 0;
    const jsDate = typeof d === 'number' ? new Date(d) : d;
    if (isNaN(jsDate.getTime())) return 0;
    const val = jsDate.getHours() * 3600000 + jsDate.getMinutes() * 60000 + jsDate.getSeconds() * 1000;
    return (val / (24 * 3600000)) * 100;
  };

  const dayPercent = getPercent(currentTime);
  const tCoord = dayPercent / 100;
  const sunY = isNaN(dayPercent) ? 40 : Math.pow(1-tCoord, 2) * 40 + 2*(1-tCoord)*tCoord * (-15) + Math.pow(tCoord, 2) * 40;

  const startOfDay = new Date(date).setHours(0,0,0,0);

  const getTime = (d: Date | undefined) => d ? d.getTime() : startOfDay;

  const phases = [
    { label: t('sun.night'), color: 'bg-black', start: startOfDay, end: getTime(times.nightEnd) },
    { label: 'Astro', color: 'bg-slate-900', start: getTime(times.nightEnd), end: getTime(times.nauticalDawn) },
    { label: 'Nautical', color: 'bg-slate-800', start: getTime(times.nauticalDawn), end: getTime(times.dawn) },
    { label: 'Civil', color: 'bg-sky-900', start: getTime(times.dawn), end: getTime(times.sunrise) },
    { label: t('sun.daylight'), color: 'bg-sky-400', start: getTime(times.sunrise), end: getTime(times.sunset) },
    { label: 'Civil', color: 'bg-sky-900', start: getTime(times.sunset), end: getTime(times.dusk) },
    { label: 'Nautical', color: 'bg-slate-800', start: getTime(times.dusk), end: getTime(times.nauticalDusk) },
    { label: 'Astro', color: 'bg-slate-900', start: getTime(times.nauticalDusk), end: getTime(times.night) },
    { label: t('sun.night'), color: 'bg-black', start: getTime(times.night), end: startOfDay + 24 * 60 * 60 * 1000 },
  ];

  return (
    <div className="glass-card rounded-[2rem] p-6 bg-white/50 dark:bg-slate-900/40 border-white/60 dark:border-slate-800 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-saffron dark:text-gold" />
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('sun.solarEvents')}</span>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-full text-slate-400 hover:text-saffron" style={{ background: 'rgb(212 136 32 / 0.08)' }} 
        >
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-0 relative">
        <SunTimeItem 
          icon={<div className="relative"><Sunrise size={20}/><ChevronUp size={10} className="absolute -top-1 -right-1 text-gold"/></div>} 
          label={t('sun.dawn')} 
          time={safeFormat(activeDawn, 'hh:mm a')} 
          color="text-gold" 
          active={expanded}
        />
        <SunTimeItem 
          icon={<Sun size={20}/>} 
          label={t('sun.sunrise')} 
          time={safeFormat(times.sunrise, 'hh:mm a')} 
          color="text-saffron" 
          hasBorder 
          active={expanded}
        />
        <SunTimeItem 
          icon={<Sunset size={20}/>} 
          label={t('sun.noon')} 
          time={safeFormat(times.solarNoon, 'hh:mm a')} 
          color="text-lotus" 
          active={expanded}
        />
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-8 pt-6 border-t border-slate-200/50 overflow-hidden space-y-10"
        >
          {/* Mountain Arc Graph */}
          <div className="relative h-28 w-full flex items-end justify-center px-4">
            <div className="absolute inset-x-4 bottom-0 h-[2px] bg-slate-200 rounded-full" />
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8ac41" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e8ac41" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0 40 Q 50 -15 100 40" fill="url(#arcGrad)" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
              <motion.g animate={{ cx: dayPercent, cy: sunY }}>
                <circle cx={dayPercent} cy={sunY} r="3" fill="#7f5700" className="drop-shadow-[0_0_8px_rgba(127,87,0,0.5)]" />
                <circle cx={dayPercent} cy={sunY} r="6" stroke="#7f5700" strokeWidth="0.5" fill="none" opacity="0.3" />
              </motion.g>
            </svg>
            
            <div className="absolute inset-x-0 -bottom-8 flex justify-between px-2">
              <Marker label={t('sun.rise')} time={safeFormat(times.sunrise, 'HH:mm')} align="start" />
              <Marker label={t('sun.meridian')} time={safeFormat(times.solarNoon, 'HH:mm')} align="center" />
              <Marker label={t('sun.set')} time={safeFormat(times.sunset, 'HH:mm')} align="end" />
            </div>
          </div>

          {/* Horizontal Bar Graph */}
          <div className="pt-6 space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="flex flex-col gap-0.5">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('sun.dayNightCycle')}</h5>
                {selectedPhase !== null && (
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold text-saffron flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
                    {phases[selectedPhase].label}: {format(phases[selectedPhase].start, 'HH:mm')} - {format(phases[selectedPhase].end, 'HH:mm')}
                  </motion.span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-500">{t('sun.timeline')}</span>
            </div>
            <div className="h-8 w-full rounded-xl overflow-hidden flex bg-black shadow-inner border border-white/10 ring-4 ring-black/5 cursor-pointer">
              {phases.map((p, i) => {
                const width = Math.max(0, getPercent(p.end) - getPercent(p.start));
                if (width <= 0) return null;
                return (
                  <div 
                    key={i} onClick={() => setSelectedPhase(selectedPhase === i ? null : i)}
                    className={cn(
                      "h-full relative group border-r border-white/5 last:border-0 transition-all", 
                      p.color,
                      selectedPhase === i ? "opacity-100 ring-2 ring-inset ring-white/30" : "opacity-80 hover:opacity-100"
                    )} 
                    style={{ width: `${width}%` }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between w-full text-xs font-black text-slate-400 px-2 uppercase tracking-tighter">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <LegendItem color="bg-black" label={t('sun.night')} />
            <LegendItem color="bg-slate-800" label={t('sun.twilight')} />
            <LegendItem color="bg-sky-400" label={t('sun.daylight')} />
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-white/40 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-white/60 dark:border-slate-700">
            <DetailRow label={t('sun.traditionDawn')} value={safeFormat(activeDawn, 'hh:mm:ss a')} />
            <DetailRow label={t('sun.solarNoon')} value={safeFormat(times.solarNoon, 'hh:mm:ss a')} />
            <div className="col-span-2 mt-2 flex items-center justify-between p-4 rounded-2xl bg-saffron/5 border border-saffron/20">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl transition-colors", isBellEnabled ? "bg-saffron text-white" : "bg-slate-200 text-slate-400")}>
                  {isBellEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Solar Noon Bell</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBellEnabled ? 'Active (5 mins before)' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button 
                onClick={toggleBell}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95",
                  isBellEnabled 
                    ? "bg-slate-800 text-white hover:bg-slate-700" 
                    : "bg-saffron text-white hover:bg-saffron/90"
                )}
              >
                {isBellEnabled ? 'Disable' : 'Enable Bell'}
              </button>
            </div>
            <DetailRow label={t('sun.civilTwilight')} value={`${safeFormat(times.dawn, 'HH:mm')} - ${safeFormat(times.sunrise, 'HH:mm')}`} />
            <DetailRow label={t('sun.astroTwilight')} value={`${safeFormat(times.nightEnd, 'HH:mm')} - ${safeFormat(times.nauticalDawn, 'HH:mm')}`} />
            <DetailRow label={t('sun.dayLength')} value={times.sunset && times.sunrise ? `${Math.floor((times.sunset.getTime() - times.sunrise.getTime()) / 3600000)}h ${Math.floor(((times.sunset.getTime() - times.sunrise.getTime()) % 3600000) / 60000)}m` : '--:--'} />
            <DetailRow label={t('sun.nadirPoint')} value={safeFormat(times.nadir, 'hh:mm a')} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
