import { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';

// Load environment variables for build-time config (e.g. from .env file)
dotenv.config();

const config: CapacitorConfig = {
  "appId": "com.iitcalendar.applet",
  "appName": "IIT Calendar",
  "webDir": "dist",
  "plugins": {
    "CapacitorUpdater": {
      "autoUpdate": true,
      "updateUrl": (process.env.APP_URL || 'https://calendar.iit.lk').replace(/\/$/, '') + '/api/update',
      "statsUrl": ""
    }
  }
}
export default config;
