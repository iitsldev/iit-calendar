const SunCalc = require("suncalc");
const lat = 6.9271;
const lng = 79.8612;
const d = new Date();
d.setHours(5, 15, 0, 0); // 5:15 AM
const pos = SunCalc.getPosition(d, lat, lng);
console.log("altitude (rad):", pos.altitude);
console.log("angle (deg):", pos.altitude * 180 / Math.PI);
