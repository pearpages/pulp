export { DataGrid } from './DataGrid';
export type { DataGridProps, DataGridSelectionMode, DataGridDensity, DataGridSort, DataGridSortDirection, DataGridAlign } from './DataGrid';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `DataGrid.Header` is undefined there, `DataGridHeader` is not.
export { DataGridHeader, DataGridColumn, DataGridBody, DataGridRow, DataGridCell } from './DataGrid';
