# @pearpages/pulp-react

The React components of [pulp](https://pulp.pearpages.com): accessible, driven by tokens, styled
with CSS modules, one entry point per component. Docs, live examples and each component's
accessibility notes are at https://pulp.pearpages.com.

## Install

```sh
npm install @pearpages/pulp-react @pearpages/pulp-css @pearpages/pulp-tokens
```

Requires React 19 and `react-dom`. `@pearpages/pulp-tokens` is a peer dependency.

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
- **Overlays**: `Dialog`, `DialogSystem`, `Menu`, `Popover`, `Tooltip`
- **Feedback**: `Alert`, `Badge`, `ToastProvider` and `useToast`, `Progress`, `Skeleton`, `Spinner`
- **Data**: `Table`
- **Utilities**: `Icon`, `VisuallyHidden`

`Combobox`, `Listbox`, `Picker`, `Calendar`, `DatePicker`, `Slider`, `Table` and `Pagination` are
**experimental**: their API may still change in a minor release. All but `Pagination` build on
React Aria Components, installed with this package and tree-shaken per entry. Their props are
pulp's, and dates cross the API as `YYYY-MM-DD` strings.

## For tooling and coding agents

`@pearpages/pulp-react/component-manifest.json` lists every component with its status, category,
props, accessibility notes and do/don't guidance.

## License

MIT
