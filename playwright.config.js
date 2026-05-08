// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/UITest.spec.js', '**/UIAutomation.spec.js', '**/rahulshetty/**'],
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://127.0.0.1:5173',
  },
  webServer: {
    command: 'npx http-server app -p 5173 -s -c-1',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
