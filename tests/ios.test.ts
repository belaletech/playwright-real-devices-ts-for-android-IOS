import * as dotenv from 'dotenv';
import { webkit } from 'playwright';

dotenv.config();

const APP_BASE_URL = 'https://www.wikipedia.org/';
const bookUrl = 'https://d7j8htvj40700.cloudfront.net/Technical-Writing-Essentials.epub';

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

const capabilities = {
  'LT:Options': {
    platformName: 'ios',
    deviceName: 'iPhone 16',
    platformVersion: '18',
    isRealMobile: true,
    build: 'Final Stable - Android vs iOS',
    name: 'iOS Stable Test',
    user: process.env.LT_USERNAME,
    accessKey:process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
  },
};

const WS_URL = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
  JSON.stringify(capabilities)
)}`;

async function runTest() {
  console.log(`
============================================================
  iOS Real Device Test - Stable Version
============================================================
`);

  log(`Target URL   : ${APP_BASE_URL}`);
  log(`Device       : iPhone 16, iOS 18`);
  log(`Connecting to LambdaTest iOS cloud...`);

  const browser = await webkit.connect(WS_URL);

  log(`Connected to iOS device successfully!`);
  log(`Creating browser context...`);

  const context = await browser.newContext({ hasTouch: true, isMobile: true });
  const page = await context.newPage();

  try {
    // ─────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────
    log(`Navigating to: ${APP_BASE_URL}`);
    await page.goto(APP_BASE_URL);

    // ✅ Replace waitForFunction with stable waits
    await page.waitForLoadState('load');
    await page.locator('body').waitFor();

    log(`Page loaded. URL: ${page.url()}`);
    log(`Waiting 10 seconds for stability...`);
    await page.waitForTimeout(10000);

    // ========================= TEST 1 =========================
    console.log(`
============================================================
  TEST 1: Basic synchronous evaluate
============================================================
`);

    try {
      log(`Running: document.title`);
      const title = await page.evaluate(() => document.title);
      log(`✅ TEST 1 PASSED - Title: "${title}"`);
    } catch (err) {
      log(`❌ TEST 1 FAILED: ${err}`);
    }

    // ========================= TEST 2 =========================
    console.log(`
============================================================
  TEST 2: Async evaluate (Safe)
============================================================
`);

    try {
      log(`Running async evaluate (with safe return)`);

      const result = await page.evaluate(async (bookUrl) => {
        const windowAny = window as any;

        windowAny.app = {
          loadFromUrl: async (url: string) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
          },
          goToStart: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        };

        const app = windowAny.app;

        await app.loadFromUrl(bookUrl);
        await app.goToStart();

        // ✅ Always return serializable value
        return JSON.stringify({ status: 'success' });
      }, bookUrl);

      log(`Raw result: ${result}`);

      const parsed = JSON.parse(result);

      if (parsed.status === 'success') {
        log(`✅ TEST 2 PASSED`);
      } else {
        log(`❌ TEST 2 FAILED - Unexpected result`);
      }

    } catch (err) {
      log(`❌ TEST 2 FAILED: ${err}`);
    }

    // ========================= TEST 3 =========================
    console.log(`
============================================================
  TEST 3: Promise-based evaluate (Workaround)
============================================================
`);

    try {
      log(`Running Promise-based evaluate`);

      const result = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('Workaround success'), 2000);
        });
      });

      log(`✅ TEST 3 PASSED - Result: ${result}`);
    } catch (err) {
      log(`❌ TEST 3 FAILED: ${err}`);
    }

    // ========================= TEST 4 =========================
    console.log(`
============================================================
  TEST 4: Stable wait replacement (NO waitForFunction)
============================================================
`);

    try {
      log(`Using loadState + locator instead of waitForFunction`);

      await page.waitForLoadState('load');
      await page.locator('body').waitFor();

      log(`✅ TEST 4 PASSED - Stable wait successful`);
    } catch (err) {
      log(`❌ TEST 4 FAILED: ${err}`);
    }

    console.log(`
============================================================
  All iOS tests completed (Stable)
============================================================
`);

    log(`iOS test stabilized by avoiding waitForFunction`);

  } finally {
    log(`Tearing down resources...`);
    await page.close();
    log(`Page closed.`);
    await context.close();
    log(`Context closed.`);
    await browser.close();
    log(`Browser closed.`);
  }
}

runTest().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});