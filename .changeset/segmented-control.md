---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

SegmentedControl (experimental): one choice out of a few, all visible. Generic over a string union (`options`, `value` / `defaultValue`, `onValueChange`), `look` (`segmented`, `chips`), `size`, `fullWidth`, `name`. Native radio inputs underneath, so the keyboard, the single tab stop and form submission are the browser's. `SegmentedControl.Nav` and `SegmentedControl.NavItem` give the same look to links that navigate: a labelled `nav` with `aria-current="page"`, and `asChild` for a router's link. Tokens: `--segmented-control-*`.
