import { BuddhistCalendar, ANIMALS, SEASONS, WEEK_DAYS, TITHI_PALI } from "./BuddhistCalendar";
import { ceMmDateTime } from "./ceMmDateTime"; 

export class MyanmarCalendar extends BuddhistCalendar {
  constructor(config) {
    super(config);
  }

  getDateDetails(date) {
    const mmDate = new ceMmDateTime(ceMmDateTime.u2j(date.getTime() / 1000.0));
    
    // 1. Tithi / Lunar Day Mapping
    const fd = mmDate.fd(); // Fortnight day (1 to 15)
    const tithiWord = TITHI_PALI[Math.min(fd, 15)] || TITHI_PALI[15];

    // 2. Weekday
    const weekDay = WEEK_DAYS[date.getDay()];

    // 3. Animal Mapping (Aligned with Pali cycle using JS Date equivalent)
    const bY = date.getFullYear() + (date.getMonth() >= 4 ? 544 : 543);
    const animal = ANIMALS[bY % 12];

    // 4. Season Mapping based on Myanmar Months
    const mIndex = mmDate.mm; 
    let seasonKey = 1;
    if ([1, 2, 3, 12, 13, 14].includes(mIndex)) seasonKey = 2; // Gimhana
    else if (mIndex >= 4 && mIndex <= 7) seasonKey = 3; // Vassana
    const season = SEASONS[seasonKey];

    // 5. Month Name
    const mName = mmDate.M(); 

    // 6. Moon Phase & Paksha
    const mp = mmDate.mp; // 0=wax, 1=full, 2=wan, 3=new
    const paksha = mp <= 1 ? "Sukka pakkhe" : "Kanha pakkhe";
    const isUposathaDay = mp === 1 || mp === 3;

    // 7. Pali Chant Generation
    const paliChant = `Ayaṃ\n${animal} saṃvacchare\n${season} utu asmiṃ utumhi\n${mName} māsassa\n${paksha}\n${tithiWord}\n${weekDay}\nidanti daṭṭhabbaṃ.`;

    return {
      animal,
      season,
      mName,
      tithiWord,
      weekDay,
      paksha,
      tithi: fd,
      bY: mmDate.my,
      paliChant,
      sun: this.getSunTimes(date),
      isUposatha: isUposathaDay,
      moonPhase: mp === 1 ? 'full' : mp === 3 ? 'new' : null
    };
  }

  getUposathasForYear(year) {
    const uposathas =[];
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const jsDate = new Date(year, m, d);
        if (jsDate.getMonth() !== m) continue;
        const mmDate = new ceMmDateTime(ceMmDateTime.u2j(jsDate.getTime() / 1000.0));
        if (mmDate.mp === 1 || mmDate.mp === 3) {
           uposathas.push({
             date: jsDate,
             phase: mmDate.mp === 1 ? "full" : "new",
             mDays: mmDate.mlen(),
             mName: mmDate.M()
           });
        }
      }
    }
    return uposathas;
  }

  getEvents(year) {
    const events =[];
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const jsDate = new Date(year, m, d);
        if (jsDate.getMonth() !== m) continue;
        const mmDate = new ceMmDateTime(ceMmDateTime.u2j(jsDate.getTime() / 1000.0));
        const holidays = mmDate.holidays();
        if (holidays && holidays.length > 0) {
          events.push({
            date: jsDate,
            event: holidays.join(", "),
            country: "Myanmar"
          });
        }
      }
    }
    return events;
  }
}
