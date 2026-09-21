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
import styles from './DataGrid.module.css';

export type DataGridSelectionMode = 'none' | 'single' | 'multiple';
export type DataGridDensity = 'default' | 'compact';
export type DataGridSortDirection = 'ascending' | 'descending';
export interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}

/** Rows register their ids so `'all'` (Ctrl/Cmd+A) resolves to an array without a second source of truth. */
const RowIdsContext = createContext<{ add: (id: Key) => () => void; all: () => Key[] } | null>(null);

export interface DataGridProps {
  /** The table's accessible name. Pass `aria-labelledby` instead when a visible heading names it. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** @default 'none' */
  selectionMode?: DataGridSelectionMode;
  /** Selected row ids (controlled). */
  selected?: readonly string[];
  /** @default [] */
  defaultSelected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Rows that cannot be selected or activated. */
  disabledIds?: readonly string[];
  /** Current sort (controlled). Sorting the data is the caller's job: this is the header state. */
  sort?: DataGridSort | null;
  defaultSort?: DataGridSort;
  onSortChange?: (sort: DataGridSort) => void;
  /** Row padding steps down one token. The brand's `space.unit` sets the base. @default 'default' */
  density?: DataGridDensity;
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
  /** `DataGrid.Header` then `DataGrid.Body`. */
  children: ReactNode;
}

/**
 * An interactive data grid on React Aria's grid (decision record 001): one Tab stop,
 * arrows move between rows and cells, Space toggles selection, Enter runs
 * the row action (see `onRowAction` for the selection rule), sortable
 * headers carry `aria-sort` and are pressed to change direction. Selection and sort are the caller's state; the table
 * reports changes and renders them. Compose with `DataGrid.Header`,
 * `DataGrid.Column`, `DataGrid.Body`, `DataGrid.Row` and `DataGrid.Cell`; the selection
 * column appears by itself when rows are selectable. For data that is only read,
 * `Table` is the default: a plain `<table>` that renders on the server and costs
 * nothing (decision record 008).
 *
 * @status experimental
 * @category Data
 * @accessibility `role="grid"` named by `aria-label` or `aria-labelledby`; one column is the row header (`isRowHeader`), sortable columns carry `aria-sort`, selectable rows `aria-selected`, and the selection column holds real checkboxes ("Select All" in the header). One tab stop: arrows move between rows and cells, Space toggles selection, Enter runs the row action, the header cells are pressed to sort.
 * @do Mark exactly one column `isRowHeader`.
 * Give the grid a name that says what the rows are.
 * Prefer the plain `Table` when nothing is sortable or selectable; this one ships React Aria and renders on the client.
 * @dont Sort the data inside the table; sort your data from `onSortChange` and pass it back.
 * Use it for layout.
 */
export function DataGrid({
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
}: DataGridProps) {
  const ids = useRef(new Set<Key>());
  const add = useCallback((id: Key) => {
    ids.current.add(id);
    return () => {
      ids.current.delete(id);
    };
  }, []);
  const all = useCallback(() => Array.from(ids.current), []);
  // The vendor has no default for the sort descriptor; hold it here when uncontrolled.
  const [uncontrolledSort, setUncontrolledSort] = useState<DataGridSort | undefined>(defaultSort);
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

interface DataGridHeaderProps {
  className?: string;
  /** `DataGrid.Column` elements. */
  children: ReactNode;
}

function DataGridHeader({ className, children }: DataGridHeaderProps) {
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

export type DataGridAlign = 'start' | 'end';

interface DataGridColumnProps {
  /** The column id `sort.column` refers to. Defaults to the column's text. */
  id?: string;
  /** Pressing the header sorts by it; the table reports the change through `onSortChange`. @default false */
  allowsSorting?: boolean;
  /** This column names the row for assistive technology. Exactly one column per table. @default false */
  isRowHeader?: boolean;
  /** @default 'start' */
  align?: DataGridAlign;
  className?: string;
  children: ReactNode;
}

function DataGridColumn({ id, allowsSorting = false, isRowHeader = false, align = 'start', className, children }: DataGridColumnProps) {
  return (
    <AriaColumn id={id} allowsSorting={allowsSorting} isRowHeader={isRowHeader} className={classes(styles.column, className)} data-align={align}>
      {children}
    </AriaColumn>
  );
}

interface DataGridBodyProps<T extends { id: string }> {
  /** Rows from data: each item renders through the `children` function, keyed by `item.id`. */
  items?: Iterable<T>;
  /** Shown when there are no rows. @default 'No rows' */
  emptyMessage?: ReactNode;
  className?: string;
  /** `DataGrid.Row` elements, or a function from an item to one when `items` is given. */
  children: ReactNode | ((item: T) => ReactElement);
}

function DataGridBody<T extends { id: string }>({ items, emptyMessage = 'No rows', className, children }: DataGridBodyProps<T>) {
  return (
    <AriaTableBody items={items} className={classes(styles.body, className)} renderEmptyState={() => <div className={styles.empty}>{emptyMessage}</div>}>
      {children}
    </AriaTableBody>
  );
}

interface DataGridRowProps {
  /** The row id used for selection, sorting callbacks and `onRowAction`. Required unless the row comes from `items`. */
  id?: string;
  className?: string;
  /** `DataGrid.Cell` elements. */
  children: ReactNode;
}

function DataGridRow({ id, className, children }: DataGridRowProps) {
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

interface DataGridCellProps {
  /** @default 'start' */
  align?: DataGridAlign;
  className?: string;
  children: ReactNode;
}

function DataGridCell({ align = 'start', className, children }: DataGridCellProps) {
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

DataGrid.displayName = 'DataGrid';
DataGridHeader.displayName = 'DataGrid.Header';
DataGridColumn.displayName = 'DataGrid.Column';
DataGridBody.displayName = 'DataGrid.Body';
DataGridRow.displayName = 'DataGrid.Row';
DataGridCell.displayName = 'DataGrid.Cell';

DataGrid.Header = DataGridHeader;
DataGrid.Column = DataGridColumn;
DataGrid.Body = DataGridBody;
DataGrid.Row = DataGridRow;
DataGrid.Cell = DataGridCell;
