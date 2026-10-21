import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  format, 
  subMinutes, 
  addDays 
} from 'date-fns';
import { 
  Sunset, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Volume2, 
  VolumeX,
  Sparkles
} from 'lucide-react';
import { Modal } from './Modal';
import { useI18n } from '../hooks/useI18n';
import { Settings } from '../types';
import { SunTimesCalculator } from '../lib/calendar/SunTimesCalculator';
import { bellSoundService } from '../services/BellSoundService';
import { cn } from '../lib/utils';

export interface SolarCountdownModalProps {
  show: boolean;
  onClose: () => void;
  settings: Settings;
  calculator: SunTimesCalculator;
  date?: Date;
}

export function SolarCountdownModal({
  show,
  onClose,
  settings,
  calculator,
  date,
}: SolarCountdownModalProps) {
  const { t } = useI18n();
  const [countToSafe, setCountToSafe] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Audio alert tracking refs
  const hasAlerted5Min = useRef(false);
  const hasAlertedZero = useRef(false);

  // Timestamp when modal opened (resets every time modal opens)
  const [openedAtMs, setOpenedAtMs] = useState<number>(() => Date.now());

  // Live ticking clock updated every 250ms
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!show) return;
    const openTime = Date.now();
    setOpenedAtMs(openTime);
    setNow(new Date(openTime));
    hasAlerted5Min.current = false;
    hasAlertedZero.current = false;

    const interval = setInterval(() => {
      setNow(new Date());
    }, 250);

    return () => clearInterval(interval);
  }, [show]);

  // Keep screen awake automatically whenever the modal is open
  useEffect(() => {
    if (!show) return;

    let wakeLockSentinel: WakeLockSentinel | null = null;
    let isMounted = true;

    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(lock => {
          if (!isMounted) {
            lock.release().catch(() => {});
            return;
          }
          wakeLockSentinel = lock;
        })
        .catch(err => {
          console.warn('Screen Wake Lock request failed:', err);
        });
    }

    return () => {
      isMounted = false;
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [show]);

  // Astronomical Solar Noon calculations for today
  const solarCalculations = useMemo(() => {
    const today = new Date();
    const times = calculator.getStandardTimes(today);
    const safeOffset = settings.noonSafeOffset || 0;
    const rawNoon = times.solarNoon;
    const safeNoon = rawNoon ? subMinutes(rawNoon, safeOffset) : null;

    // Tomorrow noon in case today's has passed
    const tomorrow = addDays(today, 1);
    const tomorrowTimes = calculator.getStandardTimes(tomorrow);
    const tomorrowRawNoon = tomorrowTimes.solarNoon;
    const tomorrowSafeNoon = tomorrowRawNoon ? subMinutes(tomorrowRawNoon, safeOffset) : null;

    return {
      today,
      rawNoon,
      safeNoon,
      safeOffset,
      tomorrowRawNoon,
      tomorrowSafeNoon,
    };
  }, [calculator, settings]);

  // Target time info
  const targetInfo = useMemo(() => {
    const { rawNoon, safeNoon, safeOffset, tomorrowRawNoon, tomorrowSafeNoon } = solarCalculations;
    const nowMs = now.getTime();

    const activeTarget = (countToSafe && safeOffset > 0 && safeNoon) ? safeNoon : rawNoon;
    if (!activeTarget || !rawNoon) {
      return {
        targetTime: null,
        rawTargetTime: null,
        safeTargetTime: null,
        diffMs: 0,
        rawDiffMs: 0,
        isPassed: false,
        isSafePassed: false,
        safeOffset: 0,
        tomorrowTarget: tomorrowRawNoon,
      };
    }

    const diffMs = activeTarget.getTime() - nowMs;
    const rawDiffMs = rawNoon.getTime() - nowMs;
    const isSafePassed = safeNoon ? (safeNoon.getTime() <= nowMs) : false;
    const isPassed = rawDiffMs <= 0;

    return {
      targetTime: activeTarget,
      rawTargetTime: rawNoon,
      safeTargetTime: safeNoon,
      diffMs: isPassed ? rawDiffMs : diffMs,
      rawDiffMs,
      isPassed,
      isSafePassed,
      safeOffset,
      tomorrowTarget: (countToSafe && safeOffset > 0 && tomorrowSafeNoon) ? tomorrowSafeNoon : tomorrowRawNoon,
    };
  }, [countToSafe, now, solarCalculations]);

  // Audio chimes at 5m and 0m
  useEffect(() => {
    if (!soundEnabled || !targetInfo.targetTime) return;
    const diffMs = targetInfo.diffMs;

    if (diffMs > 0 && diffMs <= 300000 && diffMs >= 298000 && !hasAlerted5Min.current) {
      hasAlerted5Min.current = true;
      bellSoundService.playBell(true, 'bowl');
    }

    if (diffMs <= 1000 && diffMs >= -2000 && !hasAlertedZero.current) {
      hasAlertedZero.current = true;
      bellSoundService.playBell(true, 'gong');
    }
  }, [targetInfo.diffMs, soundEnabled, targetInfo.targetTime]);

  // Formatted countdown digits
  const { timeString, label, timeSegments } = useMemo(() => {
    const isPassed = targetInfo.isPassed;
    const isSafePassed = targetInfo.isSafePassed && countToSafe;
    const ms = Math.abs(targetInfo.diffMs);
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    let formatted = hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

    let tagLabel = 'KĀLA';
    if (isPassed) {
      tagLabel = t('sun.vikala') || 'VIKĀLA';
    } else if (isSafePassed) {
      tagLabel = t('sun.safeBufferEnded') || 'SAFE BUFFER ENDED';
    } else if (targetInfo.diffMs <= 5 * 60 * 1000) {
      tagLabel = 'URGENT';
    } else if (targetInfo.diffMs <= 15 * 60 * 1000) {
      tagLabel = 'FINAL MINUTES';
    } else {
      tagLabel = t('sun.kala') || 'KĀLA';
    }

    return {
      timeString: formatted,
      timeSegments: formatted.split(':'),
      label: tagLabel,
    };
  }, [targetInfo, countToSafe, t]);

  // Urgency status details
  const urgencyStatus = useMemo(() => {
    if (targetInfo.isPassed) {
      return {
        level: 'passed',
        title: t('sun.vikala') || 'Vikāla',
        subtitle: t('sun.noonPassed') || 'Solar Noon has passed',
        badgeBg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
        icon: AlertCircle,
      };
    }
    if (targetInfo.isSafePassed && countToSafe) {
      return {
        level: 'safe-passed',
        title: t('sun.safeBufferEnded') || 'Safe Buffer Reached',
        subtitle: `Exact solar noon in ${Math.ceil(Math.abs(targetInfo.rawDiffMs) / 60000)}m`,
        badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
        icon: AlertCircle,
      };
    }
    if (targetInfo.diffMs <= 5 * 60 * 1000) {
      return {
        level: 'critical',
        title: t('sun.approachingNoon') || 'Approaching Solar Noon',
        subtitle: 'Less than 5 minutes remaining',
        badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
        icon: ShieldAlert,
      };
    }
    if (targetInfo.diffMs <= 15 * 60 * 1000) {
      return {
        level: 'warning',
        title: t('sun.approachingNoon') || 'Approaching Solar Noon',
        subtitle: 'Approximately 15 minutes remaining',
        badgeBg: 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
        icon: CheckCircle2,
      };
    }
    return {
      level: 'normal',
      title: t('sun.kala') || 'Kāla',
      subtitle: t('sun.kalaDesc') || 'Allowable time before Solar Noon',
      badgeBg: 'bg-[var(--accent-subtle)] border-[var(--accent-muted)] text-[var(--accent)]',
      icon: CheckCircle2,
    };
  }, [targetInfo, countToSafe, t]);

  const formatTargetTime = (d: Date | null | undefined) => {
    if (!d || isNaN(d.getTime())) return '--:--';
    return format(d, 'hh:mm:ss a');
  };

  const StatusIcon = urgencyStatus.icon;

  // Session progress: 0% when modal opens, increasing to 100% at noon
  const sessionProgress = useMemo(() => {
    if (!targetInfo.targetTime || targetInfo.isPassed) return 100;
    const targetMs = targetInfo.targetTime.getTime();
    const totalSessionMs = Math.max(1000, targetMs - openedAtMs);
    const elapsedMs = Math.max(0, now.getTime() - openedAtMs);
    return Math.min(100, Math.max(0, (elapsedMs / totalSessionMs) * 100));
  }, [targetInfo.targetTime, targetInfo.isPassed, openedAtMs, now]);

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={t('sun.noonCountdown') || 'Noon Countdown'}
      icon={Sunset}
      maxWidth="md"
    >
      <div className="flex flex-col items-center w-full pt-1">
        {/* Date and Current Time Subtitle */}
        <div className="w-full flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--accent)]" />
            <span>{format(now, 'EEE, d MMM yyyy')}</span>
          </div>
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
            {format(now, 'hh:mm:ss a')}
          </span>
        </div>

        {/* Central Big-Digit Hero Countdown Display */}
        <div 
          className="w-full flex flex-col items-center justify-center my-3 py-6 px-4 rounded-3xl border transition-all"
          style={{
            backgroundColor: 'var(--bg-card-alt)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {/* Status Tag Pill */}
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.2em] mb-3 border transition-colors shadow-2xs"
            style={
              targetInfo.isPassed
                ? {
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }
                : targetInfo.diffMs <= 5 * 60 * 1000
                ? {
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                    borderColor: 'rgba(244, 63, 94, 0.3)',
                    color: '#f43f5e',
                  }
                : targetInfo.diffMs <= 15 * 60 * 1000
                ? {
                    backgroundColor: 'rgba(234, 179, 8, 0.12)',
                    borderColor: 'rgba(234, 179, 8, 0.3)',
                    color: '#ca8a04',
                  }
                : {
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-muted)',
                    color: 'var(--accent)',
                  }
            }
          >
            {label}
          </div>

          {/* Digits Display with Aligned Unit Labels and Safe Margins */}
          <div className="w-full max-w-sm flex items-center justify-center gap-1 sm:gap-2 select-none my-1">
            {timeSegments.map((segment, index) => {
              const isThreeSegments = timeSegments.length === 3;
              const unitKey = isThreeSegments
                ? (index === 0 ? 'hours' : index === 1 ? 'minutes' : 'seconds')
                : (index === 0 ? 'minutes' : 'seconds');

              const fallbackLabel = isThreeSegments
                ? (index === 0 ? 'Hours' : index === 1 ? 'Minutes' : 'Seconds')
                : (index === 0 ? 'Minutes' : 'Seconds');

              const unitLabel = t(`sun.${unitKey}`) || fallbackLabel;
              const digitColor = targetInfo.isPassed 
                ? 'var(--text-muted)' 
                : targetInfo.diffMs <= 5 * 60 * 1000 
                ? '#e11d48' 
                : targetInfo.diffMs <= 15 * 60 * 1000 
                ? '#d97706' 
                : 'var(--accent)';

              const digitTextSize = isThreeSegments
                ? "text-4xl sm:text-5xl md:text-6xl"
                : "text-5xl sm:text-6xl md:text-7xl";

              const colonTextSize = isThreeSegments
                ? "text-2xl sm:text-3xl md:text-4xl"
                : "text-3xl sm:text-4xl md:text-5xl";

              const colMinWidth = isThreeSegments
                ? "min-w-[56px] xs:min-w-[64px] sm:min-w-[76px] md:min-w-[84px]"
                : "min-w-[70px] sm:min-w-[85px] md:min-w-[100px]";

              return (
                <React.Fragment key={index}>
                  <div className={cn("flex flex-col items-center justify-center", colMinWidth)}>
                    <span 
                      className={cn(
                        "font-sans font-extrabold tracking-tight leading-none tabular-nums text-center",
                        digitTextSize
                      )}
                      style={{ color: digitColor }}
                    >
                      {segment}
                    </span>
                    <span className="mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center whitespace-nowrap">
                      {unitLabel}
                    </span>
                  </div>

                  {index < timeSegments.length - 1 && (
                    <div className="flex flex-col items-center justify-center px-0.5 sm:px-1 select-none">
                      <span 
                        className={cn(
                          "font-sans font-light opacity-40 leading-none text-center pb-0.5",
                          colonTextSize,
                          !targetInfo.isPassed && "animate-pulse"
                        )}
                        style={{ color: digitColor }}
                      >
                        :
                      </span>
                      <span className="mt-2 text-[10px] sm:text-[11px] opacity-0 select-none" aria-hidden="true">
                        &nbsp;
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Visual Progress Bar (Progress from modal open until Solar Noon) */}
          {!targetInfo.isPassed && (
            <div className="w-full max-w-[280px] sm:max-w-xs px-2 mt-5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] mb-1.5">
                <span>Progress to Noon</span>
                <span className="tabular-nums font-bold">{Math.round(sessionProgress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-muted)] overflow-hidden p-0.5 border border-[var(--border-subtle)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${sessionProgress}%`,
                    backgroundColor: targetInfo.diffMs <= 5 * 60 * 1000
                      ? '#e11d48'
                      : targetInfo.diffMs <= 15 * 60 * 1000
                      ? '#d97706'
                      : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Urgency Guidance Card */}
        <div 
          className={cn(
            "w-full px-4 py-3 rounded-2xl border text-center my-4 transition-all",
            urgencyStatus.badgeBg
          )}
        >
          <div className="text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
            <StatusIcon size={16} className={cn("shrink-0", urgencyStatus.level === 'critical' && "animate-pulse")} />
            <span>{urgencyStatus.title}</span>
          </div>
          <p className="text-[11px] opacity-85 mt-0.5 font-medium">
            {urgencyStatus.subtitle}
          </p>
        </div>

        {/* Safe Offset Buffer Selector (if configured in settings) */}
        {solarCalculations.safeOffset > 0 && (
          <div 
            className="w-full flex items-center justify-between p-3 rounded-2xl border mb-3 transition-colors"
            style={{
              backgroundColor: 'var(--bg-card-alt)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {t('sun.safeBuffer') || 'Safe Buffer'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {solarCalculations.safeOffset}m early buffer ({formatTargetTime(solarCalculations.safeNoon)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCountToSafe(!countToSafe)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer shrink-0 shadow-2xs",
                countToSafe
                  ? "bg-[var(--accent)] text-white border-transparent"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              )}
            >
              {countToSafe ? (t('sun.safeBuffer') || 'Safe Buffer') : (t('sun.exactSolarNoon') || 'Exact Noon')}
            </button>
          </div>
        )}

        {/* Footer Actions: Gentle Chime Alert & Screen Stay Awake Note */}
        <div className="w-full flex items-center justify-between pt-5 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Screen stays awake</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
              soundEnabled
                ? "bg-[var(--accent-subtle)] border-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-card)]"
            )}
            title={soundEnabled ? "Chime alerts active at 5m & 0m" : "Chime alerts muted"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? (t('sun.soundAlert') || 'Chime On') : 'Chime Off'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
