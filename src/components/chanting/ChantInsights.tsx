import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Award, Zap, TrendingUp, Calendar } from 'lucide-react';
import { UserChant, ChantSession, UserChantStats } from '../../types';
import { cn } from '../../lib/utils';
import { format, startOfDay, subDays, isSameDay } from 'date-fns';
import { useI18n } from '../../hooks/useI18n';

interface ChantInsightsProps {
  chants: UserChant[];
  sessions: ChantSession[];
  stats: UserChantStats;
}

export function ChantInsights({ chants, sessions, stats }: ChantInsightsProps) {
  const { t } = useI18n();
  const totalChants = chants.reduce((sum, c) => sum + c.totalCount, 0);
  
  // Aggregate data for Pie Chart
  const pieData = chants
    .filter(c => c.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 5)
    .map(c => ({
      name: c.title,
      value: c.totalCount,
      percent: Math.round((c.totalCount / (totalChants || 1)) * 100)
    }));

  const COLORS = ['#7f5700', '#d48820', '#e8ac41', '#f5bc5f', '#f9d191'];

  // Consistency Grid (Last 28 days)
  const today = startOfDay(new Date());
  const gridDays = Array.from({ length: 28 }).map((_, i) => {
    const date = subDays(today, 27 - i);
    const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), date));
    const total = daySessions.reduce((sum, s) => sum + s.count, 0);
    return { date, total };
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden bg-white/50 dark:bg-slate-900 shadow-sm border border-white/60 dark:border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t('chant.totalChants')}</h3>
            <div className="p-3 bg-[#7f5700]/10 rounded-2xl text-[#7f5700]">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl font-medium text-[#7f5700]">{totalChants.toLocaleString()}</span>
            <span className="text-slate-400 font-bold uppercase text-[0.65rem] tracking-widest">{t('chant.completed')}</span>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="glass-card rounded-[2.5rem] p-8 bg-white/50 dark:bg-slate-900 border border-white/60 dark:border-slate-800">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('chant.chantDistribution')}</h3>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Award className="text-[#7f5700]/20" size={32} />
            </div>
          </div>
          <div className="flex-1 space-y-4 w-full">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#7f5700] transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-black font-mono text-slate-400">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consistency Grid */}
      <div className="glass-card rounded-[2.5rem] p-8 bg-white/50 dark:bg-slate-900 border border-white/60 dark:border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t('chant.practiceConsistency')}</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-900/40">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[0.65rem] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">{stats.streakDays} {t('chant.dayStreak')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {gridDays.map((day, i) => {
            const opacity = day.total === 0 ? 'bg-slate-100 dark:bg-slate-800' : 
                            day.total < 10 ? 'bg-[#7f5700]/20' :
                            day.total < 50 ? 'bg-[#7f5700]/50' :
                            day.total < 100 ? 'bg-[#7f5700]/80' : 'bg-[#7f5700]';
            return (
              <motion.div
                key={i}
                title={`${format(day.date, 'MMM d')}: ${day.total} chants`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className={cn("aspect-square rounded-[0.5rem] transition-all", opacity)}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-[0.6rem] font-black uppercase tracking-widest text-slate-400 px-1">
          <span>{t('chant.less')}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <div className="w-2 h-2 rounded-sm bg-[#7f5700]/20" />
            <div className="w-2 h-2 rounded-sm bg-[#7f5700]/50" />
            <div className="w-2 h-2 rounded-sm bg-[#7f5700]/80" />
            <div className="w-2 h-2 rounded-sm bg-[#7f5700]" />
          </div>
          <span>{t('chant.more')}</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="glass-card rounded-[2.5rem] p-8 bg-white/50 dark:bg-slate-900 border border-white/60 dark:border-slate-800">
        <h3 className="font-serif text-2xl text-slate-800 dark:text-slate-100 mb-2">{t('chant.milestones')}</h3>
        <p className="text-xs text-slate-400 mb-8 italic">"Your spiritual journey is blossoming beautifully."</p>

        <div className="space-y-6">
          {chants.filter(c => c.milestone && c.milestone > 0).map(chant => (
            <div key={chant.id} className="space-y-2">
              <div className="flex justify-between items-center text-[0.65rem] font-black uppercase tracking-widest text-slate-500">
                <span>{chant.title} {t('chant.goal')}</span>
                <span className="text-[#d48820]">{chant.totalCount} / {chant.milestone}</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (chant.totalCount / (chant.milestone || 1)) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-[#d48820] to-[#7f5700]" 
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Badges/Rankings */}
        <div className="mt-12 flex justify-center gap-6">
          <Badge type={t('chant.novice')} active={totalChants < 1000} t={t} />
          <Badge type={t('chant.devotee')} active={totalChants >= 1000 && totalChants < 5000} t={t} />
          <Badge type={t('chant.master')} active={totalChants >= 5000} t={t} />
        </div>
      </div>
    </div>
  );
}

function Badge({ type, active, t }: { type: string, active: boolean, t: any }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-3 transition-opacity",
      active ? "opacity-100" : "opacity-30"
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center border-2",
        active ? "border-[#7f5700] bg-white dark:bg-slate-800 shadow-lg" : "border-slate-200 dark:border-slate-800"
      )}>
        <Award size={24} className={active ? "text-[#7f5700]" : "text-slate-300"} />
      </div>
      <span className={cn(
        "text-[0.65rem] font-black uppercase tracking-widest",
        active ? "text-[#7f5700]" : "text-slate-400"
      )}>{type}</span>
    </div>
  );
}
