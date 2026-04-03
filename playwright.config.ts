import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs-extra';

// Clean old report before run
fs.emptyDirSync('AllTestResults');

export default defineConfig({
  testDir: './tests',
  
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
 
  retries: process.env.CI ? 1 : 0,
  
   workers: process.env.WORKERS
    ? Number(process.env.WORKERS)
    : (process.env.CI ? 1 : undefined),


  /* Reporter to use.: Extend Reporter */
  reporter: [
    ['html', { outputFolder: 'AllTestResults/html-report', open: 'never' }]
  ],
  
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    headless: true,
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'off',
    screenshot: 'off',

    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  timeout: 60000,
    expect: {
    timeout: 5000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

  ],

});
