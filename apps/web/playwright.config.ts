import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "always",
  },
  outputDir: "./test-results",
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"], 
        launchOptions: { 
          args: ["--disable-web-security", "--enable-features=VideoCapture"] 
        } 
      },
    },
  ],
  webServer: [
    {
      command: "cd ../../apps/api && npm run dev",
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "npm run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
