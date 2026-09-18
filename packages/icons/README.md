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

`AlertCircle`, `Archive`, `ArrowLeft`, `ArrowRight`, `Ban`, `Bookmark`, `Calendar`, `Car`, `Chain`,
`Check`, `CheckCircle`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `Close`, `Compass`,
`Crosshair`, `Export`, `Filter`, `GripVertical`, `Heart`, `HelpCircle`, `Info`, `Mail`, `MapFolded`,
`MapPin`, `Meh`, `Message`, `Moon`, `Note`, `Page`, `Pencil`, `Picture`, `Plus`, `Search`, `Send`,
`Settings`, `Share`, `ShieldCheck`, `Star`, `Sun`, `Tag`, `Trash`, `TrendingUp`, `Trophy`,
`Umbrella`, `Undo`, `User`, `Users`, `Utensils`, `Warning`, `ZoomIn`

Outline only. For a filled state (a saved bookmark, a liked heart) set `fill: currentColor` on the glyph
from your own CSS: a stylesheet beats the `fill="none"` attribute, so no second glyph is needed.

Every glyph is drawn for this set on a 24 grid with a 2 px round stroke; none is copied from another library.

## License

MIT
