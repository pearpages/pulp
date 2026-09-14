import type { ReactNode, Ref } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Input as AriaInput,
  ListBox as AriaListBox,
  Popover as AriaPopover,
  useFilter,
} from 'react-aria-components';
import { ChevronDown } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import { AriaFieldDescription, AriaFieldError, AriaFieldLabel, ariaFieldClass, isPresent } from '../internal/AriaField';
import { listClass, renderEmpty, renderOption, type ListboxItem } from '../listbox/ListboxOptions';
import { Spinner } from '../spinner';
import styles from './Combobox.module.css';

export type ComboboxItem = ListboxItem;
export type ComboboxSize = 'sm' | 'md' | 'lg';
/** `contains` and `startsWith` filter `items` as the user types; `none` shows `items` as given (you filtered them, typically after a fetch). */
export type ComboboxFilter = 'contains' | 'startsWith' | 'none';

export interface ComboboxProps {
  /** Visible label. Always rendered. */
  label: ReactNode;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** The options. With `filter="none"` they are shown as given. */
  items: readonly ComboboxItem[];
  /** Selected id (controlled). `null` is "nothing selected". */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** The text in the input (controlled). Pair with `onInputChange` to fetch options as the user types. */
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (text: string) => void;
  /** @default 'contains' */
  filter?: ComboboxFilter;
  /** Keeps the list open with a spinner in the control while options load. @default false */
  loading?: boolean;
  /** Shown in the open list when no option matches. @default 'No results' */
  emptyMessage?: ReactNode;
  /** Announced while `loading`. @default 'Loading…' */
  loadingMessage?: ReactNode;
  /** Let the typed text stand as the value even when it matches no option. @default false */
  allowsCustomValue?: boolean;
  /** When the list opens: on focus, on typing, or only from the button and arrow keys. @default 'input' */
  menuTrigger?: 'focus' | 'input' | 'manual';
  placeholder?: string;
  /** @default 'md' */
  size?: ComboboxSize;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  readOnly?: boolean;
  /** Submitted with a form: the selected id (or the text with `allowsCustomValue`). */
  name?: string;
  autoFocus?: boolean;
  /** Applied to the field wrapper, not the input. */
  className?: string;
  /** The `<input>` element. */
  ref?: Ref<HTMLInputElement>;
}

/**
 * A text input that suggests options as the user types, on React Aria's
 * combobox (decision record 001): the list is announced through
 * `aria-activedescendant`, arrows move, Enter selects, Escape closes and
 * then clears. Static lists filter themselves; for async options, control
 * `inputValue`, fetch, and pass the results with `filter="none"` and
 * `loading` while they arrive. Options look the same as Listbox's.
 */
export function Combobox({
  label,
  description,
  error,
  items,
  value,
  defaultValue,
  onChange,
  inputValue,
  defaultInputValue,
  onInputChange,
  filter = 'contains',
  loading = false,
  emptyMessage = 'No results',
  loadingMessage = 'Loading…',
  allowsCustomValue = false,
  menuTrigger = 'input',
  placeholder,
  size = 'md',
  required = false,
  disabled = false,
  readOnly = false,
  name,
  autoFocus,
  className,
  ref,
}: ComboboxProps) {
  const { contains, startsWith } = useFilter({ sensitivity: 'base' });
  const invalid = isPresent(error);
  // `items` means "already filtered"; `defaultItems` lets React Aria filter.
  const collection = filter === 'none' ? { items } : { defaultItems: items, defaultFilter: filter === 'startsWith' ? startsWith : contains };

  return (
    <AriaComboBox
      {...collection}
      className={ariaFieldClass(styles.root, className)}
      data-size={size}
      data-loading={loading ? '' : undefined}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onChange?.(key === null ? null : String(key))}
      inputValue={inputValue}
      defaultInputValue={defaultInputValue}
      onInputChange={onInputChange}
      allowsCustomValue={allowsCustomValue}
      allowsEmptyCollection
      menuTrigger={menuTrigger}
      isRequired={required}
      isDisabled={disabled}
      isReadOnly={readOnly}
      isInvalid={invalid}
      name={name}
    >
      <AriaFieldLabel required={required}>{label}</AriaFieldLabel>
      <div className={styles.control}>
        <AriaInput ref={ref} className={styles.input} placeholder={placeholder} autoFocus={autoFocus} />
        <AriaButton className={styles.button}>
          {loading ? (
            <Spinner size="inherit" tone="inherit" decorative />
          ) : (
            <Icon size="inherit">
              <ChevronDown />
            </Icon>
          )}
        </AriaButton>
      </div>
      <AriaFieldDescription>{description}</AriaFieldDescription>
      <AriaFieldError>{error}</AriaFieldError>
      <AriaPopover className={styles.popover} placement="bottom start">
        <AriaListBox className={listClass(styles.list)} renderEmptyState={() => renderEmpty(loading ? loadingMessage : emptyMessage)}>
          {renderOption}
        </AriaListBox>
      </AriaPopover>
    </AriaComboBox>
  );
}

Combobox.displayName = 'Combobox';
