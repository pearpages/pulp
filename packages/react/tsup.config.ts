import { defineConfig } from 'tsup';

// One entry per component plus the barrel. esbuild emits a CSS file per entry,
// so `@pearpages/pulp-react/button` + `button.css` is a self-contained import
// and `styles.css` is everything. Class names hash by file path, so the two
// outputs agree.
//
// `loader['.css'] = 'local-css'` is what makes CSS modules work: tsup's own
// CSS handling defaults to the plain `css` loader, which turns a module import
// into `{}`. Every stylesheet in this package is a module, so scoping all of
// them is correct. The dist smoke test guards this.
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    button: 'src/button/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  loader: { '.css': 'local-css' },
});
