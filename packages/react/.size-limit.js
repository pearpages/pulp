/**
 * Bundle-size budget per entry, checked by `pnpm check:size` in CI. Entries
 * come from tsup's own list, so a new component is budgeted the day it is
 * scaffolded. Each entry is bundled and tree-shaken with esbuild the way a
 * consumer's bundler would, with the peer and vendor packages left out; the
 * three "with vendor" entries show the true cost of the headless layer.
 * Sizes are brotli. A limit is roughly 20% above the measured size, so a
 * component that starts pulling in a runtime fails here, not in a consumer.
 */
import tsupConfig from './tsup.config.ts';

const PEERS = ['react', 'react-dom', 'react/jsx-runtime'];
const VENDORS = ['@pearpages/modals', '@pearpages/heatmap', '@floating-ui/react-dom', 'react-aria-components', '@internationalized/date'];
// Measured 2026-09-15 (brotli): most entries 0.2–1.7 kB; toast 3.0, menu 2.3, pagination 2.1, alert 1.9;
// barrel 13.6; stylesheet 7.2; with React Aria: date-picker 65, combobox 54, data-grid 52.
// Barrel 16.68 on 2026-09-20 with the plain Table (its own entry is 594 B): budget 16.5 -> 17 kB.
// Heatmap 2026-09-23: its entry 235 B; with @pearpages/heatmap 0.4.1, 1.8 kB (budget 2.2 kB).
// Flat part names 2026-09-23 (MenuTrigger beside Menu.Trigger, 43 exports): barrel 16.89 -> 17.17: budget 17 -> 17.5 kB.
// Stylesheet 9.0 on 2026-09-20, with the eight accents on Avatar and Chip: its budget went from 9 to 10 kB.
const DEFAULT = '2.1 kB';
const LIMITS = { index: '17.5 kB', toast: '3.6 kB', menu: '2.8 kB', pagination: '2.5 kB', alert: '2.4 kB' };

const entries = Object.keys(tsupConfig.entry);

export default [
  ...entries.map((entry) => ({
    name: entry === 'index' ? 'everything (barrel)' : entry,
    path: `dist/${entry}.js`,
    import: '*',
    limit: LIMITS[entry] ?? DEFAULT,
    ignore: [...PEERS, ...VENDORS],
  })),
  { name: 'combobox with React Aria', path: 'dist/combobox.js', import: '*', limit: '65 kB', ignore: PEERS },
  { name: 'date-picker with React Aria', path: 'dist/date-picker.js', import: '*', limit: '78 kB', ignore: PEERS },
  { name: 'data-grid with React Aria', path: 'dist/data-grid.js', import: '*', limit: '63 kB', ignore: PEERS },
  { name: 'heatmap with @pearpages/heatmap', path: 'dist/heatmap.js', import: '*', limit: '2.2 kB', ignore: PEERS },
  { name: 'stylesheet (every component)', path: 'dist/index.css', limit: '10 kB' },
];
