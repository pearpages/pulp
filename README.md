# pulp

A design system built to outlive its frameworks. By [Pere Pages](https://pearpages.com)
([@pearpages](https://github.com/pearpages)). Tokens are the product; CSS and React
components are renderers of them.

- **Tokens**: W3C Design Tokens (DTCG) JSON → CSS custom properties. Two brands (`pulp`,
  `bitepals`), light and dark through `light-dark()`, three tiers (primitive → semantic → component).
- **CSS**: cascade layers, reset, base styles. Framework-agnostic.
- **React**: accessible components on CSS modules and native CSS, one entry per component,
  state as `data-*` attributes.
- **Docs = tests**: every Storybook story runs in a browser with accessibility checks. Each
  component's docs page (usage, accessibility, do/don't, status) is rendered from its JSDoc
  through the component manifest, so humans and coding agents read one source.
- **Guardrails**: inline styles and literal colours fail lint; stale token output fails CI; every
  entry has a bundle-size budget; a vendor renaming a variable fails a test; a generated
  component manifest tells coding agents what exists.

Docs: https://pulp.pearpages.com

Reference consumer: [perepages.com](https://perepages.com) takes its colour from
`@pearpages/pulp-tokens` (semantic names only, both schemes) and its theme toggle from
`@pearpages/pulp-react`, while keeping its own reset, type scale and print edition.

| Package | |
| --- | --- |
| `@pearpages/pulp-tokens` | `tokens.css`, `tokens.json` |
| `@pearpages/pulp-css` | `index.css` (layers + tokens + reset + base) |
| `@pearpages/pulp-react` | `Text`, `Heading`, `Icon`, `VisuallyHidden`, `Stack`, `Inline`, `Field`, `Button`, `IconButton`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `Card`, `Tabs`, `Dialog`, `Sheet`, `Spinner`, `Badge`, `Alert`, `Toast`, `Progress`, `Skeleton`, `Tooltip`, `Popover`, `Menu`, `Accordion`, `Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`, `Table`, `DataGrid`, `Pagination`, `Heatmap` |
| `@pearpages/pulp-icons` | stroke icons as React components, tree-shakeable |

## Use

```css
@import "@pearpages/pulp-css";
@import "@pearpages/pulp-react/styles.css";
```

With pnpm 11, a release less than 24 hours old will not install: `minimumReleaseAge` defaults to
1440 minutes, as a guard against a hijacked package reaching you at once. To take a release on the day
it ships, exempt the scope in `pnpm-workspace.yaml`:

```yaml
minimumReleaseAgeExclude:
  - '@pearpages/*'
```

npm and yarn have no such delay.

Load the brand typefaces yourself (pulp: Archivo, Instrument Sans, Geist Mono; bitepals:
Nunito, Inter), for example from `@fontsource-variable/*`. The tokens name the families
with system fallbacks but ship no font files. Shipped CSS uses native nesting and
`light-dark()`: Chrome/Edge 123, Firefox 120, Safari 17.5 or later.

The complex widgets (Combobox, Listbox, Picker, Calendar, DatePicker, Slider, DataGrid) build
on React Aria Components, installed with the package and tree-shaken per entry. Their
props are pulp's; dates cross the API as `YYYY-MM-DD` strings.

`Dialog`, `DialogSystem` and `Sheet` build on [`@pearpages/modals`](https://www.npmjs.com/package/@pearpages/modals)
(focus trap, inert page, stacking, Escape and backdrop dismissal), also installed with the
package. pulp themes it by mapping its tokens onto the vendor's `--modal-*` variables, so dialogs
follow brand and scheme. `Heatmap` does the same over
[`@pearpages/heatmap`](https://www.npmjs.com/package/@pearpages/heatmap), mapping onto its
`--contribution-heatmap-*` variables, with the cells on the brand's sequential data scale
(`--color-data-sequential-*`). These are the two vendors whose stylesheets you import yourself,
into the `vendor` layer so pulp's styles win:

```css
@import "@pearpages/modals/styles.css" layer(vendor);
@import "@pearpages/heatmap/styles.css" layer(vendor);
```

Skip the first if you never render a `Dialog` or `Sheet`, and the second if you never render a
`Heatmap`.

```tsx
import { Button } from '@pearpages/pulp-react/button';

<html data-brand="bitepals" data-scheme="dark">
  <Button variant="secondary" size="lg">Save</Button>
</html>
```

## Develop

```
pnpm install
pnpm storybook          # docs and stories on :6006
pnpm test               # unit tests
pnpm test:storybook     # stories as browser tests (once: pnpm --filter storybook exec playwright install chromium)
pnpm build && pnpm test:dist && pnpm check:package && pnpm check:size && pnpm check:floor
pnpm verify             # everything CI runs, in the same order; run it before pushing to main
```

See `PRINCIPLES.md` for why the system is shaped this way, `docs/decisions/` for the
decisions that applied them (the headless layer, positioning, the vendor dialog), and
`CLAUDE.md` for the rules CI enforces and the current status.

## License

MIT
