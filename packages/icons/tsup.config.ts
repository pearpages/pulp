import { defineConfig } from 'tsup';

// One barrel. `sideEffects: false` plus one function per icon means a consumer's
// bundler tree-shakes down to the icons it imports; per-icon entry points would
// only add tarball weight.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react/jsx-runtime'],
});
