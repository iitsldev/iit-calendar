import { ThaiCalendar } from "./ThaiCalendar";

export class TraditionalLunarCalendar extends ThaiCalendar {
  constructor(config) {
    super(config);
  }

  getEvents(year) {
    return this.getUposathasForYear(year).filter(u => u.event).map(u => ({
      date: u.date,
      event: { 
        magha: "Māgha Pūjā", 
        vesakha: "Vesākha Pūjā", 
        asalha: "Asāḷha Pūjā", 
        pavarana: "Pavāraṇā" 
      }[u.event],
      country: "International"
    }));
  }
}
