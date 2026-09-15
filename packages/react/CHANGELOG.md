# @pearpages/pulp-react

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
