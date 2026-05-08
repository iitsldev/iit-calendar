import SunCalc from "suncalc";

export class SunTimesCalculator {
  constructor(lat = 6.9271, lng = 79.8612) {
    this.lat = lat;
    this.lng = lng;
  }

  getStandardTimes(date) {
    const times = SunCalc.getTimes(date, this.lat, this.lng);

    return {
      nightEnd: times.nightEnd,           // Astro dawn starts
      nauticalDawn: times.nauticalDawn,   // Nautical dawn starts
      dawn: times.dawn,                   // Civil dawn starts
      sunrise: times.sunrise,
      solarNoon: times.solarNoon,
      sunset: times.sunset,
      dusk: times.dusk,                   // Civil dusk starts
      nauticalDusk: times.nauticalDusk,   // Nautical dusk starts
      night: times.night,                 // Astro dusk starts
      nadir: times.nadir
    };
  }

  getDawn(date, method = 'astrology') {
    SunCalc.addTime(-9.0, 'dawn9', 'dusk9');
    const times = SunCalc.getTimes(date, this.lat, this.lng);
    const sunrise = times.sunrise;
    const sunriseTimeMs = sunrise ? sunrise.getTime() : date.setHours(6, 0, 0, 0);

    switch (method.toLowerCase()) {
      case 'pa-auk':
      case 'paauk':
        return new Date(sunriseTimeMs - 40 * 60000);
      case 'na-uyana':
      case 'nauyana':
        return new Date(sunriseTimeMs - 30 * 60000);
      case 'astrology':
      case '9deg':
      default:
        // @ts-ignore
        return times.dawn9 || times.dawn; 
    }
  }
}
