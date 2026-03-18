/**
 * ANDROID REAL DEVICE TEST
 * Replicating Simon's exact test structure
 *
 * HOW TO RUN:  npm run test:android
 */

import * as dotenv from 'dotenv';
import { _android } from 'playwright';

dotenv.config();

// Simon's book URL from his test
const APP_BASE_URL = 'https://en.wikipedia.org/wiki/Main_Page';
const bookUrl = 'https://d7j8htvj40700.cloudfront.net/Technical-Writing-Essentials.epub';

const capabilities = {
  'LT:Options': {
    platformName:    'android',
    deviceName:      'Pixel 10',
    platformVersion: '16',
    isRealMobile:    true,
    build:           'Simon exact test - Android vs iOS',
    name:            'Android - Simon exact code',
    user:            process.env.LT_USERNAME,
    accessKey:       process.env.LT_ACCESS_KEY,
    network:         true,
    video:           true,
    console:         true,
    terminal:         true,
  },
};

const WS_URL = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
  JSON.stringify(capabilities)
)}`;

async function runTest() {
  console.log('=== Android Real Device Test ===');
  console.log('Device: Pixel 10, Android 16\n');

  console.log('Connecting to LambdaTest...');
  const device = await _android.connect(WS_URL);
  console.log('Connected! Device: ' + device.model() + '\n');

  await device.shell('am force-stop com.android.chrome');
  const context = await device.launchBrowser();
  const page = await context.newPage();

  try {

    // ── Simon's exact test steps ──────────────────────────────────────────

    // Navigate to the test UI app
    await page.goto(APP_BASE_URL);
    await page.waitForLoadState('load');
    console.log('Running sample test on page:', page.url());

    // Wait for 15 seconds to allow page load fully
    await page.waitForTimeout(15000);

    console.log('Before evaluating loadFromUrl');

    // Simon's exact page.evaluate code
    // We simulate window.app with setTimeout since we don't have his real app
    const result = await page.evaluate(async (bookUrl) => {
      const windowAny = window as any;

      // Simulate window.app like Simon's real app
      // In Simon's real app, window.app is set during window.onload
      windowAny.app = {
        loadFromUrl: async (url: string) => {
          // Simulate async book loading (2 seconds)
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('loadFromUrl called with:', url);
        },
        goToStart: async () => {
          // Simulate async navigation (1 second)
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

    // Check result is correct
    if (result === 'Evaluation successful') {
      console.log('✅ TEST PASSED - evaluate returned correct value\n');
    } else {
      console.log('❌ TEST FAILED - got wrong value: ' + result + '\n');
    }

    console.log('=== Android done - now run: npm run test:ios ===');

  } finally {
    await page.close();
    await context.close();
    await device.close();
    console.log('Closed.');
  }
}

runTest().catch(err => { console.error('Fatal:', err); process.exit(1); });