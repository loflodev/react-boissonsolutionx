import { defineConfig, devices } from "@playwright/test";

// Not Vite's default 4173: another local project may already be serving there
const PORT = 4391;

// End-to-end tests run against the production build (`npm run build` first),
// so they see exactly what crawlers and visitors get: the prerendered HTML.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Scroll reveals fade content in; axe would measure half-faded text
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Always start our own server, so the tests never run against another site
    reuseExistingServer: false,
  },
});
