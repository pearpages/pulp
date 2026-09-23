# @pearpages/pulp-react

## 0.5.0

### Minor Changes

- 0bc8c65: New `Heatmap` (`@pearpages/pulp-react/heatmap`, Data): a GitHub-style contribution calendar built on `@pearpages/heatmap`, themed by pulp's tokens and following brand and `data-scheme`. Import `@pearpages/heatmap/styles.css` into the vendor layer when you use it. The entry re-exports the data helpers (`groupByWeeks`, `createDateString`, `parseDateString`, `getLastYearPeriod`, `getLastMonthPeriod`) and their types.
  
  New semantic tokens `--color-data-sequential-0` … `-4` in both brands: a sequential scale on the brand's own hue for density data, inverted in dark so more is always brighter (decision record 009).

### Patch Changes

- dd04d87: `Menu` and `Popover` can be server-rendered open. With `defaultOpen` (or a controlled `open` that starts true) their content read `document.body` during the render, so a server render threw. The content now renders closed on the server and opens one commit after hydration, moving focus in as it does after a click.
- dd04d87: `ToastProvider` no longer breaks hydration. Under server rendering (Next.js), the first client render portalled the notifications region while the server had rendered nothing there, so React discarded the server HTML and re-rendered the whole app on every page load. The region now mounts one commit after hydration; no toast can be fired before then, so nothing is lost. `DialogSystem` was checked the same way and was already safe. Both are covered by a server-render-then-hydrate test.
- Updated dependencies [0bc8c65]
  - @pearpages/pulp-tokens@0.5.0

## 0.4.0

### Minor Changes

- d5e1098: Eight categorical accents at the semantic tier, in both brands: `--color-accent-1` … `--color-accent-8`, each with its text colour `--color-accent-on-1` … `on-8`. They follow the scheme (`light-dark()`), every pair is in the contrast tests at 4.5:1, and the hues come in the same order in every brand (blue, orange, green, violet, red, teal, amber, pink). They are for telling things of one kind apart, people mostly; a number carries no meaning. They are in `theme.css` and the native output too.
  
  Avatar and Chip take `accent?: 1 | … | 8`. On an Avatar it is the colour behind the initials (a picture ignores it). A Chip with an accent is filled with it; a toggle chip shows it as the border until it is selected. The consumer hashes an id to the index, so a colour is never passed as a style.
- e5d2bd6: Badge: `tone="action"`, the brand's colour, in the three variants. For a marker that is not a status, such as the unread dot or count on a navigation item; it reads `--badge-action-*`, which point at the action tokens whose contrast is already tested.
- bc49901: A subtle Badge now draws a hairline edge in the tone's own colour, the same one as its label. On a tinted surface the subtle fill alone was not a pill: measured across both brands, every `*-subtle` fill sits between 1.00 and 1.40:1 against the surfaces it lands on, so "Pending" read as coloured text with no shape. The edge is the label's colour, which the contrast tests already hold to 4.5:1 on every surface, and a token test keeps the two from drifting apart.
  
  Every badge now carries a border, transparent unless the variant is `subtle`, so solid, subtle and dot stay the same size as each other; `box-sizing: border-box` keeps the dot at exactly `--badge-dot-size`. A badge with text is 2px wider and taller than before. New tokens: `--badge-border-width` and `--badge-<tone>-subtle-border`.
- 3743f63: **Breaking (experimental component).** The React Aria table is renamed `DataGrid`, and the name `Table` is freed for the plain `<table>` that ships alongside it. What it is called should say what it is: React Aria's is a `role="grid"` widget with roving focus, selection and sorting, and it costs ~52 kB and a client boundary; an HTML `<table>` is what most tables are.
  
  Rename map: `Table` → `DataGrid`, the five parts (`Table.Header` → `DataGrid.Header`, and `.Column`, `.Body`, `.Row`, `.Cell`), the types (`TableProps` → `DataGridProps`, and `TableSelectionMode`, `TableDensity`, `TableSort`, `TableSortDirection`, `TableAlign`), the entry point `@pearpages/pulp-react/table` → `/data-grid`, its stylesheet `/table.css` → `/data-grid.css`, and the tokens `--table-*` → `--data-grid-*`. Nothing about the behaviour or the props changed. Decision record 008.
