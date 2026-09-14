---
"@pearpages/pulp-react": minor
"@pearpages/pulp-tokens": minor
"@pearpages/pulp-icons": minor
---

Tier 5 complex widgets on React Aria Components (decision record 001):
`Combobox`, `Listbox`, `Picker` (the rich single select; the native `Select`
stays), `Calendar`, `DatePicker`, `Slider` and `Table`, plus `Pagination`
built from Button. `react-aria-components` and `@internationalized/date` are
new runtime dependencies, kept external and tree-shaken per entry. Dates
cross the API as `YYYY-MM-DD` strings. New semantic token
`size.listbox-height`; new icons `Calendar` and `ChevronLeft`. Stylelint now
allows percentages for the spacing properties (ratios, not brand values).
