import SunCalc from "suncalc";
import * as MeeusSunMoon from "meeussunmoon";
import { DateTime } from "luxon";

export class SunTimesCalculator {
  constructor(lat = 6.9271, lng = 79.8612) {
    this.lat = lat;
    this.lng = lng;
  }

  getStandardTimes(date) {
    const dt = DateTime.fromJSDate(date);
    const scTimes = SunCalc.getTimes(date, this.lat, this.lng);

    const safeToDate = (luxonDt, fallback) => 
      (luxonDt && typeof luxonDt.toJSDate === 'function') ? luxonDt.toJSDate() : fallback;

    return {
      nightEnd: safeToDate(MeeusSunMoon.astronomicalDawn(dt, this.lat, this.lng), scTimes.nightEnd),
      nauticalDawn: safeToDate(MeeusSunMoon.nauticalDawn(dt, this.lat, this.lng), scTimes.nauticalDawn),
      dawn: safeToDate(MeeusSunMoon.civilDawn(dt, this.lat, this.lng), scTimes.dawn),
      sunrise: safeToDate(MeeusSunMoon.sunrise(dt, this.lat, this.lng), scTimes.sunrise),
      solarNoon: safeToDate(MeeusSunMoon.solarNoon(dt, this.lng), scTimes.solarNoon),
      sunset: safeToDate(MeeusSunMoon.sunset(dt, this.lat, this.lng), scTimes.sunset),
      dusk: safeToDate(MeeusSunMoon.civilDusk(dt, this.lat, this.lng), scTimes.dusk),
      nauticalDusk: safeToDate(MeeusSunMoon.nauticalDusk(dt, this.lat, this.lng), scTimes.nauticalDusk),
      night: safeToDate(MeeusSunMoon.astronomicalDusk(dt, this.lat, this.lng), scTimes.night),
      nadir: scTimes.nadir
    };
  }

  getDawn(date, settings) {
    const method = settings?.dawnMethod || 'astrology';
    const dt = DateTime.fromJSDate(date);
    const sunriseDt = MeeusSunMoon.sunrise(dt, this.lat, this.lng);
    const sunriseTimeMs = (sunriseDt && typeof sunriseDt.toJSDate === 'function') 
      ? sunriseDt.toJSDate().getTime() 
      : SunCalc.getTimes(date, this.lat, this.lng).sunrise.getTime();

    switch (method.toLowerCase()) {
      case 'offset': {
        const dur = settings?.dawnDurationOffset ?? 30;
        return new Date(sunriseTimeMs - dur * 60000);
      }
      case 'astrology':
      case '9deg':
      default: {
        const dawnAngle = settings?.dawnAngle ?? 9.0;
        SunCalc.addTime(-dawnAngle, 'dawnCustom', 'duskCustom');
        const times = SunCalc.getTimes(date, this.lat, this.lng);
        // @ts-ignore
        return times.dawnCustom || times.dawn; 
      }
    }
  }
}
