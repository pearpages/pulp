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

- **Typography**: `Heading`, `Text`
- **Layout**: `Card`, `Stack`, `Inline`
- **Actions**: `Button`, `IconButton`
- **Forms**: `Field`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`,
  `Radio`, `Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`
- **Navigation**: `Tabs`, `Accordion`, `Pagination`
- **Overlays**: `Dialog`, `DialogSystem`, `Sheet`, `Menu`, `Popover`, `Tooltip`
- **Feedback**: `Alert`, `Badge`, `ToastProvider` and `useToast`, `Progress`, `Skeleton`, `Spinner`
- **Data**: `Table`
- **Utilities**: `Icon`, `VisuallyHidden`

`Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`, `Table`, `Pagination` and
`Sheet` are **experimental**: their API may still change in a minor release. All but `Pagination` build on
React Aria Components, installed with this package and tree-shaken per entry. Their props are
pulp's, and dates cross the API as `YYYY-MM-DD` strings.

## Dialogs need one more stylesheet

`Dialog`, `DialogSystem` and `Sheet` (a dialog docked to an edge) build on
[`@pearpages/modals`](https://www.npmjs.com/package/@pearpages/modals): the focus trap, the inert
page behind the dialog, stacking, Escape and backdrop dismissal are its work, and it is installed
with this package. pulp maps its own tokens onto the vendor's `--modal-*` variables, so a dialog
follows `data-brand` and `data-scheme` like everything else.

The vendor's stylesheet is the one you import yourself. Put it in the `vendor` layer, which
`@pearpages/pulp-css` declares below `components`, so pulp's styles win:

```css
@import "@pearpages/pulp-css";
@import "@pearpages/modals/styles.css" layer(vendor);
@import "@pearpages/pulp-react/styles.css";
```

Every pulp stylesheet restates the layer order, so the result does not depend on which file your
bundler loads first; importing `@pearpages/pulp-css` first stays the recommended setup.

Then mount `DialogSystem` once near the root. Without the stylesheet a dialog opens unstyled; if
you never render a `Dialog`, skip it.

## For tooling and coding agents

`@pearpages/pulp-react/component-manifest.json` lists every component with its status, category,
props, accessibility notes and do/don't guidance.

## License

MIT
