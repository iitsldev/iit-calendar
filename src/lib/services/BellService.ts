
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
  private alarms: Map<string, AlarmConfig> = new Map();
  private timer: number | null = null;
  private lastFired: string = "";
  private persistenceKey = 'solar_noon_bell_enabled';

  constructor() {
    if (typeof window !== 'undefined') {
      this.startCheckTimer();
      this.initLocalNotifications();
      
      // Restore state
      try {
        const savedSettings = localStorage.getItem('iit_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          this.alarms.set('solar_noon', {
            id: 'solar_noon',
            time: new Date(),
            label: '5 mins before Solar Noon',
            enabled: !!settings.solarNoonBell
          });
          this.alarms.set('dawn', {
            id: 'dawn',
            time: new Date(),
            label: 'Dawn',
            enabled: !!settings.dawnBell
          });
        } else {
          const savedNoon = localStorage.getItem(this.persistenceKey);
          const savedDawn = localStorage.getItem('dawn_bell_enabled');
          this.alarms.set('solar_noon', {
            id: 'solar_noon',
            time: new Date(),
            label: '5 mins before Solar Noon',
            enabled: savedNoon === 'true'
          });
          this.alarms.set('dawn', {
            id: 'dawn',
            time: new Date(),
            label: 'Dawn',
            enabled: savedDawn === 'true'
          });
        }
      } catch (e) {
        console.error('Failed to load settings in BellService', e);
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

  private speak(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  public async playBell(type: 'solar_noon' | 'dawn' | 'test' = 'test', vibrate = true) {
    let sentence = "Notification test.";
    if (type === 'solar_noon') {
      sentence = "Solar noon is in five minutes.";
    } else if (type === 'dawn') {
      sentence = "Dawn has arrived.";
    }

    this.speak(sentence);

    // Haptics
    if (vibrate) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (e) {
        // Skip if not available
      }
    }

    // Web Notification (Fallback)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !window.hasOwnProperty('Capacitor')) {
       new Notification('Notification', { body: sentence });
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
              body: "Solar noon is in five minutes.",
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

  public async setDawnBell(dawn: Date, enabled: boolean) {
    localStorage.setItem('dawn_bell_enabled', String(enabled));
    const id = 1002; // Specific ID for dawn
    
    this.alarms.set('dawn', {
      id: 'dawn',
      time: dawn,
      label: 'Dawn',
      enabled
    });

    // Schedule native notification if enabled
    if (enabled && dawn > new Date()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Dawn",
              body: "Dawn has arrived.",
              id: id,
              schedule: { 
                at: dawn,
                allowWhileIdle: true
              },
              sound: 'bell.wav',
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

  public isDawnBellEnabled(): boolean {
    return this.alarms.get('dawn')?.enabled || false;
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
          this.playBell(alarm.id as 'solar_noon' | 'dawn' | 'test');
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
