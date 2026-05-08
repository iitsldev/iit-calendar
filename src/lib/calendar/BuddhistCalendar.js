import SunCalc from "suncalc";

export const ANIMALS =[
  "Sappa", "Assa", "Aja", "Kapi", "Kukkuṭa", "Sona", 
  "Sūkara", "Musika", "Usabha", "Vyaggha", "Sasa", "Nāga"
];
export const SEASONS = { 1: "Hemanta", 2: "Gimhāna", 3: "Vassāna" };
export const WEEK_DAYS =[
  "Ravivāraṃ", "Candavāraṃ", "Bhummavāraṃ", "Budhavāraṃ", 
  "Guruvāraṃ", "Sukkavāraṃ", "Soravāraṃ"
];
export const TITHI_PALI =[
  "", "Paṭhamaṃ", "Dutiyaṃ", "Tatiyaṃ", "Catutthaṃ", "Pañcamaṃ", 
  "Chaṭṭhamaṃ", "Sattamaṃ", "Aṭṭhamaṃ", "Navamaṃ", "Dasamaṃ", 
  "Ekādasamaṃ", "Dvādasamaṃ", "Terasamaṃ", "Cuddasamaṃ", "Paṇṇarasamaṃ"
];

export class BuddhistCalendar {
  constructor(config = {}) {
    if (new.target === BuddhistCalendar) throw new TypeError("Abstract class cannot be instanciated directly.");
    this.lat = config.lat || 6.9271;
    this.lng = config.lng || 79.8612;
    this.dawnOffset = config.dawnOffset || 30; 
  }

  getSunTimes(date) {
    const times = SunCalc.getTimes(date, this.lat, this.lng);
    const sunrise = times.sunrise;
    const noon = times.solarNoon;
    const dawn = new Date(sunrise.getTime() - this.dawnOffset * 60000);
    return { dawn, sunrise, noon };
  }

  // Abstract methods
  getUposathasForYear(year) { throw new Error("Not implemented"); }
  getDateDetails(date) { throw new Error("Not implemented"); }
  getEvents(year) { throw new Error("Not implemented"); }
}
