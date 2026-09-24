# @pearpages/pulp-react

The React components of [pulp](https://pulp.pearpages.com): accessible, driven by tokens, styled
with CSS modules, one entry point per component. Docs, live examples and each component's
accessibility notes are at https://pulp.pearpages.com.

## Install

```sh
npm install @pearpages/pulp-react @pearpages/pulp-css @pearpages/pulp-tokens
```

Requires React 19 and `react-dom`. `@pearpages/pulp-tokens` is a peer dependency.

With pnpm 11, a release less than 24 hours old will not install: `minimumReleaseAge` defaults to
1440 minutes, as a guard against a hijacked package reaching you at once. To take a pulp release
on the day it ships, exempt the scope in `pnpm-workspace.yaml`:

```yaml
minimumReleaseAgeExclude:
  - '@pearpages/*'
```

npm and yarn have no such delay.

## Use

Load the styles once:

```css
@import "@pearpages/pulp-css";
@import "@pearpages/pulp-react/styles.css";
```

Every component also has its own stylesheet (`@pearpages/pulp-react/button.css`, …) if you load
only what you use.

Import each component from its own entry point, or everything from the package root:

```tsx
import { Button } from '@pearpages/pulp-react/button';

<html data-brand="bitepals" data-scheme="dark">
  <Button variant="secondary" size="lg">Save</Button>
</html>
```

`data-brand` (`pulp` or `bitepals`) and `data-scheme` (`light`, `dark`, or none to follow the OS)
theme everything inside the element they're on.

## Components

- **Typography**: `Heading`, `Link`, `Text`
- **Layout**: `Card`, `Divider`, `Inline`, `Stack`
- **Actions**: `Button`, `Chip`, `IconButton`
- **Forms**: `Calendar`, `Checkbox`, `Combobox`, `DatePicker`, `Field`, `Listbox`, `Picker`, `RadioGroup`,
  `Radio`, `SegmentedControl`, `Select`, `Slider`, `Switch`, `TextField`, `Textarea`
- **Navigation**: `Accordion`, `Pagination`, `Tabs`
- **Overlays**: `DialogSystem`, `Dialog`, `Menu`, `Popover`, `Sheet`, `Tooltip`
- **Feedback**: `Alert`, `Badge`, `EmptyState`, `Progress`, `Skeleton`, `Spinner`, `ToastProvider` (and `useToast`)
- **Data**: `DataGrid` (sortable and selectable), `Heatmap` (a contribution calendar), `Table` (a plain `<table>`)
- **Utilities**: `Avatar`, `Icon`, `VisuallyHidden`

A component marked **experimental** (on its docs page, and as `status` in the component manifest)
may still change its API in a minor release. The complex widgets (Combobox, Listbox, Picker,
Calendar, DatePicker, Slider, DataGrid) build on React Aria Components, installed with this package
and tree-shaken per entry; their props are pulp's, and dates cross the API as `YYYY-MM-DD` strings.

Each entry is small: half of them are under 1 kB brotli and the largest (Toast) is 3.1 kB, React
Aria and the modal and heatmap vendors aside. Every entry has a size budget that CI enforces.

## Dialogs and Heatmap need one more stylesheet

`Dialog`, `DialogSystem` and `Sheet` (a dialog docked to an edge) build on
[`@pearpages/modals`](https://www.npmjs.com/package/@pearpages/modals): the focus trap, the inert
page behind the dialog, stacking, Escape and backdrop dismissal are its work. `Heatmap` builds on
[`@pearpages/heatmap`](https://www.npmjs.com/package/@pearpages/heatmap). Both are installed with
this package, and pulp maps its own tokens onto their variables (`--modal-*`,
`--contribution-heatmap-*`), so they follow `data-brand` and `data-scheme` like everything else.

Their stylesheets are the ones you import yourself. Put them in the `vendor` layer, which
`@pearpages/pulp-css` declares below `components`, so pulp's styles win:

```css
@import "@pearpages/pulp-css";
@import "@pearpages/modals/styles.css" layer(vendor);
@import "@pearpages/heatmap/styles.css" layer(vendor);
@import "@pearpages/pulp-react/styles.css";
```

Skip the modals line if you never render a `Dialog` or `Sheet`, and the heatmap line if you never
render a `Heatmap`. Every pulp stylesheet restates the layer order, so the result does not depend on
which file your bundler loads first; importing `@pearpages/pulp-css` first stays the recommended
setup. Mount `DialogSystem` once near the root; without the stylesheet a dialog opens unstyled.

## React Server Components

Every entry that needs the browser ships with `'use client'` as its first statement, so on the
Next.js App Router (or any RSC setup) you import pulp from a server file and it works: the client
entries become client boundaries on their own. The leaf, hook-free entries carry no directive and
render on the server as they are: Alert, Badge, Button, Card, Divider, EmptyState, Heading, Heatmap,
Icon, IconButton, Inline, Link, Pagination, Progress, Skeleton, Spinner, Stack, Table, Text,
VisuallyHidden (the `client` field of the component manifest is the list). Three things to know:

- The barrel (`@pearpages/pulp-react`) is a client module, because it re-exports everything. Import
  from the per-component entries (`@pearpages/pulp-react/text`) to keep server-safe ones on the server.
- In a Server Component, write compound parts by their flat names: `MenuTrigger`, `TabsList`,
  `DialogTitle`, not `Menu.Trigger`. A client entry reaches a server file as a client reference,
  which carries only named exports, so the dotted form is `undefined` there ("Element type is
  invalid"). Every part has a flat export from the same entry; in client files both forms work.
- A function cannot cross from a server file into any component, pulp's or not. `<Button asChild>`
  around a link is fine in a Server Component; `<Button onClick={…}>` belongs in a client file.

## For tooling and coding agents

`@pearpages/pulp-react/component-manifest.json` lists every component with its status, category,
props, accessibility notes and do/don't guidance.

## License

MIT
