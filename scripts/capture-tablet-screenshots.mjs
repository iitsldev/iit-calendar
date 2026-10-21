import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const web7Dir = path.resolve(rootDir, 'website/public/screenshots/tablet-7-inch');
const web10Dir = path.resolve(rootDir, 'website/public/screenshots/tablet-10-inch');

[web7Dir, web10Dir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Detect running dev server
async function findRunningUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  const candidatePorts = [3001, 3000, 5173];

  for (const port of candidatePorts) {
    const isRunning = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/`, (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 304);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
    });

    if (isRunning) {
      console.log(`Detected running app on http://localhost:${port}`);
      return `http://localhost:${port}`;
    }
  }

  throw new Error('No local dev server found on ports 3001, 3000, or 5173. Please ensure dev server is running.');
}

const targets = [
  {
    name: '01_calendar',
    tab: 'calendar',
    action: async (page) => {
      // Top header view
      await page.evaluate(() => {
        const el = document.getElementById('tab-calendar');
        if (el) el.scrollTop = 0;
      });
    },
  },
  {
    name: '02_solar_events',
    tab: 'calendar',
    action: async (page) => {
      // Scrolled to show Solar Events, Dawn/Noon, and Upcoming Uposatha
      await page.evaluate(() => {
        const el = document.getElementById('tab-calendar');
        if (el) el.scrollTop = 520;
      });
    },
  },
  {
    name: '03_meditation',
    tab: 'meditation',
  },
  {
    name: '04_chants',
    tab: 'chants',
  },
  {
    name: '05_books',
    tab: 'book',
  },
  {
    name: '06_study',
    tab: 'study',
  },
];

async function captureScreenshots() {
  const baseUrl = await findRunningUrl();

  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(baseUrl, ['geolocation']);

  const page = await browser.newPage();

  // Set standard geolocation (Colombo, Sri Lanka - IIT home base)
  await page.setGeolocation({ latitude: 6.9271, longitude: 79.8612 });

  // Default localStorage to provide clean, consistent presentation
  await page.evaluateOnNewDocument(() => {
    try {
      const defaultSettings = {
        calendarType: 'srilanka',
        lat: 6.9271,
        lng: 79.8612,
        dawnMethod: 'astrology',
        language: 'en',
        paliScript: 'roman',
        themeColor: 'saffron',
        darkMode: false,
        fontSize: 16,
        solarNoonBell: false,
        dawnBell: false,
        isIITStudent: true,
        updateChannel: 'stable',
      };
      localStorage.setItem('iit_settings', JSON.stringify(defaultSettings));
    } catch (e) {}
  });

  const tabletConfigs = [
    {
      label: '7-inch Tablet (1200x1920)',
      viewport: { width: 600, height: 960, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      dirs: [web7Dir],
    },
    {
      label: '10-inch Tablet (1600x2560)',
      viewport: { width: 800, height: 1280, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      dirs: [web10Dir],
    },
  ];

  for (const config of tabletConfigs) {
    console.log(`\n========================================`);
    console.log(`Capturing: ${config.label}`);
    console.log(`========================================`);

    await page.setViewport(config.viewport);

    for (const target of targets) {
      const url = `${baseUrl}/?tab=${target.tab}`;
      console.log(`Navigating to ${url} (${target.name})...`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      await new Promise((r) => setTimeout(r, 1500));
      await page.evaluateHandle('document.fonts.ready');

      if (target.action) {
        await target.action(page);
        await new Promise((r) => setTimeout(r, 600));
      }

      for (const targetDir of config.dirs) {
        const destPath = path.join(targetDir, `${target.name}.png`);
        await page.screenshot({
          path: destPath,
          type: 'png',
          omitBackground: false,
        });
        console.log(`  -> Saved: ${destPath}`);
      }
    }
  }

  await browser.close();
  console.log('\nAll tablet screenshots captured successfully for Google Play Store!');
}

captureScreenshots().catch((err) => {
  console.error('Error during tablet capture:', err);
  process.exit(1);
});
