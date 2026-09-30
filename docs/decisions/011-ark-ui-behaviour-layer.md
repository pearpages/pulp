# 011. Complex widgets move to Ark UI, one at a time

Date: 2026-09-29. Status: accepted for a pilot: Slider only. The rest of the migration, and new
widgets on Ark, wait for the pilot's verdict (step 1 below), recorded here. Until then record 001
stands for every complex widget.

## Context

Principle 1 says that when the next framework arrives, the token and CSS packages do not change. That
part holds: the tokens are DTCG JSON, the stylesheets are plain CSS on custom properties, and the
simple components (Button, Badge, Card, Pagination) are markup and a stylesheet that any renderer
rewrites in an afternoon.

The complex widgets are the exception. Combobox, Listbox, Picker, Calendar, DatePicker, Slider and
DataGrid build on `react-aria-components` (record 001), and everything that makes them accessible
(focus management, typeahead, `aria-activedescendant`, the date segments, the grid's navigation)
lives in React hooks. A second renderer, whether web components or Vue, gets the tokens and the CSS
for free and none of that. It would have to rewrite the part that is hardest to get right, and that
is where most of the value is. That is the largest debt pulp carries against principle 1, and it is
hidden because nothing fails today: pulp has one renderer.

Writing that behaviour ourselves is not the way out. The ARIA Authoring Practices combobox pattern
alone is a long list of keyboard, focus and announcement rules, and a correct implementation has to be checked in several browsers
with VoiceOver, NVDA and JAWS. When it is wrong nothing fails: the screen-reader user just cannot
finish the task. Principle 6 already rules this out, and so did record 001.

Record 001 considered Ark and chose React Aria because Ark's date and table coverage was thinner.
That reasoning was about coverage. It did not weigh portability, which is the reason for this record.

## Decision

**Ark UI is pulp's behaviour and accessibility layer for complex widgets. The React Aria components
move to it one at a time, in the order below.**

Ark's behaviour lives in Zag.js: finite state machines that know only the DOM, with a thin adapter per
framework (`@zag-js/react`, `@zag-js/vue`, Solid, Svelte). The machine that drives pulp's Combobox in
React is the same one a Vue or web-component renderer would drive, so the keyboard model, the ARIA
wiring and their tests carry over.

Ark is built for exactly this: a design system that owns its look across frameworks. It is maintained
by the Chakra UI team, and its showcase lists production design systems at Pluralsight and OVHcloud.

**What Ark owns and what pulp owns** is the boundary record 001 already drew, and it moves unchanged:

- Ark owns behaviour, ARIA attributes, focus and dismissal. Nothing else.
- pulp owns the component names, the part shapes (`Combobox.Option`, and the flat `ComboboxOption`),
  the props, the tokens, the CSS modules and the `data-*` contract. Vendor spellings never reach the
  public API, so a migration changes no prop. It does change the DOM, the vendor's own attributes
  (`data-selected` becomes `data-state`) and keyboard details, so each one ships as a minor with a
  changeset that says what moved.
- Ark writes state as `data-state`, `data-highlighted`, `data-disabled` and marks parts with
  `data-scope`/`data-part`. pulp styles those through its own class names, as it styles React Aria's
  `data-*` today, and keeps its own (`data-size`, `data-density`).
- Dates stay `YYYY-MM-DD` strings at the boundary (`src/internal/dates.ts`). Zag's date machines use
  `@internationalized/date`, the library pulp already converts through, so the conversion moves
  and does not change.
- Label, description and error keep one internal helper, as `AriaField.tsx` is today, rebuilt on
  Ark's `Field` and reading the same `--field-*` tokens.

**The trade-off.** Both build on `@internationalized/date`, and Zag's date picker takes a time zone
and non-Gregorian calendars as React Aria's does. Where Ark is thinner is time: React Aria's segmented
date and time fields go down to the second, and Ark's picker is centred on choosing a day. pulp
exposes none of that: `Calendar` and `DatePicker` take and emit `YYYY-MM-DD` strings, a day in the
local calendar, and nothing else. What pulp gives up is depth it never offered.

**The order**, cheapest first. Each step either confirms Ark or stops the move:

1. **Slider** proves Ark on the smallest widget: tokens mapped onto Ark's parts, `'use client'`
   detection, hydration, the size budget, the four matrix screenshots unchanged. If Ark fails
   anywhere, it fails here, at the lowest cost.
2. **Combobox, Listbox, Picker**, the selection widgets. They share `internal/selection.ts` and the
   field helper, so they move together.
3. **Calendar and DatePicker.** They look like the most expensive part, but because pulp uses only
   the common case, they are cheap.
4. **DataGrid stays on React Aria**, as a conscious exception. Ark has no grid: moving it means
   building the full `grid` role (two-dimensional roving focus, sortable headers, selection) on
   pulp's own code or waiting for Zag to ship one. Record 008 already gave the everyday case to
   `Table`, a server-rendered `<table>` with no vendor, so `DataGrid` serves the rare interactive
   case and has the smallest audience. It moves when a second renderer needs a grid, or when Zag has
   one.

**Pagination is not on the list.** It was never on React Aria. It is Button and IconButton in a `nav`
landmark, with no keyboard model of its own, and a server-safe entry. Ark's pagination machine would
make it a client entry and give it nothing it lacks. A second renderer rewrites it like any simple
component.

## Consequences

- For a while there are two vendors. `.size-limit.js` gains "with Ark" entries beside the "with React
  Aria" ones; `scripts/client-entries.mjs` learns `@ark-ui/react` as a client package (and any `@zag-js/*` package a
  pulp module imports directly: the list is kept by hand, record 015); tsup keeps
  both external, and the dist smoke test asserts it. `react-aria-components` stays a dependency for as long as `DataGrid`
  uses it.
- The size claim is Ark's, not ours yet. Slider's budget is where it gets measured: if the Ark entry
  costs more than the React Aria one, that is part of step 1's verdict, recorded here.
- Every migrated component is `experimental` (record 010), and the migration does not advance its
  promotion. The manual keyboard and screen-reader review that criterion 3 requires is done on
  the Ark version. A review of the React Aria version says nothing about the new one.
- The hand-rolled widgets (Menu, Tabs, Accordion, Popover, Tooltip) are out of scope. Record 004's
  criteria still decide Menu. Ark has machines for all five, so when a second renderer is real they
  are the next candidates, for the same reason as this record.
- If the pilot confirms Ark, a new complex widget builds on it from the start, and `CLAUDE.md`'s
  rule changes then, not before: Ark's plumbing (client entry, size budget, dist assertion) exists
  only once Slider has built it.
- **Revisit when** step 1 finds that Ark costs more in size or correctness than React Aria, or when
  a second renderer is actually started (that decides DataGrid and the hand-rolled five).
