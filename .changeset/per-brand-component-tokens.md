---
'@pearpages/pulp-tokens': minor
---

A brand can now override a single component token, in `tokens/component/<brand>/<component>.json`. The component tier is still declared once, on `:root`, and still reads only the semantic layer — this is for the case the semantic layer cannot express, where a component's value is itself brand. bitepals' buttons are pills, and no semantic name tells a button's radius from an input's, so `--button-radius` is `var(--radius-full)` under `[data-brand="bitepals"]` and bitepals drops the unlayered override it had been keeping. An override must reference the semantic layer and must name a token that already exists; both are tested, on every brand. Decision record 007.