- 5cd58f1: Dialog's width is a pulp token now, `--dialog-width`, from the new semantic `--size-dialog-width` (32.5rem, the same 520px the vendor was already using, so nothing moves). Set it in a class on `Dialog.Content` to size one dialog without touching the rest, the way `--sheet-width` already works for Sheet; `@pearpages/modals`' own `--modal-width-md` is set from it and stays pulp's business. Both are now said in the components' docs, with a story.
- 2c5bb3f: New `Table`: a plain `<table>` with pulp's density and tokens. It holds no state and calls no hook, so it is a **server entry** — a page of rows costs no JavaScript and no client boundary, which is what the React Aria grid could never be. Compound in the same shape as `DataGrid` (`Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell`), so moving between the two is mechanical.
  
  `caption` is required, because a table nobody named is a table a screen reader cannot introduce; `captionHidden` keeps the name without showing it. `rowHeader` on a cell makes it the row's `th scope="row"`, `align="end"` right-aligns with tabular numerals, `density="compact"` tightens the rows, and `Table.Body` takes an `emptyMessage`. For rows the reader sorts or selects, reach for `DataGrid`. Decision record 008.
- 4bf9d88: Textarea takes `hideLabel`, as TextField does: the label stays for assistive technology and leaves the page. Both now go through `Field.Label`'s new `visuallyHidden` prop, so a control you build on Field gets it too.
- 5096f3b: Toast: `placement="bottom-center"`, for an app with a bottom navigation. The distance from the top or the bottom edge is now its own token, `--toast-offset-block`, separate from the inline `--toast-offset`, and the safe-area inset (`env(safe-area-inset-top)` / `-bottom`) is added to it, so a toast clears the notch and the home indicator; raise `--toast-offset-block` by the height of your navigation. If you had overridden `--toast-offset` to move the stack vertically, override `--toast-offset-block` too: both default to the same value.

### Patch Changes

- 2c5bb3f: The build raises Node's heap for the declaration step. With 45 entries the single tsup dts worker exceeded the default limit and the build failed with `ERR_WORKER_OUT_OF_MEMORY` right after a successful esbuild pass, which reads like a broken type but is a count-of-entries ceiling.
- 11cf243: SegmentedControl: when the segments do not fit their container, the labels shorten with an ellipsis instead of drawing over the next segment, and an icon keeps its size (it used to be squeezed to nothing). The full label is still the radio's accessible name. Applies to `SegmentedControl.NavItem` too, except with `asChild`, where the child is yours.
- cc6d08e: A toast fired while a dialog is open is now pressable and announced. A dialog makes every sibling of its portal `inert` and `aria-hidden`, and the toast region is one, so "Removed · Undo" from inside a dialog could not be pressed or heard until the dialog closed. The region now carries `data-modal-keep-active`, which `@pearpages/modals` 0.4.0 leaves alone; the dependency is `^0.4.0`, which also drops the `@charset` rule that landed inside the `vendor` layer, and follows the software keyboard on iOS while a dialog is open.
- Updated dependencies [d5e1098]
- Updated dependencies [e5d2bd6]
- Updated dependencies [bc49901]
- Updated dependencies [6681389]
- Updated dependencies [3743f63]
- Updated dependencies [5cd58f1]
- Updated dependencies [8822ba9]
- Updated dependencies [2c5bb3f]
- Updated dependencies [b424c8d]
- Updated dependencies [5096f3b]
  - @pearpages/pulp-tokens@0.4.0

## 0.3.0

### Minor Changes

