import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactElement, type ReactNode, type Ref } from 'react';
import {
  Cell as AriaCell,
  Checkbox as AriaCheckbox,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  useTableOptions,
  type Key,
  type SortDescriptor,
} from 'react-aria-components';
import { classes } from '../internal/classes';
import { VisuallyHidden } from '../visually-hidden';
import { selectionToIds } from '../internal/selection';
import styles from './Table.module.css';

export type TableSelectionMode = 'none' | 'single' | 'multiple';
export type TableDensity = 'default' | 'compact';
export type TableSortDirection = 'ascending' | 'descending';
export interface TableSort {
  column: string;
  direction: TableSortDirection;
}

/** Rows register their ids so `'all'` (Ctrl/Cmd+A) resolves to an array without a second source of truth. */
const RowIdsContext = createContext<{ add: (id: Key) => () => void; all: () => Key[] } | null>(null);

export interface TableProps {
  /** The table's accessible name. Pass `aria-labelledby` instead when a visible heading names it. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** @default 'none' */
  selectionMode?: TableSelectionMode;
  /** Selected row ids (controlled). */
  selected?: readonly string[];
  /** @default [] */
  defaultSelected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Rows that cannot be selected or activated. */
  disabledIds?: readonly string[];
  /** Current sort (controlled). Sorting the data is the caller's job: this is the header state. */
  sort?: TableSort | null;
  defaultSort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** Row padding steps down one token. The brand's `space.unit` sets the base. @default 'default' */
  density?: TableDensity;
  /** The header stays visible while the container scrolls. Give the container a height through `className`. @default false */
  stickyHeader?: boolean;
  /**
   * Called with the row id on Enter, on click, and on double click. Once
   * rows are selectable and a selection exists, Enter and click toggle the
   * selection instead (the vendor's rule, so touch users select without a
   * modifier key); double click still runs the action.
   */
  onRowAction?: (id: string) => void;
  /** Applied to the scroll container around the table. */
  className?: string;
  /** The `<table>` element. */
  ref?: Ref<HTMLTableElement>;
  /** `Table.Header` then `Table.Body`. */
  children: ReactNode;
}

/**
 * A data table on React Aria's grid (decision record 001): one Tab stop,
 * arrows move between rows and cells, Space toggles selection, Enter runs
 * the row action (see `onRowAction` for the selection rule), sortable
 * headers carry `aria-sort` and are pressed to change direction. Selection and sort are the caller's state; the table
 * reports changes and renders them. Compose with `Table.Header`,
 * `Table.Column`, `Table.Body`, `Table.Row` and `Table.Cell`; the selection
 * column appears by itself when rows are selectable.
 *
 * @status experimental
 * @category Data
 * @accessibility `role="grid"` named by `aria-label` or `aria-labelledby`; one column is the row header (`isRowHeader`), sortable columns carry `aria-sort`, selectable rows `aria-selected`, and the selection column holds real checkboxes ("Select All" in the header). One tab stop: arrows move between rows and cells, Space toggles selection, Enter runs the row action, the header cells are pressed to sort.
 * @do Mark exactly one column `isRowHeader`.
 * Give the table a name that says what the rows are.
 * @dont Sort the data inside the table; sort your data from `onSortChange` and pass it back.
 * Use it for layout.
 */
export function Table({
  selectionMode = 'none',
  selected,
  defaultSelected = [],
  onSelectedChange,
  disabledIds,
  sort,
  defaultSort,
  onSortChange,
  density = 'default',
  stickyHeader = false,
  onRowAction,
  className,
  ref,
  children,
  ...rest
}: TableProps) {
  const ids = useRef(new Set<Key>());
  const add = useCallback((id: Key) => {
    ids.current.add(id);
    return () => {
      ids.current.delete(id);
    };
  }, []);
  const all = useCallback(() => Array.from(ids.current), []);
  // The vendor has no default for the sort descriptor; hold it here when uncontrolled.
  const [uncontrolledSort, setUncontrolledSort] = useState<TableSort | undefined>(defaultSort);
  const currentSort = sort === undefined ? uncontrolledSort : (sort ?? undefined);

  return (
    <RowIdsContext.Provider value={{ add, all }}>
      <div className={classes(styles.container, className)} data-sticky-header={stickyHeader ? '' : undefined}>
        <AriaTable
          {...rest}
          ref={ref as Ref<HTMLDivElement | HTMLTableElement>}
          className={styles.table}
          data-density={density}
          selectionMode={selectionMode}
          selectedKeys={selected}
          defaultSelectedKeys={defaultSelected}
          onSelectionChange={(selection) => onSelectedChange?.(selectionToIds(selection, all))}
          disabledKeys={disabledIds}
          sortDescriptor={currentSort as SortDescriptor | undefined}
          onSortChange={(descriptor) => {
            const next = { column: String(descriptor.column), direction: descriptor.direction };
            if (sort === undefined) setUncontrolledSort(next);
            onSortChange?.(next);
          }}
          onRowAction={onRowAction && ((key) => onRowAction(String(key)))}
        >
          {children}
        </AriaTable>
      </div>
    </RowIdsContext.Provider>
  );
}

