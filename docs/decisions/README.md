# Decision records

One file per decision that shaped the system and is not obvious from the code. Each says
what was decided, why, what it costs, and when to revisit it. `PRINCIPLES.md` is the
standing rule; a record here is a concrete application of a principle where more than one
option was defensible. Newest last. The Storybook renders this folder under "Decisions".

| # | Decision |
| --- | --- |
| [001](001-headless-layer.md) | Complex widgets build on React Aria Components |
| [002](002-floating-positioning.md) | Anchored overlays position with `@floating-ui/react-dom` behind one hook |
| [003](003-sheet-waits-for-modals.md) | Sheet waits for a `placement` feature in `@pearpages/modals` |
| [004](004-menu-stays-hand-rolled.md) | Menu keeps its own interaction model, reviewed against React Aria |
| [005](005-token-outputs.md) | One `tokens.css`, plus `theme.css` for Tailwind v4 and `native` for React Native |
| [006](006-primitives-and-tailwind.md) | Primitive names collide with Tailwind's default theme: declare the layer order, prefix at 1.0 |
| [007](007-per-brand-component-tokens.md) | A brand may override a single component token |
| [008](008-table-and-datagrid.md) | `Table` is a `<table>`; the React Aria one becomes `DataGrid` |
| [009](009-heatmap-and-a-data-scale.md) | `Heatmap` builds on `@pearpages/heatmap`, and pulp gains a sequential data scale |
| [010](010-promotion-to-stable.md) | A component is promoted to `stable` on five criteria, all required |
| [011](011-ark-ui-behaviour-layer.md) | Complex widgets move to Ark UI one at a time, starting with a Slider pilot |
| [012](012-portability-gradient.md) | Portability is layered: tokens reach every renderer, CSS and behaviour the DOM ones, native accessibility is built fresh |
| [013](013-token-roles-and-families.md) | Semantic tokens state their role, and component colour tokens read a family their slot accepts |
