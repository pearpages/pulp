# @pearpages/pulp-css

The base styles of [pulp](https://pulp.pearpages.com): cascade layers, a reset, and body defaults
on top of the tokens. Framework-agnostic, no build step. Import it once per app.

## Install

```sh
npm install @pearpages/pulp-css
```

## Use

```css
@import "@pearpages/pulp-css";
```

That one import sets the layer order, loads
[`@pearpages/pulp-tokens`](https://www.npmjs.com/package/@pearpages/pulp-tokens), then the reset
and the base styles. Choose a brand and scheme with `data-brand` and `data-scheme` on `<html>`
(see the tokens package).

## Cascade layers

```css
@layer reset, tokens, vendor, base, components, utilities;
```

- `vendor` is for third-party stylesheets, so they sit below pulp's components:
  `@import "some-library/styles.css" layer(vendor);`
- Rules you write outside any layer always win over all of these. That is the intended way
  to override pulp.

Apps that assemble their own stack can import the pieces separately:
`@pearpages/pulp-css/layers.css`, `/reset.css` and `/base.css`.

## Fonts

The tokens name the brand typefaces with system fallbacks, but no font files are shipped. Load
them yourself, for example from `@fontsource-variable/*`:

- pulp: Archivo, Instrument Sans, Geist Mono
- bitepals: Nunito, Inter

## Browser support

Native CSS nesting and `light-dark()`: Chrome/Edge 123, Firefox 120, Safari 17.5 or later.

## License

MIT
