import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  BookOpen, 
  ChevronDown,
  Moon,
  Circle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  isSameMonth, 
  isSameDay, 
  getDay, 
  isToday, 
  startOfDay, 
  eachDayOfInterval, 
  endOfMonth, 
  subMonths, 
  addMonths,
  subYears,
  addYears 
} from 'date-fns';
import { Settings } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SunDetails } from '../components/SunDetails';
import { SunTimesCalculator } from '../lib/calendar/SunTimesCalculator';
import { cn } from '../lib/utils';
import { convertPali } from '../services/conversionService';
import { uposathaPositionInSeason, uposathasRemainingInSeason, uposathaSeason, getVassaDates, getUposathasForYear as getUposathasFromLib } from '../lib/calendar/uposathalib';
import { useData } from '../DataContext';
import {COLOR_TOKENS} from '../theme/index'

// ─── Color tokens (edit here to retheme the entire calendar) ───────────────────
//
//  LIGHT MODE  — warm cream + golden-brown (Image 2 / IIT Calendar style)
//  DARK  MODE  — near-black + saffron-gold  (Image 1 / Zenith style)
//
// Every value that appears in JSX is looked up via the `t` helper below,
// so you only need to touch this one object to change the palette.
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function PaliText({ text, script, className, style }: { text: string; script: string; className?: string; style?: React.CSSProperties }) {
  const [displayText, setDisplayText] = React.useState(text);

  React.useEffect(() => {
    let active = true;
    convertPali(text, script).then(res => {
      if (active) setDisplayText(res);
    });
    return () => { active = false; };
  }, [text, script]);

  return (
    <span 
      className={className} 
      style={{ ...style, whiteSpace: 'pre-wrap' } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: displayText }}
    />
  );
}

/**
 * Renders an HTML string, converting only text inside <span class="pali">
 * to the user's chosen Pali script. English spans are left untouched.
 */function HtmlWithPali({ html, script, className, style }: { html: string; script: string; className?: string; style?: React.CSSProperties }) {
  const [rendered, setRendered] = React.useState(html);
  React.useEffect(() => {
    let active = true;
    (async () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
      const paliDivs = doc.querySelectorAll('.pali');
      await Promise.all(
        Array.from(paliDivs).map(async (div) => {
          const textNodes: Text[] = [];
          div.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              textNodes.push(node as Text);
            }
          });
          await Promise.all(
            textNodes.map(async (textNode) => {
              const original = textNode.textContent || '';
              const converted = await convertPali(original, script);
              // Replace text node directly with converted text — no wrapper element
              const temp = doc.createElement('template');
              temp.innerHTML = converted;
              textNode.replaceWith(temp.content);
            })
          );
        })
      );
      if (active) {
        setRendered(doc.body.innerHTML);
      }
    })();
    return () => { active = false; };
  }, [html, script]);
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}

