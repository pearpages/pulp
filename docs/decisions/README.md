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
