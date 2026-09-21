import type { ReactNode, Ref, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react';
import { classes } from '../internal/classes';
import styles from './Table.module.css';

export type TableDensity = 'default' | 'compact';
export type TableAlign = 'start' | 'end';

export interface TableProps extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** Names the table. Rendered as a real `<caption>`; `captionHidden` keeps it for assistive technology only. */
  caption: ReactNode;
  /** Keeps the caption off the page. The table is still named by it. @default false */
  captionHidden?: boolean;
  /** `compact` tightens the row padding. @default 'default' */
  density?: TableDensity;
  /** Applied to the scroll container, not the `table`. */
  className?: string;
  /** The `<table>` element. */
  ref?: Ref<HTMLTableElement>;
  /** `Table.Header` and `Table.Body`. */
  children: ReactNode;
}

/**
 * A plain `<table>` with pulp's density and tokens. It holds no state and calls
 * no hook, so it renders on the server: a page of rows costs no JavaScript and
 * no client boundary. Compose with `Table.Header`, `Table.Column`, `Table.Body`,
 * `Table.Row` and `Table.Cell`. For rows the reader sorts or selects, `DataGrid`
 * is the same shape on React Aria's grid (decision record 008).
 *
 * @status experimental
 * @category Data
 * @accessibility A real `<table>` with `<caption>`, `<thead>` and `<th scope>`, so a screen reader announces the column and row a cell belongs to. Every table is named: `caption` is required, and `captionHidden` keeps the name without showing it. Mark the column that identifies the row with `rowHeader` on its cell. Nothing here is focusable — if a cell needs a control, put a Button or a Link inside it.
 * @do Use it for data that is only read; it is the cheaper and more robust of the two.
 * Give every column a `Table.Column`, so each cell has a header to be announced with.
 * @dont Reach for `DataGrid` unless rows are sortable or selectable; it ships React Aria and renders on the client.
 * Use a table for layout.
 */
export function Table({ caption, captionHidden = false, density = 'default', className, ref, children, ...rest }: TableProps) {
  return (
    <div className={classes(styles.container, className)}>
      <table {...rest} ref={ref} className={styles.table} data-density={density}>
        <caption className={classes(styles.caption, captionHidden && styles.captionHidden)}>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
  /** A single `Table.Row` of `Table.Column`s. */
  children: ReactNode;
}

function TableHeader({ className, ref, children, ...rest }: TableHeaderProps) {
  return (
    <thead {...rest} ref={ref} className={classes(styles.header, className)}>
      {children}
    </thead>
  );
}

export interface TableColumnProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** `end` right-aligns the column's header. Set the same `align` on its cells. @default 'start' */
  align?: TableAlign;
  ref?: Ref<HTMLTableCellElement>;
  children: ReactNode;
}

function TableColumn({ align = 'start', className, ref, children, ...rest }: TableColumnProps) {
  return (
    <th {...rest} ref={ref} scope="col" className={classes(styles.column, className)} data-align={align}>
      {children}
    </th>
  );
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Shown in place of the rows when there are none. */
  emptyMessage?: ReactNode;
  /** How many columns the empty message spans. Give it the number of `Table.Column`s. */
  columnCount?: number;
  ref?: Ref<HTMLTableSectionElement>;
  children?: ReactNode;
}

function TableBody({ emptyMessage, columnCount, className, ref, children, ...rest }: TableBodyProps) {
  // An empty array, `false` from a guard, or nothing at all all mean "no rows".
  const empty = children == null || children === false || (Array.isArray(children) && children.flat().filter(Boolean).length === 0);
  return (
    <tbody {...rest} ref={ref} className={classes(styles.body, className)}>
      {empty && emptyMessage != null ? (
        <tr>
          <td className={styles.empty} colSpan={columnCount}>
            {emptyMessage}
          </td>
        </tr>
      ) : (
        children
      )}
    </tbody>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
  children: ReactNode;
}

function TableRow({ className, ref, children, ...rest }: TableRowProps) {
  return (
    <tr {...rest} ref={ref} className={classes(styles.row, className)}>
      {children}
    </tr>
  );
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** `end` right-aligns the cell and uses tabular numerals. @default 'start' */
  align?: TableAlign;
  /** Makes this cell the row's header (`th scope="row"`): the column that says which row it is. @default false */
  rowHeader?: boolean;
  ref?: Ref<HTMLTableCellElement>;
  children?: ReactNode;
}

function TableCell({ align = 'start', rowHeader = false, className, ref, children, ...rest }: TableCellProps) {
  const shared = { ...rest, className: classes(styles.cell, className), 'data-align': align };
  // Two returns rather than a dynamic tag: `th | td` as one element type costs
  // the declaration build more memory than it is worth.
  if (rowHeader) {
    return (
      <th {...shared} ref={ref} scope="row">
        {children}
      </th>
    );
  }
  return (
    <td {...shared} ref={ref}>
      {children}
    </td>
  );
}

Table.displayName = 'Table';
TableHeader.displayName = 'Table.Header';
TableColumn.displayName = 'Table.Column';
TableBody.displayName = 'Table.Body';
TableRow.displayName = 'Table.Row';
TableCell.displayName = 'Table.Cell';

Table.Header = TableHeader;
Table.Column = TableColumn;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
