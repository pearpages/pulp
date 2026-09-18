# @pearpages/pulp-react

## 0.2.2

### Patch Changes

- a6731f0: Every stylesheet now starts by restating the cascade-layer order (`@layer reset, tokens, vendor, base, components, utilities;`). Layers rank by first appearance, and a bundler decides which file loads first: when a component stylesheet was linked before the reset, `components` became the weakest layer and the reset won, so a primary Button painted as bare text. That is what the deployed Storybook was doing. Importing `@pearpages/pulp-css` first is still the recommended setup, but correct rendering no longer depends on it.
- Updated dependencies [a6731f0]
  - @pearpages/pulp-tokens@0.2.1

## 0.2.1

### Patch Changes

- 63b6449: Button (and everything built on it: IconButton, Alert, Pagination, Toast) now declares `-webkit-user-select: none` next to `user-select: none`. Safari has no unprefixed `user-select`, so on the declared support floor the label stayed selectable. Found by the new support-floor check.

## 0.2.0

### Minor Changes

- 56c2390: Add `Sheet`: a dialog docked to an edge (`placement`: `start | end | top | bottom`, default
  `end`), with Dialog's parts, focus trap, stacking and dismissal. It needs `DialogSystem` and the
  `@pearpages/modals` stylesheet, as Dialog does. `@pearpages/modals` moves to `^0.3.0`, which added
  the docking. New semantic tokens `size.sheet-width` (24rem) and `size.sheet-height` (60vh), and
  `--sheet-width`, `--sheet-height` and `--sheet-motion-translate` component tokens.

### Patch Changes

- Updated dependencies [56c2390]
  - @pearpages/pulp-tokens@0.2.0

## 0.1.0

### Minor Changes

- 1fdb7e7: First release. 38 React 19 components on pulp's tokens, one entry point and stylesheet per
  component, plus a barrel and `styles.css`.
  
  - Typography: `Heading`, `Text`
  - Layout: `Card`, `Stack`, `Inline`
  - Actions: `Button`, `IconButton`
  - Forms: `Field`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup` and
    `Radio`, `Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`
  - Navigation: `Tabs`, `Accordion`, `Pagination`
  - Overlays: `Dialog` and `DialogSystem`, `Menu`, `Popover`, `Tooltip`
  - Feedback: `Alert`, `Badge`, `ToastProvider` (with `useToast`), `Progress`, `Skeleton`, `Spinner`
  - Data: `Table`
  - Utilities: `Icon`, `VisuallyHidden`
  
  The complex widgets (`Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`, `Table`)
  build on React Aria Components and ship as `experimental`, as does `Pagination`. The vendor's props
  stay out of the API, and dates cross it as `YYYY-MM-DD` strings. `Dialog` builds on
  `@pearpages/modals`, and anchored overlays are positioned with `@floating-ui/react-dom`. These
  libraries and `@pearpages/pulp-icons` are runtime dependencies, kept external.
  `@pearpages/pulp-tokens` is a peer dependency.
  
  State is on the DOM as `data-*` attributes, and component CSS sits in `@layer components`.
  `loading` keeps focus (`aria-disabled` and `aria-busy`, never `disabled`), and `ref` is a normal
  prop. `component-manifest.json` describes every component (status, category, accessibility notes,
  do and don't) for docs and tooling.

### Patch Changes

- Updated dependencies [1fdb7e7]
- Updated dependencies [1fdb7e7]
  - @pearpages/pulp-icons@0.1.0
  - @pearpages/pulp-tokens@0.1.0
