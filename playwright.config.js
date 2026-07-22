// ============================================
// Playwright Configuration for Bracket Connector Tests
// ============================================
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './knockout',
  testMatch: '**/bracket-connector-tests.spec.js',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});