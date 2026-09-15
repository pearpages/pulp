# @pearpages/pulp-icons

The icons of [pulp](https://pulp.pearpages.com): a curated set of stroke icons as React
components, generated from SVG. Tree-shakeable, sized by font size, coloured by `currentColor`.

## Install

```sh
npm install @pearpages/pulp-icons
```

Requires React 19.

## Use

```tsx
import { Check, Search } from '@pearpages/pulp-icons';

<Search />                 // decorative: hidden from assistive technology
<Check title="Saved" />    // meaningful: an image named "Saved"
```

Each icon is `1em` square and draws in `currentColor`, so it follows the text around it.
Import only the icons you use; bundlers drop the rest.

With `@pearpages/pulp-react`, wrap an icon in `Icon` to size it to the icon scale:

```tsx
import { Icon } from '@pearpages/pulp-react/icon';

<Icon size="lg" label="Saved"><Check /></Icon>
```

## Icons

`ArrowLeft`, `ArrowRight`, `Calendar`, `Check`, `ChevronDown`, `ChevronLeft`, `ChevronRight`,
`Close`, `Info`, `Plus`, `Search`, `Warning`

## License

MIT
