# @pearpages/pulp-tokens

## 0.2.0

### Minor Changes

- 56c2390: Add `Sheet`: a dialog docked to an edge (`placement`: `start | end | top | bottom`, default
  `end`), with Dialog's parts, focus trap, stacking and dismissal. It needs `DialogSystem` and the
  `@pearpages/modals` stylesheet, as Dialog does. `@pearpages/modals` moves to `^0.3.0`, which added
  the docking. New semantic tokens `size.sheet-width` (24rem) and `size.sheet-height` (60vh), and
  `--sheet-width`, `--sheet-height` and `--sheet-motion-translate` component tokens.

## 0.1.0

### Minor Changes

- 1fdb7e7: First release. W3C DTCG design tokens in three tiers (primitive → semantic → component), built to
  `tokens.css` (custom properties) and `tokens.json`.
  
  - Two brands on `data-brand`: `pulp` and `bitepals`. A brand sets the palette, radius, type
    families and density (`--space-unit`).
  - Light and dark on `data-scheme`, or following the OS when it is unset, as `light-dark()` pairs.
    Brands and schemes nest on any element.
  - Component tokens for every `@pearpages/pulp-react` component reference the semantic tier only,
    so a brand is a token swap. The token tests check that every brand defines every semantic token,
    that colours carry dark counterparts, and WCAG AA contrast for the pairs components produce.
