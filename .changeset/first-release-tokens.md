---
"@pearpages/pulp-tokens": minor
---

First release. W3C DTCG design tokens in three tiers (primitive → semantic → component), built to
`tokens.css` (custom properties) and `tokens.json`.

- Two brands on `data-brand`: `pulp` and `bitepals`. A brand sets the palette, radius, type
  families and density (`--space-unit`).
- Light and dark on `data-scheme`, or following the OS when it is unset, as `light-dark()` pairs.
  Brands and schemes nest on any element.
- Component tokens for every `@pearpages/pulp-react` component reference the semantic tier only,
  so a brand is a token swap. The token tests check that every brand defines every semantic token,
  that colours carry dark counterparts, and WCAG AA contrast for the pairs components produce.
