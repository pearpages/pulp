---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

New `Table`: a plain `<table>` with pulp's density and tokens. It holds no state and calls no hook, so it is a **server entry** — a page of rows costs no JavaScript and no client boundary, which is what the React Aria grid could never be. Compound in the same shape as `DataGrid` (`Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell`), so moving between the two is mechanical.

`caption` is required, because a table nobody named is a table a screen reader cannot introduce; `captionHidden` keeps the name without showing it. `rowHeader` on a cell makes it the row's `th scope="row"`, `align="end"` right-aligns with tabular numerals, `density="compact"` tightens the rows, and `Table.Body` takes an `emptyMessage`. For rows the reader sorts or selects, reach for `DataGrid`. Decision record 008.
