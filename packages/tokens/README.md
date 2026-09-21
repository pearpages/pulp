# @pearpages/pulp-tokens

The design tokens of [pulp](https://pulp.pearpages.com): W3C Design Tokens (DTCG) JSON in,
CSS custom properties and a resolved JSON manifest out. Two brands, light and dark via
`light-dark()`.

## Install

```sh
npm install @pearpages/pulp-tokens
```

Most apps get the tokens through [`@pearpages/pulp-css`](https://www.npmjs.com/package/@pearpages/pulp-css),
which imports them in the right cascade layer. Import them directly only if you don't use it:

```css
@import "@pearpages/pulp-tokens/tokens.css";
```

## Use

Read the semantic names, never the primitives underneath them:

```css
.panel {
  background: var(--color-surface-raised);
  color: var(--color-text-default);
  padding: var(--space-4);
  border-radius: var(--radius-surface);
}
```

Theme with two attributes on `<html>` or on any element (they nest):

- `data-brand="pulp" | "bitepals"` sets the palette, radius, type families and density.
  `pulp` is the default on `:root`.
- `data-scheme="light" | "dark"`, or leave it off to follow the OS. Colours are
  `light-dark()` pairs.

```html
<html data-brand="bitepals" data-scheme="dark">
```

## Tiers

Primitives (raw palette and scales) → semantic tokens (what a value means: surface, text,
action) → component tokens (one component's knobs, always pointing at semantic ones). A brand
only remaps primitives onto semantic names, so switching brand never touches a component.

Where a component value is itself brand — bitepals' buttons are pills, and no semantic name tells a
button's radius from an input's — a brand may restate that one token in
`tokens/component/<brand>/<component>.json`. It still has to reference the semantic layer, and it
still has to be a name the component already reads. Decision record 007.

## Files

| Export | |
| --- | --- |
| `@pearpages/pulp-tokens/tokens.css` | every brand's custom properties, in `@layer tokens` |
| `@pearpages/pulp-tokens/tokens.json` | resolved tokens per brand, `{ pulp: [...], bitepals: [...] }`; each entry has `name`, `path`, `type`, `tier`, `css`, `value`. For tooling |
| `@pearpages/pulp-tokens/theme.css` | Tailwind v4: an `@theme inline reference` block over the semantic colours, radii, shadows and font families, so `bg-surface-base` or `rounded-control` read pulp's variables. Import it after `tailwindcss` and `tokens.css` |
| `@pearpages/pulp-tokens/native` | React Native / NativeWind and Tailwind v3: per brand `{ colors, radius, space, themeVars: { light, dark } }`. Names are `var(--…)` references for the config; `themeVars` are resolved hex and px for `vars()`. ESM and `require` |
| `tokens/` | the DTCG source files |

### Tailwind v4: declare the layer order

48 of the primitive names pulp emits are also Tailwind's defaults (`--radius-sm`, `--radius-lg`,
`--font-weight-medium`, `--font-weight-semibold`, `--color-{neutral,red,green,blue,orange,teal,violet,pink}-N`).
Layers rank by first appearance, so whoever the bundler loads first wins, and if Tailwind's `theme`
layer lands after pulp's, `--radius-surface: var(--radius-lg)` resolves to Tailwind's `0.5rem` and
every surface loses its corners — with nothing failing anywhere. Declare the order yourself, before
either import:

```css
@layer reset, theme, tokens, vendor, base, components, utilities;
```

pulp's primitives then win, and a component always resolves to a value pulp chose. Invert the first
two if you would rather keep Tailwind's palette; what you must not do is leave the order unsaid.
Decision record 006 has the reasoning and the plan to prefix the tier at 1.0.

## License

MIT
