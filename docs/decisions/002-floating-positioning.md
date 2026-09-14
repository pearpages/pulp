# 002. Anchored overlays position with `@floating-ui/react-dom` behind one hook

Date: 2026-09-14 (tier 4). Status: accepted.

## Context

Tooltip, Popover and Menu need an element anchored to a trigger that flips when there is
no room and follows scroll. CSS anchor positioning does this natively but is above the
browser floor in `PRINCIPLES.md` §4 (Safari 26 is the first to ship it). The native
Popover API puts overlays in the top layer, which would stack them above dialogs opened
from them while `@pearpages/modals` still renders dialogs in the normal flow.

## Decision

`@floating-ui/react-dom` computes the position, and it is used in exactly one place:
`packages/react/src/internal/floating.ts`. The hook reads the gap from a `--_gap` custom
property on the floating element (a token, not a number in code) and delivers the result
as `--_x`/`--_y` custom properties consumed by `inset-*` in the stylesheet. The `style`
attribute carrying those two properties is the library's one sanctioned inline value and
carries a lint-disable comment saying so.

## Consequences

- One runtime dependency, kept external. Swapping to CSS anchor positioning is a change
  to one file and a stylesheet, with the same `data-placement` contract.
- Tier 5's React Aria based overlays use React Aria's positioning instead (record 001);
  two positioning engines coexist until the browser floor allows anchor positioning.

## Revisit when

Safari 26 is an acceptable floor, or `@pearpages/modals` moves to the top layer.
