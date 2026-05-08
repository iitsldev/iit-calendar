import { BuddhistCalendar } from "./BuddhistCalendar";
import { getUposathasForYear, MONTH_NAMES } from "./uposathalib";

const ANIMALS =["Sappa", "Assa", "Aja", "Kapi", "Kukkuṭa", "Sona", "Sūkara", "Musika", "Usabha", "Vyaggha", "Sasa", "Nāga"];
const SEASONS = { 1: "Hemanta", 2: "Gimhāna", 3: "Vassāna" };
const WEEK_DAYS =["Ravivāraṃ", "Candavāraṃ", "Bhummavāraṃ", "Budhavāraṃ", "Guruvāraṃ", "Sukkavāraṃ", "Soravāraṃ"];
const TITHI_PALI =["", "Paṭhamaṃ", "Dutiyaṃ", "Tatiyaṃ", "Catutthaṃ", "Pañcamaṃ", "Chaṭṭhamaṃ", "Sattamaṃ", "Aṭṭhamaṃ", "Navamaṃ", "Dasamaṃ", "Ekādasamaṃ", "Dvādasamaṃ", "Terasamaṃ", "Cuddasamaṃ", "Paṇṇarasamaṃ"];

export class ThaiCalendar extends BuddhistCalendar {
  constructor(config) {
    super(config);
  }

  getUposathasForYear(year) {
    return getUposathasForYear(year);
  }

  getDateDetails(date) {
    const time = date.getTime();
    const y = date.getFullYear();
    const allUpos = [...this.getUposathasForYear(y - 1), ...this.getUposathasForYear(y), ...this.getUposathasForYear(y + 1)];

    const futureUpos = allUpos.filter((u) => u.date.getTime() >= time);
    const pastUpos = allUpos.filter((u) => u.date.getTime() < time);
    const lastUpo = pastUpos[pastUpos.length - 1];
    const nextUpo = futureUpos[0];

    const todayNormalized = new Date(y, date.getMonth(), date.getDate()).getTime();
    const isUposathaDay = nextUpo && new Date(nextUpo.date.getFullYear(), nextUpo.date.getMonth(), nextUpo.date.getDate()).getTime() === todayNormalized;

    const daysSinceLast = Math.round((todayNormalized - lastUpo.date.getTime()) / 86400000);
    const tithi = isUposathaDay ? nextUpo.uDays : daysSinceLast + 1;
    
    let paksha = lastUpo.phase === "new" ? "Sukka pakkhe" : "Kanha pakkhe";
    if (isUposathaDay) paksha = nextUpo.phase === "full" ? "Sukka pakkhe" : "Kanha pakkhe";

    const animal = ANIMALS[(y + 544) % 12];
    const season = SEASONS[nextUpo ? nextUpo.lunarSeason : 1];
    const mName = nextUpo ? MONTH_NAMES[nextUpo.lunarMonth] : "Vesākha";
    const tithiWord = TITHI_PALI[Math.min(tithi, 15)] || TITHI_PALI[15];
    const weekDay = WEEK_DAYS[date.getDay()];

    return {
      animal, season, mName, tithiWord, weekDay, paksha, tithi,
      paliChant: `Ayaṃ\n${animal} saṃvacchare\n${season} utu asmiṃ utumhi\n${mName} māsassa\n${paksha}\n${tithiWord}\n${weekDay}\nidanti daṭṭhabbaṃ.`,
      sun: this.getSunTimes(date),
      isUposatha: isUposathaDay,
      moonPhase: isUposathaDay ? nextUpo.phase : null,
      nextUpo
    };
  }

  getEvents(year) {
    return this.getUposathasForYear(year).filter(u => u.event).map(u => ({
      date: u.date,
      event: { magha: "Makha Bucha", vesakha: "Visakha Bucha", asalha: "Asahna Bucha", pavarana: "Pavarana" }[u.event],
      country: "Thailand"
    }));
  }
}
