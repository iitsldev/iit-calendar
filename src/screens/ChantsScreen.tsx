import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { chantService } from '../services/ChantService';
import { UserChant, ChantSession, UserChantStats } from '../types';
import { ChantCounter } from '../components/chanting/ChantCounter';
import { ChantList } from '../components/chanting/ChantList';
import { ChantInsights } from '../components/chanting/ChantInsights';
import { Plus, X, BarChart2, List, Trash2, Edit3, Lock, LogIn, ChevronDown, ChevronUp, Settings as SettingsIcon } from 'lucide-react';
import { isSameDay, subDays } from 'date-fns';
import { cn } from '../lib/utils';
import { useUI } from '../UIContext';
import { convertPali, SCRIPTS } from '../services/conversionService';
import { Script } from '../lib/pali-script';
import { Settings } from '../types';
import { useI18n } from '../hooks/useI18n';

function ConvertedText({ text, script, className }: { text: string; script: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    convertPali(text, script).then(setDisplay);
  }, [text, script]);
  return (
    <span
      className={cn("PT", className)}
      script={SCRIPTS[script] || Script.RO}
      dangerouslySetInnerHTML={{ __html: display }}
    />
  );
}

export function ChantsScreen({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const { setShowSettings } = useUI();
  const [chants, setChants] = useState<UserChant[]>([]);
  const [sessions, setSessions] = useState<ChantSession[]>([]);
  const [selectedChantId, setSelectedChantId] = useState<string | null>(null);
  const [activeSessionCount, setActiveSessionCount] = useState(0);
  const [view, setView] = useState<'counter' | 'list' | 'insights'>('counter');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPali, setExpandedPali] = useState(false);
  const [loading, setLoading] = useState(true);

  // New chant form
  const [newChant, setNewChant] = useState({ title: '', content: '', milestone: 108 });

  useEffect(() => {
    // Load history and stats (works offline too)
    const init = async () => {
      const history = await chantService.getSessionHistory();
      setSessions(history);
      setLoading(false);
    };
    init();

    const unsub = chantService.subscribeToUserChants((updated) => {
      setChants(updated);
      if (!selectedChantId && updated.length > 0) {
        setSelectedChantId(updated[0].id);
      }
    });

    return () => unsub();
  }, [selectedChantId]);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal]);

  const stats = useMemo<UserChantStats>(() => {
    const distribution: Record<string, number> = {};
    chants.forEach(c => {
      distribution[c.id] = c.totalCount;
    });

    // Calculate streak
    let streak = 0;
    const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    if (sortedSessions.length > 0) {
      let currentCheck = new Date();
      // If last session was today or yesterday
      for (let i = 0; i < 30; i++) {
        const day = subDays(currentCheck, i);
        const hasActivity = sessions.some(s => isSameDay(new Date(s.timestamp), day));
        if (hasActivity) streak++;
        else if (i > 0) break; // Streak broken
      }
    }

    return {
      totalSessions: sessions.length,
      streakDays: streak,
      distribution
    };
  }, [chants, sessions]);

  const selectedChant = chants.find(c => c.id === selectedChantId);

  const handleCommitSession = async (durationMin?: number) => {
    if (!selectedChantId || activeSessionCount === 0) return;

    await chantService.logSession(selectedChantId, activeSessionCount, durationMin);
    setActiveSessionCount(0);
    // Refresh history
    const history = await chantService.getSessionHistory();
    setSessions(history);
  };

  const handleAddChant = async () => {
    if (!newChant.title) return;

    // Convert content to Roman script if it's not empty
    let convertedContent = newChant.content;
    if (convertedContent) {
      convertedContent = await convertPali(convertedContent, 'roman');
    }

    await chantService.addChant({
      ...newChant,
      content: convertedContent,
      isCustom: true
    });
    setNewChant({ title: '', content: '', milestone: 108 });
    setShowAddModal(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20">{t('chant.loading')}</div>;

  return (
    <div className="flex flex-col min-h-screen relative bg-[var(--bg-main)]">

      {/* Dynamic/Notch-compatible Vector Illustration Header (Chants: ripple/lotus theme) */}
      <div
        className="w-full h-[18vh] min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] bg-gradient-to-tr from-rose-500/20 via-lotus-base/20 to-amber-500/10 sticky top-0 z-10 flex items-center justify-center overflow-hidden"
      >
        {/* Styled CSS/SVG Zen Concentric Rings Art */}
        <svg className="absolute w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] md:w-[220px] md:h-[220px] lg:w-[240px] lg:h-[240px] -translate-y-5" viewBox="0 0 100 100">
          <defs>
            {/* Soft shadow filter for the circular pill container */}
            <filter id="chant-pill-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#4c0519" floodOpacity="0.07" />
            </filter>

            {/* Gradient for the circular pill container: soft desaturated rose/lotus */}
            <linearGradient id="chant-pill-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffe4e6" />
            </linearGradient>
          </defs>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes chant-wave-pulse {
              0%   { r: 0px; opacity: 0.6; }
              100% { r: 46px; opacity: 0; }
            }
            .chant-ripple {
              animation: chant-wave-pulse 8s cubic-bezier(0.25, 0, 0.2, 1) infinite;
              transform-origin: 50px 50px;
            }
          ` }} />

          {/* Ripple waves pulsing outwards from the pill edge (r=18) - 5 waves total */}
          <circle cx="50" cy="50" r="0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0" className="chant-ripple text-rose-500/25 dark:text-rose-400/15" style={{ animationDelay: '0s' }} />
          <circle cx="50" cy="50" r="0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0" className="chant-ripple text-rose-500/25 dark:text-rose-400/15" style={{ animationDelay: '1.6s' }} />
          <circle cx="50" cy="50" r="0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0" className="chant-ripple text-rose-500/25 dark:text-rose-400/15" style={{ animationDelay: '3.2s' }} />
          <circle cx="50" cy="50" r="0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0" className="chant-ripple text-rose-500/25 dark:text-rose-400/15" style={{ animationDelay: '4.8s' }} />
          <circle cx="50" cy="50" r="0" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0" className="chant-ripple text-rose-500/25 dark:text-rose-400/15" style={{ animationDelay: '6.4s' }} />

          {/* Pill Container (Circle) with Soft Shadow and Rose Gradient Fill */}
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="url(#chant-pill-bg)"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="0.4"
            filter="url(#chant-pill-shadow)"
          />

          {/* Lotus image inside the pill */}
          <image
            href="/lotus.png"
            x="39"
            y="39"
            width="22"
            height="22"
            style={{ filter: 'brightness(0) saturate(100%) invert(32%) sepia(71%) saturate(996%) hue-rotate(299deg) brightness(92%) contrast(92%)' }}
          />
        </svg>
      </div>

      {/* Card Overlay container (Oval at the top overlapping the header) */}
      <div className="relative z-20 mt-[-2.5rem] bg-[var(--bg-main)] rounded-t-[3rem] px-4 pt-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.25)] flex flex-col gap-6">

        {/* Title & Tagline info inside the card */}
        <div className="px-2 text-center">
          <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 leading-none mb-1.5">
            {t('chant.chantCounter')}
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
            {t('chant.focusMind')}
          </p>
        </div>

        {/* ── Original Chants Content wrapper ── */}
        <div className="max-w-2xl w-full mx-auto space-y-6">

          {/* Mode Switcher */}
          <div className="flex justify-center gap-2 p-1.5 rounded-full w-fit mx-auto border border-slate-100 dark:border-slate-800">
            {[
              { id: 'counter', icon: List, label: t('chant.chant') },
              { id: 'insights', icon: BarChart2, label: t('chant.insights') }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setView(m.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all",
                  view === m.id
                    ? "bg-saffron text-white shadow-md shadow-saffron/20"
                    : "text-primary-300 dark:text-primary-700 hover:text-primary-600 dark:hover:text-primary-300"
                )}
              >
                <m.icon size={14} />
                {m.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {view === 'counter' && (
              <motion.div
                key="counter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Quick Stats Card */}
                <div className="glass-card rounded-[2.5rem] p-6 bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                      <span className="font-bold text-lg">!</span>
                    </div>
                    <div>
                      <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 mb-0.5">{t('chant.consecutivePractice')}</p>
                      <p className="text-lg font-bold text-primary-200 dark:text-primary-800">{stats.streakDays} {t('chant.days')}</p>
                    </div>
                  </div>                <button
                    onClick={() => setView('insights')}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm"
                  >
                    <BarChart2 size={18} className="text-primary-400 dark:text-primary-500" />
                  </button>
                </div>

                {/* Selected Chant Display */}
                {selectedChant && (
                  <div className="glass-card rounded-[2.5rem] p-6 bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800">
                    <div
                      className="flex justify-between items-center cursor-pointer select-none"
                      onClick={() => setExpandedPali(!expandedPali)}
                    >
                      <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 pr-4">
                        <ConvertedText text={selectedChant.title} script={settings.paliScript} />
                      </h3>
                      <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        {expandedPali ? <ChevronUp size={20} className="text-primary-400 dark:text-primary-500" /> : <ChevronDown size={20} className="text-primary-400 dark:text-primary-500" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedPali && (selectedChant.content || (selectedChant as any).chant) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-700 text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed text-lg">
                            <ConvertedText text={selectedChant.content || (selectedChant as any).chant || ''} script={settings.paliScript} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {selectedChant && (
                  <ChantCounter
                    currentCount={activeSessionCount}
                    onCountChange={setActiveSessionCount}
                    targetCount={selectedChant.milestone || 108}
                    onCommit={handleCommitSession}
                  />
                )}

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-serif text-xl mb-4 text-stone-900 dark:text-stone-100">{t('chant.selectChant')}</h4>
                  <ChantList
                    chants={chants}
                    selectedChantId={selectedChantId}
                    onSelect={setSelectedChantId}
                    onAddChant={() => setShowAddModal(true)}
                    paliScript={settings.paliScript}
                  />
                </div>
              </motion.div>
            )}

            {view === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChantInsights chants={chants} sessions={sessions} stats={stats} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Modal */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowAddModal(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl space-y-6 border border-white/50 dark:border-slate-800"
              >
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 break-words min-w-0 pr-2">{t('chant.newChant')}</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-primary-400 dark:text-primary-500 flex-shrink-0 mt-1"><X /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 block mb-2 px-1">{t('chant.chantName')}</label>
                    <input
                      type="text"
                      value={newChant.title}
                      onChange={e => setNewChant({ ...newChant, title: e.target.value })}
                      placeholder="e.g. Itipiso"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border-none focus:ring-2 focus:ring-saffron/20"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 block mb-2 px-1">{t('chant.chantContent')}</label>
                    <textarea
                      value={newChant.content}
                      onChange={e => setNewChant({ ...newChant, content: e.target.value })}
                      placeholder="Enter Pali text..."
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border-none focus:ring-2 focus:ring-saffron/20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 block mb-2 px-1">{t('chant.milestone')}</label>
                    <input
                      type="number"
                      value={newChant.milestone}
                      onChange={e => setNewChant({ ...newChant, milestone: parseInt(e.target.value) || 108 })}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border-none focus:ring-2 focus:ring-saffron/20"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddChant}
                  disabled={!newChant.title}
                  className="w-full py-5 bg-[#7f5700] text-white rounded-full font-black uppercase tracking-widest transition-all shadow-lg shadow-[#7f5700]/20 active:scale-95"
                >
                  {t('chant.createChant')}
                </button>
              </motion.div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
