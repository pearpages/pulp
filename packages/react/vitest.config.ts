import { defineConfig } from 'vitest/config';

import { resolve } from 'node:path';

export default defineConfig({
  resolve: { alias: { '@pearpages/pulp-icons': resolve(import.meta.dirname, '../icons/src/index.ts') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/test/dist.smoke.test.tsx', '**/node_modules/**'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
