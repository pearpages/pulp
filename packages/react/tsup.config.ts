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
    'empty-state': 'src/empty-state/index.ts',
    'segmented-control': 'src/segmented-control/index.ts',
    'chip': 'src/chip/index.ts',
    'avatar': 'src/avatar/index.ts',
    'link': 'src/link/index.ts',
    'divider': 'src/divider/index.ts',
    'sheet': 'src/sheet/index.ts',
    'pagination': 'src/pagination/index.ts',
    'table': 'src/table/index.ts',
    'slider': 'src/slider/index.ts',
    'date-picker': 'src/date-picker/index.ts',
    'calendar': 'src/calendar/index.ts',
    'picker': 'src/picker/index.ts',
    'listbox': 'src/listbox/index.ts',
    'combobox': 'src/combobox/index.ts',
    'menu': 'src/menu/index.ts',
    'accordion': 'src/accordion/index.ts',
    'popover': 'src/popover/index.ts',
    'tooltip': 'src/tooltip/index.ts',
    'skeleton': 'src/skeleton/index.ts',
    'progress': 'src/progress/index.ts',
    'toast': 'src/toast/index.ts',
    'alert': 'src/alert/index.ts',
    'badge': 'src/badge/index.ts',
    'spinner': 'src/spinner/index.ts',
    'select': 'src/select/index.ts',
    'textarea': 'src/textarea/index.ts',
    'radio': 'src/radio/index.ts',
    'switch': 'src/switch/index.ts',
    'checkbox': 'src/checkbox/index.ts',
    'icon-button': 'src/icon-button/index.ts',
    field: 'src/field/index.ts',
    inline: 'src/inline/index.ts',
    stack: 'src/stack/index.ts',
    'visually-hidden': 'src/visually-hidden/index.ts',
    icon: 'src/icon/index.ts',
    heading: 'src/heading/index.ts',
    text: 'src/text/index.ts',
    dialog: 'src/dialog/index.ts',
    tabs: 'src/tabs/index.ts',
    card: 'src/card/index.ts',
    'text-field': 'src/text-field/index.ts',
    button: 'src/button/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@pearpages/modals', '@pearpages/pulp-icons', '@floating-ui/react-dom', 'react-aria-components', '@internationalized/date'],
  loader: { '.css': 'local-css' },
});
