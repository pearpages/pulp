# 008. `Table` is a `<table>`; the React Aria one becomes `DataGrid`

Date: 2026-09-20 (group 11). Status: accepted. Breaking for an `experimental` component.

## Context

pulp shipped one table, built on React Aria's grid: roving focus, selection, sortable headers. It is
`role="grid"`, it is a client component, and its entry costs about 52 kB with the vendor.

bitepals has eight tables. All eight are read-only, rendered by Server Components, with a `render`
callback per column. Not one of them could use pulp's: the cost is wrong, and a client boundary
around a page of static rows is wrong in a way no amount of tokens fixes. So bitepals kept its own
68-line `<table>`, and the design system lost the most ordinary component there is.

The gap is the same one `Select` and `Picker` already answer in this repo: the cheap, native, boring
thing is the default and carries the plain name; the rich thing on the headless layer sits beside it
with a name that says what it adds. `Select`'s `@dont` points at `Picker`, and `Picker`'s prose calls
`Select` "the default".

The obstacle was only that `Table` was taken by the rich one.

## Decision

**Rename the React Aria component to `DataGrid`, and give `Table` to a plain `<table>`.**

- `DataGrid` keeps every prop, part and behaviour it had. Only the names move: the export, the five
  parts, the types, the entry point, the stylesheet and the `--data-grid-*` tokens.
- `Table` is new: compound in the same shape (`Table.Header`, `Table.Column`, `Table.Body`,
  `Table.Row`, `Table.Cell`), so the two read alike and moving between them is mechanical. It holds
  no state and calls no hook, so it stays a **server entry** — which is the whole point, and the
  server-safe list in the dist smoke test now names it, making that a decision rather than an
  accident. `align` is an explicit prop on column and cell rather than context, which is what keeps
  it hook-free.
- Each has its own token file, `table.json` beside `data-grid.json`, on the precedent `textarea.json`
  sets against `text-field.json`: parallel today, free to diverge.

**On the rename being breaking.** The component is `@status experimental`, which is what that status
is for. It matters more that a renamed export fails loudly — TypeScript and the bundler both stop —
unlike a renamed token, which the browser drops in silence. That asymmetry is the same reason
`scripts/public-tokens.mjs` pins the semantic names and nothing pins the component names. The cost of
this rename only grows, and it is smallest now, before a consumer adopts the grid.

## Consequences

- A consumer of the old `Table` changes an import and a name; the changeset carries the map.
- bitepals replaces its local table with `Table` and keeps its Server Components.
- Two components in `Data` where there was one, and the `@do`/`@dont` pair has to keep pointing at
  each other, as `Select` and `Picker` do. A reader who takes `DataGrid` for a read-only list is the
  failure mode; that is what the bullets are for.
- **Revisit when** `Table` grows a prop that only a grid can honour. The answer then is to use
  `DataGrid`, not to blur the two.
