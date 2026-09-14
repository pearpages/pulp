# 001. Complex widgets build on React Aria Components

Date: 2026-09-14. Status: accepted. Applies principle 6 ("complex widgets build on a
headless accessibility layer rather than hand-rolled keyboard handling").

## Context

Tier 5 adds the widgets whose keyboard and screen-reader model is large and easy to get
subtly wrong: Combobox, Listbox, a rich Select, Calendar and DatePicker, Slider, Table.
Each has an ARIA Authoring Practices pattern with dozens of rules (typeahead buffers,
`aria-activedescendant` versus roving focus, grid navigation, locale-aware date segments,
drag with keyboard fallbacks). Re-deriving those is where design systems accumulate the
bugs that screen-reader users find first.

Candidates: React Aria Components (Adobe), Radix Primitives, Ark UI (Zag), Base UI.

## Decision

`react-aria-components` is the headless layer for tier 5. pulp owns the public API, the
tokens, the CSS and the DOM contract; React Aria owns behaviour, ARIA wiring, focus
management and internationalisation. `@internationalized/date` (its date library) is a
direct dependency because pulp converts dates at the boundary (see below).

Why React Aria over the others: it is the only candidate that ships Combobox, Select,
Listbox, Calendar, DatePicker, Slider and Table under one interaction model with
internationalisation built in (Radix has no combobox, date or table; Base UI is not
complete; Ark is close but its date and table coverage is thinner). It has the longest
screen-reader test record of the four and is used by Adobe's own system in production.

## How the boundary is kept

- **pulp names, not vendor names.** The public props are pulp's: `value`/`onChange`,
  `disabled`, `error`, `label`. Vendor spellings (`isDisabled`, `selectedKey`,
  `onSelectionChange`) never reach a consumer. Swapping the layer is an internal change.
- **Dates are ISO strings on the API.** `Calendar` and `DatePicker` take and emit
  `YYYY-MM-DD` strings, converted with `parseDate` at the boundary. Consumers never
  import `@internationalized/date`, JSON round-trips are free, and the vendor's date
  object is not part of pulp's contract.
- **State stays on the DOM.** React Aria writes its state as `data-*` attributes
  (`data-selected`, `data-focus-visible`, `data-sort-direction`); pulp styles those and
  adds its own (`data-size`, `data-density`). No render-prop styling, no class-name
  functions: every component passes plain CSS-module class strings.
- **Label wiring belongs to the vendor for these controls.** `Combobox`, `Picker`,
  `DatePicker` and `Slider` use React Aria's `Label`, description `Text` and `FieldError`,
  which it wires with `aria-labelledby` and `aria-describedby` itself. They read the same
  `--field-*` tokens as `Field`, so they look identical; `Field` stays the wrapper for
  native controls, where pulp does the wiring.
- **Native stays native.** `Select` (the native `<select>`) is unchanged and remains the
  default for a plain list of options. `Picker` is the rich single select on the headless
  layer; `Listbox` is the visible list with single or multiple selection.
- **Kept external, tree-shaken.** The package is a runtime dependency listed in tsup's
  `external`; the dist smoke test asserts it is imported, not bundled.

## Consequences

- One more runtime dependency, sizable when a consumer imports every widget; an entry
  that does not use it pays nothing (`sideEffects` and one entry per component).
- Overlays from these components (Combobox and Picker lists, the DatePicker popover) are
  positioned by React Aria's own positioning, not by `internal/floating.ts`. The gap
  between trigger and overlay is still a token: the popover carries it as padding, so no
  offset number lives in code.
- Two interaction stacks coexist for a while: pulp's own (Tabs, Accordion, Menu, Popover,
  Tooltip, built in tiers 1 to 4) and React Aria's. Record 004 says why Menu was not
  migrated. New complex widgets go on React Aria; the simple ones stay as they are.

## Revisit when

Base UI or Ark reach parity on dates and tables with a smaller footprint, or React Aria
changes its DOM contract in a major. The public API is pulp's, so either move is internal.
