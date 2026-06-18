import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calendar as CalIcon, Flame, BarChart2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { format, differenceInDays, startOfDay, subDays, isSameDay } from 'date-fns';

export interface StudySession {
  id: string;
  date: string;
  durationMs: number;
}

interface Props {
  show: boolean;
  onClose: () => void;
  sessions: StudySession[];
}

export function StudyReportModal({ show, onClose, sessions }: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'summary'|'detail'|'ranking'>('summary');
  const [chartPeriod, setChartPeriod] = useState<'week'|'month'|'year'>('week');

  const today = startOfDay(new Date());

  // Calculate total hours
  const totalMs = sessions.reduce((acc, s) => acc + s.durationMs, 0);
  const totalHours = (totalMs / 3600000).toFixed(1);

  // Calculate unique days accessed
  const uniqueDays = new Set(sessions.map(s => startOfDay(new Date(s.date)).getTime())).size;

  // Calculate Streak
  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const hasSession = sessions.some(s => isSameDay(startOfDay(new Date(s.date)), d));
    if (hasSession) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Chart Data (Week)
  const chartDays = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(today, 6 - i);
    let ms = 0;
    sessions.forEach(s => {
      if (isSameDay(startOfDay(new Date(s.date)), d)) {
        ms += s.durationMs;
      }
    });
    return {
      label: format(d, 'E')[0],
      hours: ms / 3600000,
      isToday: i === 6
    };
  });
  const maxHours = Math.max(...chartDays.map(d => d.hours), 1); // min 1 to avoid /0

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10">
              <X size={20} />
            </button>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 mt-4">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
              >
                <BarChart2 size={16} /> {t('study.summary') || 'Summary'}
              </button>
              <button 
                onClick={() => setActiveTab('detail')}
                className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-colors ${activeTab === 'detail' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
              >
                {t('study.detail') || 'Detail'}
              </button>
              <button 
                onClick={() => setActiveTab('ranking')}
                className={`flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-colors ${activeTab === 'ranking' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
              >
                {t('study.ranking') || 'Ranking'}
              </button>
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Activity Summary */}
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">{t('study.activitySummary') || 'Activity Summary'}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <Clock size={24} className="text-red-400 mb-2" />
                      <div className="text-2xl font-black text-red-500">{totalHours}</div>
                      <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">{t('study.hoursFocused') || 'hours focused'}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <CalIcon size={24} className="text-red-400 mb-2" />
                      <div className="text-2xl font-black text-red-500">{uniqueDays}</div>
                      <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">{t('study.daysAccessed') || 'days accessed'}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <Flame size={24} className="text-red-400 mb-2" />
                      <div className="text-2xl font-black text-red-500">{currentStreak}</div>
                      <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider">{t('study.dayStreak') || 'day streak'}</div>
                    </div>
                  </div>
                </div>

                {/* Focus Hours */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('study.focusHours') || 'Focus Hours'}</h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                      <button onClick={() => setChartPeriod('week')} className={`px-3 py-1 text-xs font-bold rounded-md ${chartPeriod === 'week' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500'}`}>Week</button>
                      <button onClick={() => setChartPeriod('month')} className={`px-3 py-1 text-xs font-bold rounded-md ${chartPeriod === 'month' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500'}`}>Month</button>
                      <button onClick={() => setChartPeriod('year')} className={`px-3 py-1 text-xs font-bold rounded-md ${chartPeriod === 'year' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500'}`}>Year</button>
                    </div>
                  </div>

                  <div className="h-40 flex items-end justify-between pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    {chartDays.map((day, i) => {
                      const h = day.hours > 0 ? (day.hours / maxHours) * 100 : 0;
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 w-1/7">
                          <div className="w-full flex justify-center h-28 items-end group relative">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              className={`w-6 sm:w-8 rounded-t-sm transition-all duration-500 ${day.isToday ? 'bg-red-400' : 'bg-red-200 dark:bg-red-900/50'}`}
                              style={{ minHeight: day.hours > 0 ? '4px' : '0' }}
                            />
                            {/* Tooltip */}
                            <div className="absolute -top-8 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                              {day.hours.toFixed(1)}h
                            </div>
                          </div>
                          <span className={`text-xs font-bold ${day.isToday ? 'text-red-500' : 'text-slate-400'}`}>
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
            
            {activeTab !== 'summary' && (
              <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm animate-in fade-in">
                Coming Soon
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
