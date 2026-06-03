import SunCalc from "suncalc";

export const ANIMALS =[
  "Sappa", "Assa", "Aja", "Kapi", "Kukkuṭa", "Sona", 
  "Sūkara", "Musika", "Vasabha", "Vyaggha", "Sasa", "Nāga"
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
    if (new.target === BuddhistCalendar) throw new TypeError("Abstract class cannot be instantiated directly.");
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

  /**
   * Returns the date of the Vesak full moon for a given CE year.
   * Prefers the uposatha explicitly marked event="vesakha" (correct in both
   * normal and adhikamasa/leap years). Falls back to the first full moon on
   * or after April 15 for calendar systems that don't set event names.
   * @param {number} year – CE year
   * @returns {Date}
   */
  getVesakDate(year) {
    const uposathas = this.getUposathasForYear(year);
    // Primary: use the explicitly labelled Vesak event (works correctly in
    // leap years where an extra month precedes Vesākha)
    const vesakEvent = uposathas.find(u => u.event === "vesakha" && (u.phase ?? u.type) === "full");
    if (vesakEvent) return vesakEvent.date;
    // Fallback: first full moon on or after April 15
    const threshold = new Date(year, 3, 15).getTime();
    const vesak = uposathas.find(u => (u.phase ?? u.type) === "full" && u.date.getTime() >= threshold);
    if (!vesak) throw new Error(`Vesak not found for year ${year}`);
    return vesak.date;
  }

  /**
   * Returns Atikkanta (elapsed) and Avasiṭṭha (remaining) counts
   * for the Buddhist Era year, month, and day relative to the given date.
   *
   * Matches the logic in index.html calculateAll():
   * - atikkantaY = bYear − 1
   * - atikkantaM = bM − 1   (lunar months elapsed since last Vesak full moon)
   * - atikkantaD = tithi − 1 (days elapsed since last full-moon uposatha)
   * - avasitthaY = 5000 − bYear
   * - avasitthaM = totM − bM (months remaining to next Vesak)
   * - avasitthaD = days from today to next full-moon uposatha (0 on full-moon day)
   *
   * Requires subclass to implement getUposathasForYear(year) returning an array of
   * { date: Date, phase: "full"|"new" } objects (type: "full"|"new" also accepted), and optionally getVesakDate(year).
   *
   * @param {Date} date – the civil date to query (time component ignored)
   * @returns {{
   *   bYear: number, bM: number, totM: number, tithi: number,
   *   atikkantaY: number, atikkantaM: number, atikkantaD: number,
   *   avasitthaY: number, avasitthaM: number, avasitthaD: number
   * }}
   */
  getAtikkantaAvasittha(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const time = d.getTime();
    const y = d.getFullYear();

    // Buddhist Era year (Elapsed): before Vesak → y+543, on/after Vesak → y+544
    // Note: The user wants bYear to represent the "Atikkanta" (fully passed) years.
    const _vRaw = this.getVesakDate(y);
    const vesakThisYear = new Date(_vRaw.getFullYear(), _vRaw.getMonth(), _vRaw.getDate());
    const bYear = (time < vesakThisYear.getTime()) ? (y + 543) : (y + 544);

    // Vesak dates bracketing the current BE year
    const lastCEYear = (time < vesakThisYear.getTime()) ? y - 1 : y;
    const lastVD = this.getVesakDate(lastCEYear).getTime();
    const nextVD = this.getVesakDate(lastCEYear + 1).getTime();

    // Total lunar months in current BE year (12 or 13)
    const SYNODIC = 2551442400; // ms ≈ 29.53 days
    const totM = Math.round((nextVD - lastVD) / SYNODIC);

    // Gather all uposathas for the surrounding years to find past/future events
    const uposathasLastYear = this.getUposathasForYear(lastCEYear);
    const uposathasThisYear = this.getUposathasForYear(lastCEYear + 1);
    const allUposathas = [...uposathasLastYear, ...uposathasThisYear]
      .map(u => ({ ...u, time: u.date.getTime() }))
      .sort((a, b) => a.time - b.time);

    const fullMoons = allUposathas.filter(u => (u.phase ?? u.type) === "full");

    // lastFullMoon: the most recent full moon on or before today
    const pastFullMoons = fullMoons.filter(u => u.time <= time);
    const lastFullMoon = pastFullMoons.length > 0 ? pastFullMoons[pastFullMoons.length - 1] : null;

    // tithi (BE Day): days since the last full moon (1-based: 1 on full-moon day itself)
    const tithi = lastFullMoon
      ? Math.round((time - lastFullMoon.time) / 86400000) + 1
      : 1;

    // bM (BE Month): count of full moons since the last Vesak (inclusive of Vesak itself)
    // 1-based: on the month starting with Vesak, bM is 1.
    const fullMoonsInYear = fullMoons.filter(u => u.time >= lastVD && u.time <= time);
    const bM = Math.max(1, fullMoonsInYear.length);

    // avasitthaD: days from today to next full-moon uposatha (0 on that day)
    const nextFullMoon = fullMoons.find(u => u.time > time);
    let avasitthaD = 0;
    if (nextFullMoon) {
      const nfd = new Date(nextFullMoon.date);
      nfd.setHours(0, 0, 0, 0);
      avasitthaD = Math.round((nfd.getTime() - time) / 86400000);
    }

    return {
      bYear: bYear - 1, // Change to fully elapsed years
      bM: bM % 13,
      totM,
      tithi: tithi - 1,
      atikkantaY: bYear - 1,
      atikkantaM: bM % 13, // Months passed before the current month
      atikkantaD: tithi-2, // Days passed before today
      avasitthaY: 5000 - bYear,
      avasitthaM: Math.max(0, totM - bM ),
      avasitthaD: avasitthaD,
    };

  }
}