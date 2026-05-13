import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';
import { SunTimesCalculator } from '../lib/calendar/SunTimesCalculator';
import { Settings } from '../types';

export enum NotificationId {
  MEDITATION = 1000,
  SOLAR_NOON_START = 2000, // 2000 to 2007 for 7 days
}

export interface ActiveMeditation {
  startTime: number;
  durationMs: number;
  notificationId: number;
}

class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermissions() {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } catch (e) {
      console.error("Notification permission error", e);
    }
  }

  public async refreshAll(settings: Settings) {
    await this.requestPermissions();
    
    // 1. Handle Solar Noon
    await this.scheduleSolarNoonBells(settings);
    
    // 2. Meditation session check (handled in specialized method)
    await this.recheckMeditationSession();
  }

  private async scheduleSolarNoonBells(settings: Settings) {
    // Cancel existing solar noon range
    const idsToCancel = Array.from({ length: 15 }).map((_, i) => NotificationId.SOLAR_NOON_START + i);
    await LocalNotifications.cancel({ notifications: idsToCancel.map(id => ({ id })) });

    if (!settings.solarNoonBell) return;

    const info = await Device.getInfo();
    const isIos = info.platform === 'ios';
    const MAX_NOTIFICATIONS = 64;
    
    const sunCalc = new SunTimesCalculator(settings.lat, settings.lng);
    const notifications = [];
    
    // Schedule for 14 days if not iOS, or 7 days if iOS (to be safe and leave room)
    const daysToSchedule = isIos ? 7 : 14;

    for (let i = 0; i < daysToSchedule; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const times = sunCalc.getStandardTimes(date);
      const noon = times.solarNoon;
      
      if (noon && noon > new Date()) {
        notifications.push({
          id: NotificationId.SOLAR_NOON_START + i,
          title: "Solar Noon",
          body: "The sun has reached its peak.",
          schedule: { at: noon },
          sound: 'bell.wav',
          smallIcon: 'ic_stat_name',
          channelId: 'solar_noon'
        });
      }
    }

    // On iOS, if we are near the limit, we might need to prioritize.
    // Given 7-14 notifications, we are very safe (8 << 64).
    
    if (notifications.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications });
      } catch (e) {
        console.error("Solar noon schedule error", e);
      }
    }
  }

  public async startMeditation(ms: number) {
    const id = NotificationId.MEDITATION;
    await LocalNotifications.cancel({ notifications: [{ id }] });

    const active: ActiveMeditation = {
      startTime: Date.now(),
      durationMs: ms,
      notificationId: id
    };
    localStorage.setItem('active_meditation', JSON.stringify(active));

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: "Meditation Complete",
          body: "Your session has ended. May you be peaceful.",
          schedule: { at: new Date(Date.now() + ms) },
          sound: 'bell.wav',
          channelId: 'meditation'
        }
      ]
    });
  }

  public async stopMeditation() {
    localStorage.removeItem('active_meditation');
    await LocalNotifications.cancel({ notifications: [{ id: NotificationId.MEDITATION }] });
  }

  public async recheckMeditationSession() {
    const saved = localStorage.getItem('active_meditation');
    if (!saved) return;

    const active: ActiveMeditation = JSON.parse(saved);
    const now = Date.now();
    const elapsed = now - active.startTime;
    
    if (elapsed >= active.durationMs) {
      // Session finished while app was dead
      this.logFinishedSession(active.durationMs);
      localStorage.removeItem('active_meditation');
    } else {
      // Session still ongoing, refresh notification just in case
      const remaining = active.durationMs - elapsed;
      await LocalNotifications.cancel({ notifications: [{ id: active.notificationId }] });
      await LocalNotifications.schedule({
        notifications: [
          {
            id: active.notificationId,
            title: "Meditation Complete",
            body: "Your session has ended. May you be peaceful.",
            schedule: { at: new Date(Date.now() + remaining) },
            sound: 'bell.wav',
            channelId: 'meditation'
          }
        ]
      });
    }
  }

  private logFinishedSession(durationMs: number) {
    const durationMin = Math.floor(durationMs / 60000);
    if (durationMin < 1) return;

    const savedStats = localStorage.getItem('zen_meditation_stats');
    const stats = savedStats ? JSON.parse(savedStats) : { sessions: [] };
    
    const newSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationMin: durationMin,
    };
    
    stats.sessions.push(newSession);
    localStorage.setItem('zen_meditation_stats', JSON.stringify(stats));
  }
}

export const notificationService = NotificationService.getInstance();
