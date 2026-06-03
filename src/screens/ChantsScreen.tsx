import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chantService } from '../services/ChantService';
import { UserChant, ChantSession, UserChantStats } from '../types';
import { ChantCounter } from '../components/chanting/ChantCounter';
import { ChantList } from '../components/chanting/ChantList';
import { ChantInsights } from '../components/chanting/ChantInsights';
import { Plus, X, BarChart2, List, Trash2, Edit3, Lock, LogIn } from 'lucide-react';
import { isSameDay, subDays } from 'date-fns';
import { cn } from '../lib/utils';
import { useUI } from '../UIContext';
import { convertPali, SCRIPTS } from '../services/conversionService';
import { Script } from '../lib/pali-script';
import { Settings } from '../types';

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
  const { setShowSettings } = useUI();
  const [chants, setChants] = useState<UserChant[]>([]);
  const [sessions, setSessions] = useState<ChantSession[]>([]);
  const [selectedChantId, setSelectedChantId] = useState<string | null>(null);
  const [activeSessionCount, setActiveSessionCount] = useState(0);
  const [view, setView] = useState<'counter' | 'list' | 'insights'>('counter');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewChant, setViewChant] = useState<UserChant | null>(null);
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

  const handleCommitSession = async () => {
    if (!selectedChantId || activeSessionCount === 0) return;
    
    await chantService.logSession(selectedChantId, activeSessionCount);
    setActiveSessionCount(0);
    // Refresh history
    const history = await chantService.getSessionHistory();
    setSessions(history);
  };

  const handleAddChant = async () => {
    if (!newChant.title) return;
    await chantService.addChant({
      ...newChant,
      isCustom: true
    });
    setNewChant({ title: '', content: '', milestone: 108 });
    setShowAddModal(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center py-6">
        <h2 className="font-serif text-4xl text-saffron dark:text-amber-500 mb-1">Chant Counter</h2>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-primary-400 dark:text-primary-500">Focus your mind</p>
      </header>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-2 p-1.5 rounded-full w-fit mx-auto border border-slate-100 dark:border-slate-800">
        {[
          { id: 'counter', icon: List, label: 'Chant' },
          { id: 'insights', icon: BarChart2, label: 'Insights' }
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
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 mb-0.5">Consecutive Practice</p>
                  <p className="text-lg font-bold text-primary-200 dark:text-primary-800">{stats.streakDays} Days</p>
                </div>
              </div>                <button 
                onClick={() => setView('insights')}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <BarChart2 size={18} className="text-primary-400 dark:text-primary-500" />
              </button>
            </div>

            {/* List and Counter Integration */}
            <ChantList 
              chants={chants} 
              selectedChantId={selectedChantId} 
              onSelect={setSelectedChantId} 
              onAddChant={() => setShowAddModal(true)}
              onViewChant={(id) => setViewChant(chants.find(c => c.id === id) || null)}
              paliScript={settings.paliScript}
            />

            {selectedChant && (
              <ChantCounter
                currentCount={activeSessionCount}
                onCountChange={setActiveSessionCount}
                targetCount={selectedChant.milestone || 108}
                onCommit={handleCommitSession}
              />
            )}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl space-y-6 border border-white/50 dark:border-slate-800"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100">New Chant</h3>
              <button onClick={() => setShowAddModal(false)} className="text-primary-400 dark:text-primary-500"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 block mb-2 px-1">Chant Name</label>
                <input 
                  type="text" 
                  value={newChant.title}
                  onChange={e => setNewChant({...newChant, title: e.target.value})}
                  placeholder="e.g. Itipiso"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border-none focus:ring-2 focus:ring-saffron/20"
                />
              </div>
              <div>
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-primary-300 dark:text-primary-700 block mb-2 px-1">MileStone (e.g. 108)</label>
                <input 
                  type="number" 
                  value={newChant.milestone}
                  onChange={e => setNewChant({...newChant, milestone: parseInt(e.target.value) || 108})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-stone-900 dark:text-stone-100 border-none focus:ring-2 focus:ring-saffron/20"
                />
              </div>
            </div>

            <button
              onClick={handleAddChant}
              disabled={!newChant.title}
              className="w-full py-5 bg-[#7f5700] text-white rounded-full font-black uppercase tracking-widest transition-all shadow-lg shadow-[#7f5700]/20 active:scale-95"
            >
              Create Chant
            </button>
          </motion.div>
        </div>
      )}

      {/* View Chant Modal */}
      {viewChant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg max-h-[80vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                <ConvertedText text={viewChant.title} script={settings.paliScript} />
              </h3>
              <button onClick={() => setViewChant(null)} className="text-primary-400 dark:text-primary-500"><X /></button>
            </div>
            
            <div className="overflow-y-auto pr-4 scrollbar-hide text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed text-lg">
               <ConvertedText text={viewChant.content || (viewChant as any).chant || ''} script={settings.paliScript} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
