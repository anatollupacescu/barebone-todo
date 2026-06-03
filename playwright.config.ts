import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',          // put tests next to this config, or adjust to e.g. './tests'
  timeout: 15_000,        // per-test timeout
  retries: 0,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * Start both the Vite dev server and json-server before running tests.
   * Adjust the `command` fields to match how you actually start these processes
   * (e.g. `npm run dev` for the frontend, `npx json-server ...` for the backend).
   */
  webServer: [
    {
      command: 'npx json-server --watch data.json --port 3000',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
