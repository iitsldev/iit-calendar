import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckSquare } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface StudySettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  autoCheckTasks: boolean;
  checkToBottom: boolean;
}

interface Props {
  show: boolean;
  onClose: () => void;
  settings: StudySettings;
  onUpdate: (settings: StudySettings) => void;
}

export function StudySettingsModal({ show, onClose, settings, onUpdate }: Props) {
  const { t } = useI18n();

  const handleChange = (key: keyof StudySettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleTimeChange = (key: 'pomodoro' | 'shortBreak' | 'longBreak', valueStr: string) => {
    const val = parseInt(valueStr);
    if (!isNaN(val) && val > 0) {
      handleChange(key, val * 60); // convert min to sec
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="font-bold text-slate-500 tracking-widest text-sm uppercase">
                {t('study.settings') || 'Setting'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
              
              {/* TIMER SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
                  <Clock size={16} /> {t('study.timer') || 'Timer'}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t('study.timeMinutes') || 'Time (minutes)'}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 block mb-1">Pomodoro</label>
                      <input 
                        type="number" 
                        value={Math.floor(settings.pomodoro / 60)}
                        onChange={(e) => handleTimeChange('pomodoro', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 block mb-1">Short Break</label>
                      <input 
                        type="number" 
                        value={Math.floor(settings.shortBreak / 60)}
                        onChange={(e) => handleTimeChange('shortBreak', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 block mb-1">Long Break</label>
                      <input 
                        type="number" 
                        value={Math.floor(settings.longBreak / 60)}
                        onChange={(e) => handleTimeChange('longBreak', e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('study.autoStartBreaks') || 'Auto Start Breaks'}</span>
                  <Toggle checked={settings.autoStartBreaks} onChange={(val) => handleChange('autoStartBreaks', val)} />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('study.autoStartPomodoros') || 'Auto Start Pomodoros'}</span>
                  <Toggle checked={settings.autoStartPomodoros} onChange={(val) => handleChange('autoStartPomodoros', val)} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('study.longBreakInterval') || 'Long Break interval'}</span>
                  <input 
                    type="number"
                    value={settings.longBreakInterval}
                    onChange={(e) => handleChange('longBreakInterval', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none font-medium text-slate-700 dark:text-slate-300 text-center"
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* TASK SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
                  <CheckSquare size={16} /> {t('study.task') || 'Task'}
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('study.autoCheckTasks') || 'Auto Check Tasks'}</span>
                  <Toggle checked={settings.autoCheckTasks} onChange={(val) => handleChange('autoCheckTasks', val)} />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('study.checkToBottom') || 'Check to Bottom'}</span>
                  <Toggle checked={settings.checkToBottom} onChange={(val) => handleChange('checkToBottom', val)} />
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${checked ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <motion.div 
        layout
        className="w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
