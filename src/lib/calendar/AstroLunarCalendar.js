import { BuddhistCalendar, ANIMALS, SEASONS, WEEK_DAYS, TITHI_PALI } from "./BuddhistCalendar";
import SunCalc from "suncalc";

const ASTRO_MONTHS =[
  "Phussa", "Māgha", "Phagguṇa", "Citta", "Visākha", "Jeṭṭha", 
  "Āsāḷha", "Savaṇa", "Bhaddapāda", "Assayuja", "Kattika", "Māgasira"
];

export class AstroLunarCalendar extends BuddhistCalendar {
  constructor(config) {
    super(config);
  }

  getDateDetails(date) {
    // 1. Calculate Exact Astronomical Moon Phase for the given GPS Coordinates
    const moon = SunCalc.getMoonIllumination(date);
    
    // Moon phase in SunCalc is 0.0 (New) to 1.0. We scale it to 30 lunar days (tithis).
    const totalTithi = moon.phase * 30; 
    let paksha, tithiNum;

    if (totalTithi < 15) {
      paksha = "Sukka pakkhe"; // Waxing
      tithiNum = Math.floor(totalTithi) + 1;
    } else {
      paksha = "Kanha pakkhe"; // Waning
      tithiNum = Math.floor(totalTithi - 15) + 1;
    }

    const tithiWord = TITHI_PALI[Math.min(tithiNum, 15)] || TITHI_PALI[15];

    // 2. Map standard Gregorian details to approximate Pali constraints
    const weekDay = WEEK_DAYS[date.getDay()];
    const bY = date.getFullYear() + (date.getMonth() >= 4 ? 544 : 543);
    const animal = ANIMALS[bY % 12];
    
    const m = date.getMonth(); // 0 to 11
    let seasonKey = 1; // Hemanta (Winter: Dec, Jan, Feb)
    if (m >= 2 && m <= 4) seasonKey = 2; // Gimhāna (Summer: Mar, Apr, May)
    else if (m >= 5 && m <= 10) seasonKey = 3; // Vassāna (Rains: Jun - Nov)
    const season = SEASONS[seasonKey];
    
    const mName = ASTRO_MONTHS[m];
    
    // Consider day 14/15 or 8th as traditional astronomical Uposatha days
    const isUposathaDay = [8, 14, 15].includes(tithiNum);

    // 3. Pali Chant Generation
    const paliChant = `Ayaṃ\n${animal} saṃvacchare\n${season} utu asmiṃ utumhi\n${mName} māsassa\n${paksha}\n${tithiWord}\n${weekDay}\nidanti daṭṭhabbaṃ.`;

    return {
      animal,
      season,
      mName,
      tithiWord,
      weekDay,
      paksha,
      tithi: tithiNum,
      bY,
      paliChant,
      sun: this.getSunTimes(date),
      isUposatha: isUposathaDay,
      lunarSeason: seasonKey,
      moonPhase: tithiNum === 15 ? (paksha === "Sukka pakkhe" ? 'full' : 'new') : null
    };
  }

  getUposathasForYear(year) {
    const uposathas = [];
    let seasonCounts = { 1: 0, 2: 0, 3: 0 };
    let lastTithi = -1;
    let lastM = -1;
    
    // Scan the whole year
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const date = new Date(year, m, d);
        if (date.getMonth() !== m) break;
        
        const details = this.getDateDetails(date);
        const t = details.tithi;
        
        // Only count transition into the 14/15 window once per event
        if (details.isUposatha && (t === 14 || t === 15)) {
          if (lastTithi !== 14 && lastTithi !== 15) {
            const sKey = details.lunarSeason;
            seasonCounts[sKey]++;
            
            uposathas.push({
              date,
              phase: details.moonPhase || (details.paksha === 'Sukka pakkhe' ? 'full' : 'new'),
              mName: details.mName,
              lunarSeason: sKey,
              sNumber: seasonCounts[sKey],
              uDays: t === 14 ? 14 : 15,
              sTotal: 8
            });
          }
          lastTithi = t;
          lastM = m;
        } else {
          // Reset tracker when we are outside the 14/15 window
          lastTithi = t;
          lastM = m;
        }
      }
    }
    return uposathas;
  }
}
