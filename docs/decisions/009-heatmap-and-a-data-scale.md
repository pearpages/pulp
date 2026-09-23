# 009. `Heatmap` builds on `@pearpages/heatmap`, and pulp gains a sequential data scale

Date: 2026-09-23. Status: accepted.

## Context

A contribution calendar (one square per day, coloured by how much happened) was wanted in pulp.
`@pearpages/heatmap` already draws one: localised through `Intl`, correct in every time zone,
server-renderable, 3.3 kB. Writing a second one inside pulp would duplicate the hard parts (weeks
padded to whole weeks, month spans over them, local calendar days) for no gain.

`Dialog` set the pattern for a vendor pulp themes: import the vendor's stylesheet into
`layer(vendor)`, set the vendor's variables from pulp tokens in `@layer components`, and fail a
test when a mapped name is not declared by the installed vendor. Decision 003 set the rule for
when that is not enough: the vendor learns what pulp needs; pulp does not fight its CSS.

Three things stood in the way, and all three were fixed on the vendor side, not worked around:

- **The vendor's variables were not namespaced** (`--color-bg`, `--day-size`, `--border-radius`),
  several visual values were literals, and three typography variables were `--heatmap-*`, the
  name pulp's component tokens take. heatmap 0.4.0 moved everything to
  `--contribution-heatmap-*`, made padding, day radius, tooltip shadow and focus ring into
  variables, and kept the old names as aliases for one release. The old `--heatmap-*` names are
  only read as fallbacks there, never declared on the element, so they cannot shadow pulp's
  inherited tokens.
- **The corner of the header row was an empty `<th>`**, which pulp's axe gate reports. heatmap
  0.4.1 made it a `<td>`.
- **The vendor's root sets `color-scheme: light dark`** so it follows the OS. What that element
  paints itself follows it too, notably the grid's native horizontal scrollbar, so on a light pulp
  page under a dark OS the scrollbar would be dark. That one is pulp's to fix: `.root` sets
  `color-scheme: inherit`, and the components layer beats the vendor layer. pulp's `light-dark()`
  colour tokens were checked in Chromium with the vendor's declaration forced back on: they still
  followed `data-scheme`, so the fix is for the element's own painting, not for the tokens.

The semantic tier had nothing for the cells. Accents are categorical (eight unrelated hues), the
status colours carry meaning, `color-mix()` is banned, and a component token may not read a
primitive.

## Decision

- `Heatmap` (`@pearpages/pulp-react/heatmap`, category Data) renders the vendor's
  `ContributionHeatmap` with pulp's class merged into `className`. Its props are the vendor's. The
  entry re-exports the data helpers (`groupByWeeks`, `createDateString`, `parseDateString`, the
  period helpers) and their types, so a consumer imports one entry.
- `Heatmap.module.css` sets every `--contribution-heatmap-*` variable it themes from a
  `--heatmap-*` component token. `internal/vendors.test.ts` (generalised from Dialog's) checks
  the names against the installed vendor, keyed by prefix, one entry per vendor.
- A new semantic group, **`color.data.sequential.0…4`**, in both brands. `0` is "none", a step
  off the raised surface; `1…4` rise on the brand's own hue (ultramarine for pulp, orange for
  bitepals), and invert in dark so more is always brighter against the surface. It is public API
  (`scripts/public-tokens.mjs`), for any density scale, not only this component. It never carries
  text.

## Consequences

- Consumers import a second vendor stylesheet, `@pearpages/heatmap/styles.css`, into the vendor
  layer, as they do for modals. The manifest's `requires` says so.
- `Heatmap` takes no `ref` and no arbitrary HTML attributes, because the vendor accepts neither. If
  that is needed, the vendor learns it, as above.
- The day squares keep the vendor's sizes (`12px`, `20px` reversed). pulp has no dimension token
  that means "a data cell", and inventing one for a single component is not worth it yet.
- The ramps were chosen by eye against the matrix stories, not measured. Level 0 against the
  surface is deliberately faint, and colour alone carries the level, which the component's
  accessibility notes say. Revisit if a second data component needs the scale.
- The vendor's deprecated names disappear in heatmap 0.5.0. pulp maps only the new ones, so that
  release needs no change here, only the version range.
