export { Table } from './Table';
export type { TableProps, TableDensity, TableAlign } from './Table';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Table.Header` is undefined there, `TableHeader` is not.
export { TableHeader, TableColumn, TableBody, TableRow, TableCell } from './Table';
