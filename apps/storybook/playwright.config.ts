import { defineConfig, devices } from '@playwright/test';

// Visual regression of the *built* site. The baselines used to be shot by the Vitest run, through
// the dev transform, and were correct pictures of a page nobody is served: on 2026-09-18 the
// production build painted a primary Button as bare text with all 136 of them green.
//
// CI owns the baselines (text rasterises differently on macOS and Linux), so the suite only runs
// under PULP_VISUAL=1, which the workflows set. `visual-update.yml` re-renders them.
const PORT = 6107;

export default defineConfig({
  testDir: 'tests',
  // visual-baselines/<Component>/<brand>-<scheme>.png, the layout the repo already had.
  snapshotPathTemplate: 'visual-baselines/{arg}{ext}',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // A retry that passes is reported as flaky, not hidden.
  retries: 1,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${PORT}`, viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' },
  expect: {
    // 0.02, not pixelmatch's default: the default let a border go from #d5d7de to #c0c3cc unnoticed.
    toHaveScreenshot: { threshold: 0.02, maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  webServer: { command: `node scripts/serve-static.mjs ${PORT}`, url: `http://127.0.0.1:${PORT}/index.json`, reuseExistingServer: !process.env.CI },
});
