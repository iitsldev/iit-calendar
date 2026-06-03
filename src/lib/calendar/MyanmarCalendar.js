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
    let seasonKey = 1; // Hemanta: Nadaw (9), Pyatho (10), Tabodwe (11), Tabaung (12)
    if ([1, 2, 3, 4, 0, 13, 14].includes(mIndex)) seasonKey = 2; // Gimhana: Tagu (1), Kason (2), Nayon (3), Waso (4)
    else if ([5, 6, 7, 8].includes(mIndex)) seasonKey = 3; // Vassana: Wagaung (5), Tawthalin (6), Thadingyut (7), Tazaungmon (8)
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

  getVesakDate(year) {
    const uposathas = this.getUposathasForYear(year);
    const vesak = uposathas.find(u => u.mm === 2 && u.phase === 'full');
    return vesak ? vesak.date : super.getVesakDate(year);
  }

  getUposathasForYear(year) {
    // Generate uposathas for current and surrounding years to ensure proper season counts
    const allUposathas = [];
    for (let y = year - 1; y <= year + 1; y++) {
      for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= 31; d++) {
          const jsDate = new Date(y, m, d);
          if (jsDate.getMonth() !== m) continue;
          const mmDate = new ceMmDateTime(ceMmDateTime.u2j(jsDate.getTime() / 1000.0));
          if (mmDate.mp === 1 || mmDate.mp === 3) {
            allUposathas.push({
              date: jsDate,
              phase: mmDate.mp === 1 ? "full" : "new",
              mDays: mmDate.mlen(),
              mName: mmDate.M(),
              mm: mmDate.mm,
              myt: mmDate.myt
            });
          }
        }
      }
    }

    // Sort by date
    allUposathas.sort((a, b) => a.date - b.date);

    // Track season and position
    let sNumber = 1;
    let sTotal = 8;
    let lunarSeason = 1;

    // Find a stable starting point: The first Nadaw (9) Full Moon
    // This is the start of Hemanta (Season 1)
    let startIndex = allUposathas.findIndex(u => u.mm === 9 && u.phase === 'full');
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < allUposathas.length; i++) {
      const u = allUposathas[i];
      
      // Determine season and sTotal
      if ([1, 2, 3, 4, 0, 13, 14].includes(u.mm)) {
        lunarSeason = 2; // Gimhana
        sTotal = u.myt > 0 ? 10 : 8;
      } else if ([5, 6, 7, 8].includes(u.mm)) {
        lunarSeason = 3; // Vassana
        sTotal = 8;
      } else {
        lunarSeason = 1; // Hemanta
        sTotal = 8;
      }

      u.lunarSeason = lunarSeason;
      u.sTotal = sTotal;
      u.sNumber = sNumber;
      u.uDays = u.phase === 'full' ? 15 : (u.mDays === 29 ? 14 : 15);

      // Label major events for Myanmar
      if (u.phase === 'full') {
        if (u.mm === 11) u.event = 'magha';
        else if (u.mm === 2) u.event = 'vesakha';
        else if (u.mm === 4) u.event = 'asalha';
        else if (u.mm === 7) u.event = 'pavarana';
      }

      // Increment sNumber for next uposatha
      if (sNumber < sTotal) {
        sNumber++;
      } else {
        sNumber = 1;
      }
    }

    // Also handle before startIndex by going backwards
    for (let i = startIndex - 1; i >= 0; i--) {
        const u = allUposathas[i];
        const nextU = allUposathas[i+1];
        
        if ([1, 2, 3, 4, 0, 13, 14].includes(u.mm)) {
            u.lunarSeason = 2;
            u.sTotal = u.myt > 0 ? 10 : 8;
        } else if ([5, 6, 7, 8].includes(u.mm)) {
            u.lunarSeason = 3;
            u.sTotal = 8;
        } else {
            u.lunarSeason = 1;
            u.sTotal = 8;
        }

        if (nextU.sNumber === 1) {
            u.sNumber = u.sTotal;
        } else {
            u.sNumber = nextU.sNumber - 1;
        }
        
        u.uDays = u.phase === 'full' ? 15 : (u.mDays === 29 ? 14 : 15);
        if (u.phase === 'full') {
            if (u.mm === 11) u.event = 'magha';
            else if (u.mm === 2) u.event = 'vesakha';
            else if (u.mm === 4) u.event = 'asalha';
            else if (u.mm === 7) u.event = 'pavarana';
        }
    }

    return allUposathas.filter(u => u.date.getFullYear() === year);
  }

  getEvents(year) {
    const events =[];
    // Include major religious events
    this.getUposathasForYear(year).filter(u => u.event).forEach(u => {
      events.push({
        date: u.date,
        event: {
          magha: "Magha Puja",
          vesakha: "Vesak Day",
          asalha: "Asalha Puja",
          pavarana: "Pavarana Day"
        }[u.event],
        country: "Myanmar"
      });
    });

    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const jsDate = new Date(year, m, d);
        if (jsDate.getMonth() !== m) continue;
        const mmDate = new ceMmDateTime(ceMmDateTime.u2j(jsDate.getTime() / 1000.0));
        const holidays = mmDate.holidays();
        if (holidays && holidays.length > 0) {
          holidays.forEach(h => {
            if (!events.find(e => e.date.getTime() === jsDate.getTime() && e.event === h)) {
              events.push({
                date: jsDate,
                event: h,
                country: "Myanmar"
              });
            }
          });
        }
      }
    }
    return events;
  }
}
