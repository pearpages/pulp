# 018. A category says what the component does for the user; four components move

Date: 2026-10-15. Status: accepted. It keeps the nine categories (`packages/react/scripts/categories.mjs`)
and moves Avatar, Accordion, Link and Chip.

## Context

The categories are kinds, never tiers: what a consumer reaches for. Four placements broke that rule.
They had been filed by what each component *looks like*, or by the batch it came in.

- **Avatar was in Utilities.** It shows a person: an image, or the person's initials, in an accent.
  The other two Utilities, `Icon` and `VisuallyHidden`, are plumbing that other components build on.
  `VisuallyHidden` renders nothing visible at all.
- **Accordion was in Navigation.** It shows and hides content in place and takes the user nowhere.
  Other systems file it as a disclosure, with layout or containers.
- **Link was in Typography.** It is inline text, which is a defensible reason. But what it does is
  take the user somewhere, and Polaris and Primer both file it under navigation.
- **Chip was in Actions.** Its own JSDoc says what it is for: "a choice or a value the user
  controls". A toggle chip holds a `selected` state, as a checkbox does. A removable chip stands for
  a value the user picked and can take back. A chip that does nothing is ruled out by its `@dont`
  ("that is a Badge"). Actions (Button, IconButton) are for triggering something, and a chip holds
  state instead.

## Decision

Each category answers one question about the component:

| Category | The question it answers |
| --- | --- |
| Typography | Does it set text? |
| Layout | Does it arrange or contain content, or show and hide it in place? |
| Actions | Does pressing it do something, without holding a value? |
| Forms | Does it hold a value or a choice the user controls? |
| Navigation | Does it take the user somewhere: another page, section or view? |
| Overlays | Does it float above the page? |
| Feedback | Does it report status or progress? |
| Data | Does it display records or entities: rows, cells, people? |
| Utilities | Is it plumbing other components build on, with little or nothing of its own to see? |

Under these questions:

- **Avatar → Data.** It displays an entity. The category keeps its name: "Data display" would say
  the same thing at the cost of a rename, and Badge stays in Feedback because it reports a status.
- **Accordion → Layout.** It shows and hides content in place.
- **Link → Navigation.** It takes the user somewhere. Navigation is now Link, Pagination and Tabs,
  and Breadcrumbs joins them when it lands.
- **Chip → Forms.** Its API makes this a decision about what it is, not about how one consumer uses
  it. The open question was whether Chip is a control or a display, and it should be settled before
  Chip leaves `experimental`. It is a control.

## Consequences

- A component's story title is `Components/<Category>/<Name>`, so its Storybook URL changes:
  `components-utilities-avatar--docs` is now `components-data-avatar--docs`, and the same holds for
  the other three. Links into the site are derived from the manifest (`docsPath()`) and the link
  check covers them. A bookmark or an external link to an old URL lands on Storybook's "not found".
- The manifest's `category` changes for these four. That is metadata, not API: no import changes.
- Forms now holds 16 components and Navigation 3. The imbalance is expected, because form controls
  are most of a design system.

## Revisit when

Forms gains its next inputs (the token gaps and new controls in `tasks.md`). At that point, split it
into **Inputs** (TextField, Textarea, Field, Slider, DatePicker, Calendar) and **Selection**
(Checkbox, Radio, Switch, Select, Combobox, Listbox, Picker, SegmentedControl, Chip), the way
Polaris does. That split is a tenth category, and so another round of URL changes. Do it once, when
the size of Forms justifies it, and not one component at a time.