export function CalendarScreen({ 
  settings, 
  currentDate, 
  setCurrentDate, 
  selectedDate, 
  setSelectedDate,
  calendarEngine,
  sunCalc 
}: {
  settings: Settings;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarEngine: any;
  sunCalc: SunTimesCalculator;
}) {
  const { t } = useI18n();
  const { events: firebaseEvents, reflections: firebaseReflections } = useData();
  const [sunTimesExpanded, setSunTimesExpanded] = React.useState(false);
  const [paliExpanded, setPaliExpanded] = React.useState(false);
  const [isEventsExpanded, setIsEventsExpanded] = React.useState(false);
  const [reflectionOffset, setReflectionOffset] = React.useState(0);

  const monthDays = React.useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const dateDetails = React.useMemo(() => calendarEngine.getDateDetails(selectedDate), [selectedDate, calendarEngine]);
  const activeDawn = React.useMemo(() => sunCalc.getDawn(selectedDate, settings.dawnMethod), [sunCalc, selectedDate, settings.dawnMethod]);
  const uposathas = React.useMemo(() => {
    if (settings.calendarType === 'srilanka' || settings.calendarType === 'lunar') {
      return getUposathasFromLib(currentDate.getFullYear());
    }
    return calendarEngine.getUposathasForYear(currentDate.getFullYear());
  }, [currentDate, calendarEngine, settings.calendarType]);
  
  const nextUposatha = React.useMemo(() => {
    const refDate = startOfDay(selectedDate);
    return uposathas.find((u: any) => startOfDay(u.date) >= refDate);
  }, [uposathas, selectedDate]);

  const uposathaInfo = React.useMemo(() => {
    if (!nextUposatha) return null;
    return {
      pos: uposathaPositionInSeason(nextUposatha),
      rem: uposathasRemainingInSeason(nextUposatha),
      seas: uposathaSeason(nextUposatha)
    };
  }, [nextUposatha]);

  const isUposathaToday = nextUposatha && isSameDay(nextUposatha.date, selectedDate);

  const vassaDates = React.useMemo(() => getVassaDates(currentDate.getFullYear()), [currentDate]);

  // ── Events Logic ────────────────────────────────────────────────────────
  const todaysEvents = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1; // 1-indexed
    const year = selectedDate.getFullYear();
    const dayOfWeek = format(selectedDate, 'EEEE');

    const checkEvent = (e: any) => {
      if (e.calendar_type === 'day_month_year' && e.day === day && e.month === month && e.year === year) return true;
      if (e.calendar_type === 'day_month' && e.day === day && e.month === month) return true;
      if (e.calendar_type === 'day' && e.day === day) return true;
      if (e.calendar_type === 'day_of_week' && e.day_of_week === dayOfWeek) return true;
      return false;
    };

    // Regional events (filtered by date)
    firebaseEvents.forEach(evt => {
      if (checkEvent(evt)) {
        const groupName = evt.category.replace(/_/g, ' ');
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(evt);
      }
    });

    return groups;
  }, [selectedDate, settings.calendarType, firebaseEvents]);

  // ── Reflections Logic ───────────────────────────────────────────────────
  const reflection = React.useMemo(() => {
    if (firebaseReflections.length === 0) return { quote: "Loading...", author: "...", source: "" };
    // Deterministic "random" based on date
    const seed = selectedDate.getFullYear() * 10000 + (selectedDate.getMonth() + 1) * 100 + selectedDate.getDate();
    const baseIndex = seed % firebaseReflections.length;
    const index = (baseIndex + reflectionOffset) % firebaseReflections.length;
    return firebaseReflections[index];
  }, [selectedDate, firebaseReflections, reflectionOffset]);

  React.useEffect(() => {
    setReflectionOffset(0);
  }, [selectedDate]);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevYear = () => setCurrentDate(subYears(currentDate, 1));
  const nextYear = () => setCurrentDate(addYears(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* ── Calendar Grid Section ─────────────────────────────────────────── */}
      <section
        className="glass-card rounded-[2.5rem] p-4 pt-6 relative overflow-hidden shadow-sm"
        style={{
          // Light: white-ish frosted glass  |  Dark: dark frosted glass
          background: 'color-mix(in srgb, var(--surface) 100%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        

        <header className="flex flex-col gap-4 mt-4 mb-8 px-2 relative z-10">
          <div className="flex justify-between items-center w-full">
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold leading-none flex items-baseline gap-3"
              style={{ color: 'var(--accent)' }}
            >
              {format(currentDate, 'MMMM')}
              <span
                className="italic text-xl sm:text-2xl"
                style={{ color: 'var(--accent)' }}
              >
                {format(currentDate, 'yyyy')}
              </span>
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 h-9 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest transition-colors active:scale-95 flex items-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}
            >
              {t('common.today')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Year nav */}
            <div
              className="flex items-center p-1 rounded-2xl shadow-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <NavBtn onClick={prevYear} small title="Previous Year"><ChevronLeft size="1.2em" className="stroke-[3px]"/></NavBtn>
              <span className="px-1 text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>
                {format(currentDate, 'yyyy')}
              </span>
              <NavBtn onClick={nextYear} small title="Next Year"><ChevronRight size="1.2em" className="stroke-[3px]"/></NavBtn>
            </div>

            {/* Month nav */}
            <div
              className="flex items-center p-1 rounded-xl shadow-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <NavBtn onClick={prevMonth} title="Previous Month"><ChevronLeft size="1.3em"/></NavBtn>
              <span className="px-1 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                {format(currentDate, 'MMM')}
              </span>
              <NavBtn onClick={nextMonth} title="Next Month"><ChevronRight size="1.3em"/></NavBtn>
            </div>
          </div>
        </header>

        <div className="relative z-10 px-1">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-6">
            {DAYS_OF_WEEK.map(day => (
              <span
                key={`header-${day}`}
                className="text-sm font-black text-center tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-3">
            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
              <div key={`month-pad-${i}`} className="h-12 w-full" />
            ))}

            {monthDays.map((date) => {
              const dateInfo = calendarEngine.getDateDetails(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              const isCurrentMonth = isSameMonth(date, currentDate);

              // Check if date has events (Regular calculation, not a hook)
              const dateDay = date.getDate();
              const dateMonth = date.getMonth() + 1;
              const dateYear = date.getFullYear();
              const dateDayOfWeek = format(date, 'EEEE');
              
              const check = (e: any) => {
                if (e.calendar_type === 'day_month_year' && e.day === dateDay && e.month === dateMonth && e.year === dateYear) return true;
                if (e.calendar_type === 'day_month' && e.day === dateDay && e.month === dateMonth) return true;
                if (e.calendar_type === 'day' && e.day === dateDay) return true;
                if (e.calendar_type === 'day_of_week' && e.day_of_week === dateDayOfWeek) return true;
                return false;
              };
              
              const hasEvents = (() => {
                return firebaseEvents.some(check);
              })();

              // Compute text colour imperatively to keep inline styles tidy
              let dateColor: string;
              if (isSelected) dateColor = 'rgb(255 255 255)';
              else if (isTodayDate) dateColor = 'var(--accent)';
              else if (!isCurrentMonth) dateColor = 'var(--text-disabled)';
              else dateColor = 'var(--accent)';

              return (
                <div key={`cell-${date.toISOString()}`} className="flex justify-center relative">
                  <button
                    onClick={() => setSelectedDate(date)}
                    className="h-12 w-12 rounded-2xl flex flex-col items-center justify-center transition-all relative group"
                    style={isSelected
                      ? { background: 'var(--accent)', boxShadow: `0 8px 24px var(--accent-shadow)`, transform: 'scale(1.1)' }
                      : { background: 'transparent' }
                    }
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span
                      className="relative text-base font-semibold z-10"
                      style={{ color: dateColor, fontWeight: isSelected ? 700 : 600 }}
                    >
                      {format(date, 'd')}
                    </span>

                    {/* Uposatha indicator */}
                    {dateInfo.isUposatha && (
                      <div
                        className="absolute -top-1 -right-1 z-20 transition-transform"
                        style={{ color: isSelected ? 'rgb(255 255 255)' : 'var(--lotus)' }}
                      >
                        {dateInfo.moonPhase === 'full' ? (
                          <Circle size={10} fill="currentColor" />
                        ) : dateInfo.moonPhase === 'new' ? (
                          <Moon size={10} fill="currentColor" />
                        ) : (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: 'var(--lotus-muted)' }}
                          />
                        )}
                      </div>
                    )}

                    {/* Today dot */}
                    {isTodayDate && (
                      <div
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--today-dot)' }}
                      />
                    )}

                    {/* Event dash */}
                    {hasEvents && !isTodayDate && (
                      <div
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full opacity-40"
                        style={{ background: isSelected ? 'white' : 'var(--accent)' }}
                      />
                    )}

                    {isSelected && (
                      <motion.div
                        layoutId="sel"
                        className="absolute inset-0 rounded-2xl -z-0"
                        style={{ background: 'var(--accent)', boxShadow: `0 8px 20px var(--accent-shadow)` }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Animated Details ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${settings.calendarType}-${selectedDate.toISOString()}`}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-6"
        >
          {/* Uposatha Alert */}
          {nextUposatha && (
            <div
              className="glass-card rounded-[2rem] p-4 relative overflow-hidden"
              style={{
                background: 'color-mix(in srgb, var(--surface) 90%, var(--lotus-muted))',
                borderColor: 'var(--lotus-muted)',
                boxShadow: `0 10px 30px var(--lotus-shadow)`,
              }}
            >
              <div className="flex items-center gap-2 mb-4 px-1 opacity-60"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}>
                <CalendarIcon size={14} className="text-saffron" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
                  Upcoming Uposatha
                </span>
              </div>

              <div className="flex items-center gap-5 relative z-10">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden"
                  style={{
                    background: 'var(--lotus-muted)',
                    color: 'var(--lotus)',
                    border: '1px solid var(--lotus-muted)',
                  }}
                >
                  <CalendarIcon size={28} className="relative z-10" />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(1 - (Math.max(0, Math.round((nextUposatha.date.getTime() - selectedDate.getTime()) / 86400000)) / (nextUposatha.uDays || 15))) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 right-0"
                    style={{ background: 'var(--lotus-muted)' }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xl font-bold leading-tight" style={{ color: 'var(--accent)' }}>
                        {format(nextUposatha.date, 'MMMM d')}
                      </p>
                    </div>
                    <div className="text-right">
                      {isUposathaToday ? (
                        <div className="flex flex-col items-end">
                           <div 
                            className="p-1 rounded-full mb-1"
                            style={{ color: 'var(--accent)', background: 'var(--accent-subtle)' }}
                           >
                              {nextUposatha.phase === 'full' ? <Circle size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
                           </div>
                           <PaliText 
                            text={nextUposatha.uDays === 14 ? 'Cātuddasī' : 'Paṇṇarasī'}
                            script={settings.paliScript}
                            className="text-sm font-black uppercase tracking-widest"
                            style={{ color: 'var(--accent)' } as React.CSSProperties}
                           />
                        </div>
                      ) : (
                        <>
                          <p
                            className="text-xs font-black uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {t('calendar.startsIn')}
                          </p>
                          <p
                            className="text-2xl font-black flex items-baseline gap-1 justify-end leading-none"
                            style={{ color: 'var(--accent)' }}
                          >
                            {Math.max(0, Math.round((nextUposatha.date.getTime() - selectedDate.setHours(0, 0, 0, 0)) / 86400000))}
                            <span className="text-xs font-black uppercase">{t('calendar.daysLeft')}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between w-full items-center text-center"
                    style={{ borderTop: '1px solid var(--lotus-muted)' }}>
                    <MetaCell label="Season">
                      <PaliText
                        text={uposathaInfo?.seas.season || ''}
                        script={settings.paliScript}
                        className="capitalize"
                      />
                    </MetaCell>
                    <MetaCell label="Occasion">
                      <PaliText 
                        text={uposathaInfo?.pos.label || ''}
                        script={settings.paliScript}
                      />
                    </MetaCell>
                    
                    <MetaCell label="Pakkha" right>
                      <PaliText
                        text={nextUposatha.phase === 'full' ? 'Sukka' : 'Kaṇha'}
                        script={settings.paliScript}
                      />
                    </MetaCell>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl -z-0"
                style={{ background: 'var(--lotus-muted)' }}
              />
            </div>
          )}

          <SunDetails
            expanded={sunTimesExpanded}
            setExpanded={setSunTimesExpanded}
            settings={settings}
            date={selectedDate}
            calculator={sunCalc}
            activeDawn={activeDawn}
          />

      {/* ── Pali & Vassa Details ─────────────────────────────────────────────── */}
      <section 
        className="glass-card rounded-[2.5rem] p-4 space-y-6 shadow-sm border border-white/80 dark:border-slate-800"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Basic Pali Details Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <DetailRow label={t('calendar.month')} value={dateDetails.mName} script={settings.paliScript} />
          <DetailRow label={t('calendar.year')} value={dateDetails.animal} script={settings.paliScript} />
          <DetailRow label={t('calendar.season')} value={dateDetails.season} script={settings.paliScript} />
          <DetailRow label={t('calendar.weekDay')} value={dateDetails.weekDay} script={settings.paliScript} />
        </div>

        {/* Vassa Information Section */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Vassa & Pavāraṇā
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <VassaItem 
              label="Pubba Vassa" 
              entry={vassaDates.pubbaVassaEntry} 
              pavarana={vassaDates.pubbaVassaPavarana} 
            />
            <VassaItem 
              label="Pacchima Vassa" 
              entry={vassaDates.pacchimaVassaEntry} 
              pavarana={vassaDates.pacchimaVassaPavarana} 
            />
          </div>
        </div>
      </section>

          {/* Pali Recitation */}
          <div
            className="glass-card rounded-[2.5rem] p-4 space-y-10 relative overflow-hidden shadow-sm border border-white/80 dark:border-slate-800"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <button onClick={() => setPaliExpanded(!paliExpanded)} className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] opacity-30" style={{ background: 'var(--accent)' }} />
                <h3
                  className="text-xs font-black uppercase tracking-[0.3em]"
                  style={{ color: 'var(--accent)' }}
                >
                  {t('calendar.paliRecitation')}
                </h3>
                <span className="w-8 h-[1px] opacity-30" style={{ background: 'var(--accent)' }} />
              </div>
              <div
                className={cn("p-1.5 rounded-full transition-transform duration-300", paliExpanded && "rotate-180")}
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
              >
                <ChevronDown size={14} />
              </div>
            </button>

            <AnimatePresence>
              {paliExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <pre
                    className="font-serif text-xl leading-[1.8] whitespace-pre-wrap italic text-center mt-6"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <PaliText 
                      text={dateDetails.paliChant}
                      script={settings.paliScript} 
                      style={{ whiteSpace: 'pre-wrap' } as React.CSSProperties}
                    />
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Schedule & Events Section */}
          {Object.keys(todaysEvents).length > 0 && (
            <div 
              className="glass-card rounded-[2.5rem] p-4 space-y-4 shadow-sm border border-white/80 dark:border-slate-800"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <button 
                onClick={() => setIsEventsExpanded(!isEventsExpanded)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-[1px] opacity-30" style={{ background: 'var(--accent)' }} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
                    Schedule & Events
                  </h3>
                  <span className="w-8 h-[1px] opacity-30" style={{ background: 'var(--accent)' }} />
                </div>
                <div
                  className={cn("p-1.5 rounded-full transition-transform duration-300", isEventsExpanded && "rotate-180")}
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <ChevronDown size={14} />
                </div>
              </button>

              <AnimatePresence>
                {isEventsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-6 pt-2"
                  >
                    {Object.entries(todaysEvents).map(([groupName, events]) => (
                      <div key={`event-group-${groupName}`} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                          <span className="text-xs font-black uppercase tracking-widest leading-none opacity-60" style={{ color: 'var(--text-muted)' }}>
                            {groupName}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(events as any[]).map((evt, idx) => (
                            <div 
                              key={`event-item-${groupName}-${evt.id || idx}`} 
                              className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                                  {evt.event_name || evt.subject}
                                </span>
                              </div>
                              {evt.time && (
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm" style={{ color: 'var(--accent)' }}>
                                  {evt.time}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Daily Reflection Card */}
          <div 
            className="glass-card rounded-[2.5rem] p-4 space-y-6 relative overflow-hidden shadow-sm text-center"
            style={{ 
              background: 'var(--surface)', 
              borderColor: 'var(--border)',
              borderWidth: '1px'
            }}
          >
            <div className="flex justify-center mb-2">
              <BookOpen size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <HtmlWithPali
              html={reflection.quote}
              script={settings.paliScript}
              className="font-serif text-xl italic leading-relaxed text-center"
              style={{ color: 'var(--accent)' }}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                {reflection.author === "Buddha" ? "The Buddha" : reflection.author}
              </span>
              <span className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-muted)' }}>
                {reflection.source}
              </span>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setReflectionOffset(prev => prev + 1)}
                className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}
              >
                Next Quote
              </button>
            </div>
            
            <div 
              className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl"
              style={{ background: 'var(--accent-muted)' }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function NavBtn({
  onClick, children, title, small
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-xl transition-all active:scale-90",
        small ? "p-2" : "p-2"
      )}
      style={{ color: 'var(--accent)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function MetaCell({
  label, children, right
}: {
  label: string;
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", right && "text-right")}>
      <span
        className="text-sm font-black uppercase tracking-tighter"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-bold italic"
        style={{ color: 'var(--accent)' }}
      >
        {children}
      </span>
    </div>
  );
}

function DetailRow({ label, value, script }: { label: string; value: string; script: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <PaliText text={value} script={script} className="text-base font-bold" style={{ color: 'var(--accent)' } as React.CSSProperties} />
    </div>
  );
}

function VassaItem({ label, entry, pavarana }: { label: string; entry: Date | null; pavarana: Date | null }) {
  if (!entry || !pavarana) return null;
  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
      <span className="text-sm font-black uppercase tracking-tighter" style={{ color: 'var(--accent)' }}>{label}</span>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Entry</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{format(entry, 'MMM d')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Pavāraṇā</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{format(pavarana, 'MMM d')}</span>
        </div>
      </div>
    </div>
  );
}

function PaliDetailItem({ label, value, script }: { label: string; value: string; script: string }) {
  return (
    <div
      className="glass-card rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <span
        className="text-sm font-black uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <PaliText
        text={value}
        script={script}
        className="text-base font-bold"
        style={{ color: 'var(--accent)' } as React.CSSProperties}
      />
    </div>
  );
}