- a67db76: Avatar (experimental): a person as a picture or as initials. `name`, `src`, `alt`, `size` (`sm`–`xl`), and an image element as the child so a framework's image component (`next/image`) takes the styles. The initials take over when there is no image and when the image fails to load. One token background for everyone, never a colour hashed from the name. Tokens: `--avatar-*`.
- b67331b: Badge: `variant="dot"`, a presence mark with no visible text whose `label` is rendered for assistive technology, and `count` with `max` (default 99, shown as "99+"; zero or less renders nothing). With a `count`, `label` says what is counted ("3 unread"). Token: `--badge-dot-size`.
- 087fc7c: Button and IconButton: `tone="danger"` for actions that destroy something. It recolours whichever `variant` is in use (`variant="ghost" tone="danger"` is a quiet delete). Two new semantic tokens in both brands, `--color-status-error-hover` and `--color-status-error-active`, for a filled error surface under the pointer and while pressed; component tokens `--button-danger-*`.
- f339ace: Chip (experimental): a pill for a filter that toggles (`selected` / `defaultSelected` / `onSelectedChange`, a native button with `aria-pressed`) or a value that can be removed (`onRemove`), or both. The remove control is a second button beside the label, never inside it, named "Remove" plus the chip's label. `size` (`sm`–`lg`), `tone` (`neutral`, `action`), `disabled`. Tokens: `--chip-*`.
- 9cb4d70: Divider (experimental): a hairline between two groups, horizontal or vertical, with `spacing` on the spacing scale. Decorative by default (`role="none"`); `decorative={false}` makes it a `separator`. Tokens: `--divider-color`, `--divider-thickness`, `--divider-spacing-{sm,md,lg}`.
- a33cd6d: EmptyState (experimental): what a list, a search or a page shows instead of its content. `title` (a real heading at `headingLevel`), `description`, a decorative `icon` in a tinted disc, one `action`, and `tone` (`neutral`, `error`). Composes Heading, Text and Stack. It announces nothing by itself: pass `role="status"` or `role="alert"` when it replaces content after the user did something. Tokens: `--empty-state-*`.
- 7faf287: Link (experimental): a text link with `tone` (`action`, `default`, `muted`), `underline` (`always`, `hover`) and `asChild`, so a router's own link component takes the styles and keeps client-side navigation. Underlined by default: colour alone does not tell a link from the text around it. Tokens: `--link-*`.
- 739b6a4: SegmentedControl (experimental): one choice out of a few, all visible. Generic over a string union (`options`, `value` / `defaultValue`, `onValueChange`), `look` (`segmented`, `chips`), `size`, `fullWidth`, `name`. Native radio inputs underneath, so the keyboard, the single tab stop and form submission are the browser's. `SegmentedControl.Nav` and `SegmentedControl.NavItem` give the same look to links that navigate: a labelled `nav` with `aria-current="page"`, and `asChild` for a router's link. Tokens: `--segmented-control-*`.
- bb65f9b: Sheet: a bottom sheet can be dragged down to close it. `Sheet.Content` renders a grab handle when `placement="bottom"` (`dragToDismiss`, on by default); past a quarter of the sheet's height, or with a flick, it closes through the dialog's own path, so `onOpenChange` fires and focus returns to the trigger. Pointer and touch only, hidden from assistive technology, and off under `prefers-reduced-motion`. Tokens: `--sheet-handle-*`.
- d65c52a: New semantic token `--color-surface-overlay` in both brands: the surface of what floats above the page. In dark schemes it is one step lighter than `--color-surface-raised`, so a menu or a dialog reads as above a card without relying on a shadow; in light it may equal it. Dialog, Sheet, Menu, Popover and the DatePicker, Combobox and Picker popovers now paint with it (`--combobox-popover-bg` and `--picker-popover-bg` are new). Light schemes look the same as before in pulp.
- c98e287: TextField: the search affordance. `iconStart` puts a decorative glyph inside the field (`type="search"` gets the Search glyph by default), `onClear` adds a clear button that appears once there is a value (named by `clearLabel`), Escape clears too and keeps the event from a surrounding dialog, and `hideLabel` keeps the label for assistive technology only. A plain TextField renders exactly as before. Tokens: `--text-field-icon-*`.
- 225419b: Toast: `toast.undo(message, onUndo, options?)`, the shorthand for a reversible action. It shows the message with an Undo button (`label` for other languages), runs `onUndo` and dismisses when pressed, and lasts 8 s by default, longer than an ordinary toast. `toast(options)` is unchanged, and its existing `action: { label, onClick }` is what `undo` builds on.
- ea9a090: React Server Components: every entry that needs the browser now ships with `'use client'`, so pulp can be imported from a server file on the Next.js App Router. 18 leaf entries carry no directive and render on the server as they are (Text, Heading, Stack, Inline, Card, Divider, Badge, Skeleton, Spinner, Progress, Icon, VisuallyHidden, Link, Button, IconButton, Alert, Pagination, EmptyState). The component manifest gains a `client` field per component. The barrel is a client module: import per-component entries to keep server-safe components on the server.

### Patch Changes

- Updated dependencies [a67db76]
- Updated dependencies [b67331b]
- Updated dependencies [087fc7c]
- Updated dependencies [f339ace]
- Updated dependencies [9cb4d70]
- Updated dependencies [a33cd6d]
- Updated dependencies [6aa8b0b]
- Updated dependencies [7faf287]
- Updated dependencies [739b6a4]
- Updated dependencies [bb65f9b]
- Updated dependencies [d65c52a]
- Updated dependencies [c98e287]
- Updated dependencies [d746f6c]
  - @pearpages/pulp-tokens@0.3.0
  - @pearpages/pulp-icons@0.2.0

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
