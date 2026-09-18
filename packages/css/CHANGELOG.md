# @pearpages/pulp-css

## 0.1.1

### Patch Changes

- Updated dependencies [56c2390]
  - @pearpages/pulp-tokens@0.2.0

## 0.1.0

### Minor Changes

- 1fdb7e7: First release. Framework-agnostic base CSS with no build step.
  
  - `@import "@pearpages/pulp-css"` is the one import for an app: cascade layer order, tokens,
    reset and base styles.
  - `layers.css` declares `reset, tokens, vendor, base, components, utilities` once. `vendor` is for
    third-party stylesheets, so they sit below pulp's components; an unlayered rule in the app always
    wins.
  - `reset.css` and `base.css` are exported on their own for apps that assemble their own stack.
  - Native nesting and `light-dark()`: Chrome/Edge 123, Firefox 120, Safari 17.5 or later.

### Patch Changes

- Updated dependencies [1fdb7e7]
  - @pearpages/pulp-tokens@0.1.0