interface TableHeaderProps {
  className?: string;
  /** `Table.Column` elements. */
  children: ReactNode;
}

function TableHeader({ className, children }: TableHeaderProps) {
  const { selectionMode, selectionBehavior } = useTableOptions();
  return (
    <AriaTableHeader className={classes(styles.header, className)}>
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        <AriaColumn className={classes(styles.column, styles.selectColumn)}>
          {selectionMode === 'multiple' ? <SelectionCheckbox /> : <VisuallyHidden>Selection</VisuallyHidden>}
        </AriaColumn>
      )}
      {children}
    </AriaTableHeader>
  );
}

export type TableAlign = 'start' | 'end';

interface TableColumnProps {
  /** The column id `sort.column` refers to. Defaults to the column's text. */
  id?: string;
  /** Pressing the header sorts by it; the table reports the change through `onSortChange`. @default false */
  allowsSorting?: boolean;
  /** This column names the row for assistive technology. Exactly one column per table. @default false */
  isRowHeader?: boolean;
  /** @default 'start' */
  align?: TableAlign;
  className?: string;
  children: ReactNode;
}

function TableColumn({ id, allowsSorting = false, isRowHeader = false, align = 'start', className, children }: TableColumnProps) {
  return (
    <AriaColumn id={id} allowsSorting={allowsSorting} isRowHeader={isRowHeader} className={classes(styles.column, className)} data-align={align}>
      {children}
    </AriaColumn>
  );
}

interface TableBodyProps<T extends { id: string }> {
  /** Rows from data: each item renders through the `children` function, keyed by `item.id`. */
  items?: Iterable<T>;
  /** Shown when there are no rows. @default 'No rows' */
  emptyMessage?: ReactNode;
  className?: string;
  /** `Table.Row` elements, or a function from an item to one when `items` is given. */
  children: ReactNode | ((item: T) => ReactElement);
}

function TableBody<T extends { id: string }>({ items, emptyMessage = 'No rows', className, children }: TableBodyProps<T>) {
  return (
    <AriaTableBody items={items} className={classes(styles.body, className)} renderEmptyState={() => <div className={styles.empty}>{emptyMessage}</div>}>
      {children}
    </AriaTableBody>
  );
}

interface TableRowProps {
  /** The row id used for selection, sorting callbacks and `onRowAction`. Required unless the row comes from `items`. */
  id?: string;
  className?: string;
  /** `Table.Cell` elements. */
  children: ReactNode;
}

function TableRow({ id, className, children }: TableRowProps) {
  const { selectionBehavior } = useTableOptions();
  const registry = useContext(RowIdsContext);
  useEffect(() => (id !== undefined && registry ? registry.add(id) : undefined), [id, registry]);
  return (
    <AriaRow id={id} className={classes(styles.row, className)}>
      {selectionBehavior === 'toggle' && (
        <AriaCell className={classes(styles.cell, styles.selectCell)}>
          <SelectionCheckbox />
        </AriaCell>
      )}
      {children}
    </AriaRow>
  );
}

interface TableCellProps {
  /** @default 'start' */
  align?: TableAlign;
  className?: string;
  children: ReactNode;
}

function TableCell({ align = 'start', className, children }: TableCellProps) {
  return (
    <AriaCell className={classes(styles.cell, className)} data-align={align}>
      {children}
    </AriaCell>
  );
}

/** React Aria's checkbox wired to the row (or all rows) through `slot="selection"`; drawn from the table's tokens. */
function SelectionCheckbox() {
  return (
    <AriaCheckbox slot="selection" className={styles.select}>
      <span className={styles.selectBox} aria-hidden="true" />
    </AriaCheckbox>
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
