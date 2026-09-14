import { defineConfig } from 'vitest/config';

// Runs the smoke test against dist/, i.e. what an npm consumer receives.
// Build first. Kept separate so the normal test loop never depends on a build.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/dist.smoke.test.tsx'],
  },
});
