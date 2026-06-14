import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, PlusCircle, CheckCircle2, Circle, MoreVertical, Trash2, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../hooks/useI18n';
import { StudySettingsModal, StudySettings } from '../components/study/StudySettingsModal';
import { StudyReportModal, StudySession } from '../components/study/StudyReportModal';
import { alarmService } from '../services/alarm/AlarmService';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface Task {
  id: string;
  name: string;
  est: number;
  act: number;
  completed: boolean;
}

const DEFAULT_SETTINGS: StudySettings = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  autoCheckTasks: false,
  checkToBottom: true,
};

export function StudyScreen() {
  const { t } = useI18n();
  
  // Settings & Sessions
  const [settings, setSettings] = useState<StudySettings>(() => {
    const saved = localStorage.getItem('study_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Timer State
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('study_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem('study_active_task') || null;
  });
  
  // Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ name: '', est: 1 });

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('study_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('study_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem('study_active_task', activeTaskId);
    } else {
      localStorage.removeItem('study_active_task');
    }
  }, [activeTaskId]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBell = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode]);
    setIsRunning(false);
    alarmService.stopStudyTimer();
    alarmService.stopForegroundTimer();
  };

  useEffect(() => {
    if (isRunning) {
      alarmService.startStudyTimer(timeLeft * 1000, mode);
      alarmService.startForegroundTimer(
        timeLeft * 1000,
        (rem) => setTimeLeft(Math.floor(rem / 1000)),
        () => handleTimerComplete()
      );
    } else {
      alarmService.stopStudyTimer();
      alarmService.stopForegroundTimer();
    }
    return () => {
      alarmService.stopStudyTimer();
      alarmService.stopForegroundTimer();
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playBell();
    alarmService.stopStudyTimer();

    if (mode === 'pomodoro') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      
      // Log session
      const session: StudySession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        durationMs: settings.pomodoro * 1000
      };
      setSessions(prev => [...prev, session]);

      // Update task actual count if there is an active task
      if (activeTaskId) {
        setTasks(prev => {
          let updated = prev.map(t => 
            t.id === activeTaskId ? { ...t, act: t.act + 1 } : t
          );
          
          if (settings.autoCheckTasks) {
            updated = updated.map(t => {
              if (t.id === activeTaskId && t.act >= t.est) {
                return { ...t, completed: true };
              }
              return t;
            });
          }
          
          if (settings.checkToBottom) {
            const completed = updated.filter(t => t.completed);
            const active = updated.filter(t => !t.completed);
            return [...active, ...completed];
          }
          return updated;
        });
      }

      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreak);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      setMode('pomodoro');
      setTimeLeft(settings.pomodoro);
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      initAudio(); // Initialize audio context on user gesture
    }
    setIsRunning(!isRunning);
  };

  const handleSaveTask = () => {
    if (!taskForm.name.trim()) return;

    if (editingTaskId) {
      setTasks(prev => prev.map(t => 
        t.id === editingTaskId ? { ...t, name: taskForm.name, est: taskForm.est } : t
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        name: taskForm.name,
        est: taskForm.est,
        act: 0,
        completed: false,
      };
      setTasks(prev => [...prev, newTask]);
      if (!activeTaskId) setActiveTaskId(newTask.id);
    }
    
    setTaskForm({ name: '', est: 1 });
    setShowTaskForm(false);
    setEditingTaskId(null);
  };

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({ name: task.name, est: task.est });
    setShowTaskForm(true);
  };

  const toggleTaskCompletion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeTaskId === taskId) setActiveTaskId(null);
    if (editingTaskId === taskId) {
      setShowTaskForm(false);
      setEditingTaskId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Theming colors based on mode (simulating pomofocus UI but mapped to our theme tokens if needed)
  const getModeColorClass = () => {
    switch (mode) {
      case 'pomodoro': return 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'shortBreak': return 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/50';
      case 'longBreak': return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
    }
  };

  const getModeBg = () => {
    switch (mode) {
      case 'pomodoro': return 'bg-red-50 dark:bg-red-950/20';
      case 'shortBreak': return 'bg-teal-50 dark:bg-teal-950/20';
      case 'longBreak': return 'bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-700 p-2 min-h-[70vh] rounded-[2.5rem] transition-colors relative", getModeBg())}>
      
      {/* Top Bar for Study Screen */}
      <div className="flex justify-between items-center px-4 pt-2">
        <h2 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-200">
          Pomodoro
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-black/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/40 transition-colors"
          >
            <BarChart2 size={14} /> {t('study.report') || 'Report'}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-black/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/40 transition-colors"
          >
            <Settings2 size={14} /> {t('study.settings') || 'Settings'}
          </button>
        </div>
      </div>

      {/* Timer Card */}
      <div className={cn("glass-card rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center transition-colors shadow-sm", getModeColorClass())}>
        
        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 bg-white/50 dark:bg-black/20 p-1.5 rounded-full border border-black/5 dark:border-white/5 backdrop-blur-md overflow-x-auto w-full max-w-[320px] justify-between">
          <button 
            onClick={() => switchMode('pomodoro')}
            className={cn("px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all", mode === 'pomodoro' ? 'bg-white dark:bg-white/10 shadow-sm' : 'opacity-60')}
          >
            {t('study.pomodoro') || 'Pomodoro'}
          </button>
          <button 
            onClick={() => switchMode('shortBreak')}
            className={cn("px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all", mode === 'shortBreak' ? 'bg-white dark:bg-white/10 shadow-sm' : 'opacity-60')}
          >
            {t('study.shortBreak') || 'Short Break'}
          </button>
          <button 
            onClick={() => switchMode('longBreak')}
            className={cn("px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all", mode === 'longBreak' ? 'bg-white dark:bg-white/10 shadow-sm' : 'opacity-60')}
          >
            {t('study.longBreak') || 'Long Break'}
          </button>
        </div>

        {/* Time Display */}
        <div className="font-serif text-8xl sm:text-9xl font-bold tracking-tighter mb-8 drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>

        {/* Start/Stop Button */}
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-full max-w-[240px] py-5 rounded-full font-black text-xl uppercase tracking-widest transition-transform active:scale-95 shadow-xl border-b-4",
            mode === 'pomodoro' ? 'bg-red-500 hover:bg-red-600 border-red-700 text-white' : '',
            mode === 'shortBreak' ? 'bg-teal-500 hover:bg-teal-600 border-teal-700 text-white' : '',
            mode === 'longBreak' ? 'bg-blue-500 hover:bg-blue-600 border-blue-700 text-white' : '',
            isRunning && 'translate-y-[4px] border-b-0 shadow-sm'
          )}
        >
          {isRunning ? (t('study.pause') || 'PAUSE') : (t('study.start') || 'START')}
        </button>
      </div>

      {/* Task Section */}
      <div className="max-w-md mx-auto mt-8 w-full px-2 pb-10">
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-200">{t('study.tasks') || 'Tasks'}</h2>
          <button className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3 mb-6">
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => setActiveTaskId(task.id)}
              className={cn(
                "glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer border-l-4 transition-all hover:-translate-y-0.5",
                activeTaskId === task.id ? 'border-l-saffron shadow-md' : 'border-l-transparent',
                task.completed ? 'opacity-60' : ''
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button onClick={(e) => toggleTaskCompletion(task.id, e)} className="flex-shrink-0 text-red-500 dark:text-red-400">
                  {task.completed ? <CheckCircle2 size={24} className="text-red-500" /> : <Circle size={24} className="text-slate-300 dark:text-slate-600" />}
                </button>
                <span className={cn("font-medium truncate", task.completed && "line-through text-slate-500")}>
                  {task.name}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                  {task.act} / {task.est}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); editTask(task); }}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Form / Button */}
        {showTaskForm ? (
          <div className="glass-card p-5 rounded-[2rem] shadow-lg animate-in slide-in-from-top-4">
            <input 
              type="text" 
              placeholder={t('study.taskName') || "What are you working on?"}
              value={taskForm.name}
              onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
              autoFocus
              className="w-full text-lg font-medium bg-transparent outline-none border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-4 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('study.estPomodoros') || 'Est Pomodoros'}</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="1"
                  value={taskForm.est}
                  onChange={(e) => setTaskForm({...taskForm, est: Math.max(1, parseInt(e.target.value) || 1)})}
                  className="w-20 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-center font-bold text-slate-700 dark:text-slate-300 outline-none border border-slate-200 dark:border-slate-700"
                />
                <div className="flex gap-2">
                  <button onClick={() => setTaskForm(prev => ({...prev, est: prev.est + 1}))} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">+</button>
                  <button onClick={() => setTaskForm(prev => ({...prev, est: Math.max(1, prev.est - 1)}))} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">-</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 bg-slate-50 dark:bg-slate-900/50 -mx-5 -mb-5 px-5 py-4 rounded-b-[2rem]">
              {editingTaskId ? (
                <button onClick={() => deleteTask(editingTaskId)} className="text-sm font-bold text-red-500 uppercase tracking-widest">{t('study.delete') || 'Delete'}</button>
              ) : <div />}
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowTaskForm(false); setEditingTaskId(null); }}
                  className="px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest text-slate-500"
                >
                  {t('study.cancel') || 'Cancel'}
                </button>
                <button 
                  onClick={handleSaveTask}
                  className="px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md active:scale-95"
                >
                  {t('study.save') || 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => { setTaskForm({name: '', est: 1}); setShowTaskForm(true); }}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <PlusCircle size={20} /> {t('study.addTask') || 'Add Task'}
          </button>
        )}
      </div>

      <StudySettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={settings} 
        onUpdate={(newSettings) => {
          setSettings(newSettings);
          // If timer is NOT running, update current time left to match new setting
          if (!isRunning) {
            setTimeLeft(newSettings[mode]);
          } else {
            // Mid-session update
            const newDurationMs = newSettings[mode] * 1000;
            alarmService.rescheduleStudyTimer(newDurationMs, mode);
            setTimeLeft(newSettings[mode]);
          }
        }} 
      />

      <StudyReportModal 
        show={showReport}
        onClose={() => setShowReport(false)}
        sessions={sessions}
      />
    </div>
  );
}
