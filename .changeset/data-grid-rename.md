---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

**Breaking (experimental component).** The React Aria table is renamed `DataGrid`, and the name `Table` is freed for the plain `<table>` that ships alongside it. What it is called should say what it is: React Aria's is a `role="grid"` widget with roving focus, selection and sorting, and it costs ~52 kB and a client boundary; an HTML `<table>` is what most tables are.

Rename map: `Table` → `DataGrid`, the five parts (`Table.Header` → `DataGrid.Header`, and `.Column`, `.Body`, `.Row`, `.Cell`), the types (`TableProps` → `DataGridProps`, and `TableSelectionMode`, `TableDensity`, `TableSort`, `TableSortDirection`, `TableAlign`), the entry point `@pearpages/pulp-react/table` → `/data-grid`, its stylesheet `/table.css` → `/data-grid.css`, and the tokens `--table-*` → `--data-grid-*`. Nothing about the behaviour or the props changed. Decision record 008.
