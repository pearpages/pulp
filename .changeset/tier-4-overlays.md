---
"@pearpages/pulp-react": minor
"@pearpages/pulp-tokens": minor
---

Tier 4 overlays and disclosure: `Tooltip`, `Popover`, `Menu` and `Accordion`.
Positioning is delegated to `@floating-ui/react-dom` (new runtime dependency,
kept external) through one internal hook, with the gap read from a token and
the position delivered as custom properties. New semantic tokens
`color.surface.inverse`, `color.text.on-inverse`, `layer.popover`,
`layer.tooltip`, `size.popover-width` and `size.menu-width`.
