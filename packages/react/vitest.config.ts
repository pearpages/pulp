import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/test/dist.smoke.test.tsx', '**/node_modules/**'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
