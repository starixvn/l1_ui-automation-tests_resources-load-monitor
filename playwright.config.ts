import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const testMatch = `${process.env.npm_config_gameid}-*`;

const config: PlaywrightTestConfig = {
  retries: 0,
  testDir: "./tests",
  timeout: 180 * 1000,
  expect: {
    timeout: 10 * 1000,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.1,
    },
    toHaveScreenshot: {
      maxDiffPixels: 500,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  reporter: [["dot"], ["html", { open: "never" }]],
  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
    headless: true,
    viewport: {
      width: 1280,
      height: 720,
    },
    screenshot: "only-on-failure",
    launchOptions: {
      args: ["--no-sandbox", "--use-angle=gl", "--enable-gpu"],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "Smoke_CI",
      testMatch: `**/${testMatch}/smoke-tests/*.smoke.spec.ts`,
      use: {
        ...devices["Desktop Chrome"],
      },
    },    
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',
};

export default config;
