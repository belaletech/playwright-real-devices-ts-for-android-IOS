/**
 * iOS REAL DEVICE TEST
 * Replicating Simon's exact test structure — same code as android.test.ts
 * On iOS this is expected to fail / return wrong value
 *
 * HOW TO RUN:  npm run test:ios
 */

import * as dotenv from 'dotenv';
import { webkit } from 'playwright';

dotenv.config();

// Same as Android test
const APP_BASE_URL = 'https://en.wikipedia.org/wiki/Main_Page';
const bookUrl = 'https://d7j8htvj40700.cloudfront.net/Technical-Writing-Essentials.epub';

const capabilities = {
  'LT:Options': {
    platformName:    'ios',
    deviceName:      'iPhone 16',
    platformVersion: '18',
    isRealMobile:    true,
    build:           'Simon exact test - Android vs iOS',
    name:            'iOS - Simon exact code',
    user:            process.env.LT_USERNAME,
    accessKey:       process.env.LT_ACCESS_KEY,
    network:         true,
    video:           true,
    console:         true,
  },
};

const WS_URL = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
  JSON.stringify(capabilities)
)}`;

async function runTest() {
  console.log('=== iOS Real Device Test ===');
  console.log('Device: iPhone 16, iOS 18\n');

  // iOS uses webkit.connect() — Android uses _android.connect()
  console.log('Connecting to LambdaTest...');
  const browser = await webkit.connect(WS_URL);
  console.log('Connected!\n');

  // hasTouch and isMobile required for iOS real device
  const context = await browser.newContext({ hasTouch: true, isMobile: true });
  const page = await context.newPage();

  try {

    // ── Simon's exact test steps — identical to Android ───────────────────

    // Navigate to the test UI app
    await page.goto(APP_BASE_URL);
    await page.waitForLoadState('load');
    console.log('Running sample test on page:', page.url());

    // Wait for 15 seconds to allow page load fully
    await page.waitForTimeout(15000);

    console.log('Before evaluating loadFromUrl');

    // Simon's exact page.evaluate code — same as Android
    const result = await page.evaluate(async (bookUrl) => {
      const windowAny = window as any;

      // Simulate window.app like Simon's real app
      windowAny.app = {
        loadFromUrl: async (url: string) => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('loadFromUrl called with:', url);
        },
        goToStart: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('goToStart called');
        }
      };

      const app = windowAny.app;

      try {
        await app.loadFromUrl(bookUrl);
        await app.goToStart();
      } catch (error) {
        console.error('Error during loadFromUrl or goToStart:', error);
        throw error;
      }

      return 'Evaluation successful';
    }, bookUrl);

    console.log('After evaluating loadFromUrl:', result);

    // Check result — Android gives "Evaluation successful", iOS gives "[object Object]"
    if (result === 'Evaluation successful') {
      console.log('✅ TEST PASSED - evaluate returned correct value\n');
    } else {
      console.log('❌ TEST FAILED - got wrong value: ' + result);
      console.log('   Android returns "Evaluation successful"');
      console.log('   iOS returns "' + result + '"');
      console.log('   Same code, different result = LambdaTest iOS bug\n');
    }

    console.log('=== iOS done ===');

  } finally {
    await page.close();
    await context.close();
    await browser.close();
    console.log('Closed.');
  }
}

runTest().catch(err => { console.error('Fatal:', err); process.exit(1); });
