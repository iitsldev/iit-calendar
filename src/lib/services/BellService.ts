
import { format, differenceInSeconds, subMinutes } from 'date-fns';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface AlarmConfig {
  id: string;
  time: Date;
  label: string;
  enabled: boolean;
}

class BellService {
  private audioContext: AudioContext | null = null;
  private alarms: Map<string, AlarmConfig> = new Map();
  private timer: number | null = null;
  private lastFired: string = "";
  private persistenceKey = 'solar_noon_bell_enabled';

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy init AudioContext on first interaction
      window.addEventListener('click', () => this.initAudio(), { once: true });
      this.startCheckTimer();
      this.initLocalNotifications();
      
      // Restore state
      const saved = localStorage.getItem(this.persistenceKey);
      if (saved !== null) {
        this.alarms.set('solar_noon', {
          id: 'solar_noon',
          time: new Date(), // Placeholder, will be updated by component
          label: '5 mins before Solar Noon',
          enabled: saved === 'true'
        });
      }
    }
  }

  private async initLocalNotifications() {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } catch (e) {
      console.warn('LocalNotifications not available', e);
    }
  }

  private initAudio() {
    if (!this.audioContext) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public async playBell(vibrate = true) {
    this.initAudio();
    
    // 1. Audio
    if (this.audioContext) {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const fundamental = 523.25; // C5 - more "bell-like" than A4
      const partials = [1, 1.503, 1.997, 2.502, 3.011];
      
      partials.forEach((p, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(fundamental * p, now);
        gain.gain.setValueAtTime(0.15 / partials.length, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3 + i * 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 4);
      });
    }

    // 2. Haptics
    if (vibrate) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (e) {
        // Skip if not available
      }
    }

    // 3. Web Notification (Fallback)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !window.hasOwnProperty('Capacitor')) {
       new Notification('Bell', { body: 'Solar Noon Notification' });
    }
  }

  public async setSolarNoonBell(noon: Date, enabled: boolean) {
    localStorage.setItem(this.persistenceKey, String(enabled));
    const bellTime = subMinutes(noon, 5);
    const id = 1001; // Specific ID for solar noon
    
    this.alarms.set('solar_noon', {
      id: 'solar_noon',
      time: bellTime,
      label: '5 mins before Solar Noon',
      enabled
    });

    // Schedule native notification if enabled
    if (enabled && bellTime > new Date()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Solar Noon Approach",
              body: "5 minutes until Solar Noon",
              id: id,
              schedule: { 
                at: bellTime,
                allowWhileIdle: true // CRITICAL for Android background/doze mode
              },
              sound: 'bell.wav', // OS looks for this in res/raw or shared
              attachments: [],
              actionTypeId: "",
              extra: null
            }
          ]
        });
      } catch (e) {
        console.error('Failed to schedule native notification', e);
      }
    } else {
      try {
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch (e) {}
    }
  }

  public isSolarNoonBellEnabled(): boolean {
    return this.alarms.get('solar_noon')?.enabled || false;
  }

  private startCheckTimer() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      const now = new Date();
      this.alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        
        const diff = differenceInSeconds(now, alarm.time);
        const timeKey = format(alarm.time, 'yyyy-MM-dd HH:mm');
        
        // Match exact minute to avoid missing 1s window, but only fire once
        if (Math.abs(diff) < 2 && this.lastFired !== timeKey) {
          this.playBell();
          this.lastFired = timeKey;
        }
      });
    }, 1000);
  }

  public async requestPermission() {
    if (typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
    await this.initLocalNotifications();
  }
}

export const bellService = new BellService();
