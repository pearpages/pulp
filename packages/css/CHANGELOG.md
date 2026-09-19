# @pearpages/pulp-css

## 0.1.4

### Patch Changes

- Updated dependencies [a67db76]
- Updated dependencies [b67331b]
- Updated dependencies [087fc7c]
- Updated dependencies [f339ace]
- Updated dependencies [9cb4d70]
- Updated dependencies [a33cd6d]
- Updated dependencies [7faf287]
- Updated dependencies [739b6a4]
- Updated dependencies [bb65f9b]
- Updated dependencies [d65c52a]
- Updated dependencies [c98e287]
- Updated dependencies [d746f6c]
  - @pearpages/pulp-tokens@0.3.0

## 0.1.3

### Patch Changes

- a6731f0: Every stylesheet now starts by restating the cascade-layer order (`@layer reset, tokens, vendor, base, components, utilities;`). Layers rank by first appearance, and a bundler decides which file loads first: when a component stylesheet was linked before the reset, `components` became the weakest layer and the reset won, so a primary Button painted as bare text. That is what the deployed Storybook was doing. Importing `@pearpages/pulp-css` first is still the recommended setup, but correct rendering no longer depends on it.
- Updated dependencies [a6731f0]
  - @pearpages/pulp-tokens@0.2.1

## 0.1.2

### Patch Changes

- 63b6449: The reset now declares `-webkit-text-size-adjust` and `-moz-text-size-adjust` next to `text-size-adjust: none`. iOS Safari and Firefox for Android only know the prefixed property, so text was still inflated in landscape there. Found by the new support-floor check.

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
