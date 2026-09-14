import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const here = dirname(fileURLToPath(import.meta.url));

// Every story is a test: it renders in a real browser, its play function runs,
// and the a11y addon fails it on violations. The addon applies the preview
// annotations (decorators, globals, a11y config) itself since Storybook 10.3.
export default defineConfig({
  plugins: [storybookTest({ configDir: resolve(here, '.storybook') })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
