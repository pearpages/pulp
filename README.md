# pulp

A design system built to outlive its frameworks. Tokens are the product; CSS and React
components are renderers of them.

- **Tokens**: W3C Design Tokens (DTCG) JSON → CSS custom properties. Two brands (`pulp`,
  `bitepals`), light and dark through `light-dark()`, three tiers (primitive → semantic → component).
- **CSS**: cascade layers, reset, base styles. Framework-agnostic.
- **React**: accessible components on CSS modules and native CSS, one entry per component,
  state as `data-*` attributes.
- **Docs = tests**: every Storybook story runs in a browser with accessibility checks.
- **Guardrails**: inline styles and literal colours fail lint; stale token output fails CI; a
  generated component manifest tells coding agents what exists.

Docs: https://pulp.pearpages.com

| Package | |
| --- | --- |
| `@pearpages/pulp-tokens` | `tokens.css`, `tokens.json` |
| `@pearpages/pulp-css` | `index.css` (layers + tokens + reset + base) |
| `@pearpages/pulp-react` | `Text`, `Heading`, `Icon`, `VisuallyHidden`, `Stack`, `Inline`, `Field`, `Button`, `IconButton`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `Card`, `Tabs`, `Dialog`, `Spinner`, `Badge`, `Alert`, `Toast`, `Progress`, `Skeleton`, `Tooltip`, `Popover`, `Menu`, `Accordion` |
| `@pearpages/pulp-icons` | stroke icons as React components, tree-shakeable |

## Use

```css
@import "@pearpages/pulp-css";
@import "@pearpages/pulp-react/styles.css";
```

Load the brand typefaces yourself (pulp: Archivo, Instrument Sans, Geist Mono; bitepals:
Nunito, Inter), for example from `@fontsource-variable/*`. The tokens name the families
with system fallbacks but ship no font files. Shipped CSS uses native nesting and
`light-dark()`: Chrome/Edge 123, Firefox 120, Safari 17.5 or later.

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
pnpm build && pnpm test:dist && pnpm check:package
```

See `PRINCIPLES.md` for why the system is shaped this way, and `CLAUDE.md` for the rules CI
enforces and the current status.

## License

MIT
