import type { ReactNode, Ref } from 'react';
import { ListBox as AriaListBox } from 'react-aria-components';
import { selectionToIds } from '../internal/selection';
import { listClass, renderEmpty, renderOption, type ListboxItem } from './ListboxOptions';

export type ListboxSelectionMode = 'single' | 'multiple';

export interface ListboxProps {
  /** The options, in order. Ids are the values. */
  items: readonly ListboxItem[];
  /** @default 'single' */
  selectionMode?: ListboxSelectionMode;
  /** Selected ids (controlled). An array in both modes; single mode holds at most one. */
  value?: readonly string[];
  /** @default [] */
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
  /** @default false */
  disabled?: boolean;
  /** Shown when `items` is empty. @default 'No options' */
  emptyMessage?: ReactNode;
  /** The list's accessible name. Pass `aria-labelledby` instead when a visible heading names it. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  id?: string;
  className?: string;
  /** The list element (`role="listbox"`). */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A visible list of options with single or multiple selection, on React
 * Aria's listbox (decision record 001): arrow keys move, Space toggles,
 * typing jumps, Shift and Ctrl/Cmd extend a multiple selection, Ctrl/Cmd+A
 * selects all. For a list that opens from a control, use Picker; for one
 * that filters as you type, use Combobox. Both render these options.
 */
export function Listbox({
  items,
  selectionMode = 'single',
  value,
  defaultValue = [],
  onChange,
  disabled = false,
  emptyMessage = 'No options',
  className,
  ref,
  ...rest
}: ListboxProps) {
  return (
    <AriaListBox
      {...rest}
      ref={ref}
      className={listClass(className)}
      items={items}
      selectionMode={selectionMode}
      selectedKeys={value}
      defaultSelectedKeys={defaultValue}
      onSelectionChange={(selection) => onChange?.(selectionToIds(selection, () => items.filter((item) => !item.disabled).map((item) => item.id)))}
      disabledKeys={disabled ? items.map((item) => item.id) : undefined}
      data-disabled={disabled ? '' : undefined}
      data-selection-mode={selectionMode}
      renderEmptyState={() => renderEmpty(emptyMessage)}
    >
      {renderOption}
    </AriaListBox>
  );
}

Listbox.displayName = 'Listbox';
