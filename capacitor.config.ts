import { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';

// Load environment variables for build-time config (e.g. from .env file)
dotenv.config();

const config: CapacitorConfig = {
  "appId": "com.iitcalendar.applet",
  "appName": "Sati",
  "webDir": "dist",
  "plugins": {
    "CapacitorUpdater": {
      "autoUpdate": "onLaunch",
      "updateUrl": (process.env.APP_URL || 'https://sati.theravado.com').replace(/\/$/, '') + '/api/update',
      "statsUrl": ""
    }
  }
}
export default config;
