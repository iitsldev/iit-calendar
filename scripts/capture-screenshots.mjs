import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../website/public/screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const screens = [
  { name: 'calendar', tab: 'calendar' },
  { name: 'meditation', tab: 'meditation' },
  { name: 'chants', tab: 'chants' },
  { name: 'books', tab: 'book' },
  { name: 'study', tab: 'study' },
];

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
    if (isRunning) return `http://localhost:${port}`;
  }
  return 'http://localhost:3000';
}

async function capture() {
  const baseUrl = await findRunningUrl();
  console.log(`Using base URL: ${baseUrl}`);
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: {
      width: 393,
      height: 852,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(baseUrl, ['geolocation']);

  const page = await browser.newPage();

  // Set standard iPhone geolocation (Colombo, Sri Lanka - IIT home base)
  await page.setGeolocation({ latitude: 6.9271, longitude: 79.8612 });

  // Set mock localStorage to avoid unneeded prompts/onboarding
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

  for (const screen of screens) {
    const url = `${baseUrl}/?tab=${screen.tab}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for animations and content to settle
    await new Promise((r) => setTimeout(r, 2000));

    // Wait for fonts to be ready
    await page.evaluateHandle('document.fonts.ready');

    const destPath = path.join(outputDir, `${screen.name}.png`);
    await page.screenshot({
      path: destPath,
      type: 'png',
    });
    console.log(`Saved screenshot: ${destPath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
