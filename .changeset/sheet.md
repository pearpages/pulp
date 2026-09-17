---
"@pearpages/pulp-react": minor
"@pearpages/pulp-tokens": minor
---

Add `Sheet`: a dialog docked to an edge (`placement`: `start | end | top | bottom`, default
`end`), with Dialog's parts, focus trap, stacking and dismissal. It needs `DialogSystem` and the
`@pearpages/modals` stylesheet, as Dialog does. `@pearpages/modals` moves to `^0.3.0`, which added
the docking. New semantic tokens `size.sheet-width` (24rem) and `size.sheet-height` (60vh), and
`--sheet-width`, `--sheet-height` and `--sheet-motion-translate` component tokens.
