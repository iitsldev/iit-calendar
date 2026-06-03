import { ThaiCalendar } from "./ThaiCalendar";

export class SriLankanCalendar extends ThaiCalendar {
  constructor(config) {
    super(config);
  }

  getEvents(year) {
    return this.getUposathasForYear(year).filter(u => u.event).map(u => ({
      date: u.date,
      event: { 
        magha: "Navam Poya", 
        vesakha: "Vesak Poya", 
        asalha: "Esala Poya", 
        pavarana: "Vap Poya" 
      }[u.event],
      country: "Sri Lanka"
    }));
  }
}
