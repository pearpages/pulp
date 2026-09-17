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
    // One retry, because these run in a real browser: an event can land in a frame that
    // re-renders and be lost. Anything that fails twice in a row is a real failure, and the
    // flake belongs in the story, not here — this only keeps a deploy from dying on one.
    retry: 1,
    // Visual regression of the matrix stories, live only under VITE_VISUAL (see the file).
    setupFiles: [resolve(here, '.storybook/vitest.visual.setup.ts')],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      expect: {
        toMatchScreenshot: {
          // The default per-pixel tolerance (0.1) forgives about 20 levels of luminance: a border
          // going from #d5d7de to #c0c3cc passed unnoticed, and token-level drift of that size
          // is exactly what this is for. Baseline and check render on the same CI image, so
          // there is no cross-machine noise to absorb.
          comparatorName: 'pixelmatch',
          comparatorOptions: { threshold: 0.02 },
          // One committed folder, `visual-baselines/<Component>/<brand>-<scheme>.png`, instead of
          // `__screenshots__` next to every component. No platform suffix: only CI writes these.
          resolveScreenshotPath: ({ arg, ext, testFileName }) =>
            resolve(here, 'visual-baselines', testFileName.replace(/\.stories\.tsx$/, ''), `${arg}${ext}`),
          // Failures: `<name>-reference|-actual|-diff.png`, gitignored, uploaded by CI. The default
          // joins `../../packages/react/src/…` onto the attachments directory and escapes it.
          resolveDiffPath: ({ arg, ext, testFileName }) =>
            resolve(here, '.vitest-attachments/visual', testFileName.replace(/\.stories\.tsx$/, ''), `${arg}${ext}`),
        },
      },
    },
  },
});
