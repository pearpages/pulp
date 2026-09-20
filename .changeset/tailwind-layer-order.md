---
'@pearpages/pulp-tokens': patch
---

The tokens README says how to sit next to Tailwind v4: 48 of the primitive names pulp emits are also Tailwind's defaults, layers rank by first appearance, and if Tailwind's `theme` layer lands after pulp's then `--radius-surface` resolves to Tailwind's `--radius-lg` and every surface loses its corners with nothing failing. Declare `@layer reset, theme, tokens, …` yourself. Decision record 006 has the reasoning; the tier is prefixed at 1.0.
