# @pearpages/pulp-react

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
