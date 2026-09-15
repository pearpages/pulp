import type { ReactNode, Ref } from 'react';
import { Button as AriaButton, ListBox as AriaListBox, Popover as AriaPopover, Select as AriaSelect, SelectValue as AriaSelectValue } from 'react-aria-components';
import { ChevronDown } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import { AriaFieldDescription, AriaFieldError, AriaFieldLabel, ariaFieldClass, isPresent } from '../internal/AriaField';
import { listClass, renderEmpty, renderOption, type ListboxItem } from '../listbox/ListboxOptions';
import styles from './Picker.module.css';

export type PickerItem = ListboxItem;
export type PickerSize = 'sm' | 'md' | 'lg';

export interface PickerProps {
  /** Visible label. Always rendered. */
  label: ReactNode;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** The options. Ids are the values. */
  items: readonly PickerItem[];
  /** Selected id (controlled). `null` is "nothing selected". */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Shown in the control until a value is chosen. @default 'Select…' */
  placeholder?: string;
  /** Shown when `items` is empty. @default 'No options' */
  emptyMessage?: ReactNode;
  /** @default 'md' */
  size?: PickerSize;
  /** @default false */
  required?: boolean;
  /** @default false */
  disabled?: boolean;
  /** Submitted with a form through a hidden native select. */
  name?: string;
  autoFocus?: boolean;
  /** Applied to the field wrapper, not the button. */
  className?: string;
  /** The trigger `<button>`. */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A single-choice select with rich options (a description line, consistent
 * styling in every browser), on React Aria's select (decision record 001):
 * a button opens a listbox, arrows and typing move, Enter chooses, Escape
 * closes, and a hidden native select carries the value in forms. For a
 * plain list of words, the native `Select` is the default; for several
 * choices at once, use Listbox.
 *
 * @status experimental
 * @category Forms
 * @accessibility A `button` named by the label with `aria-haspopup="listbox"` and `aria-expanded`; the popup is a `listbox` with selected and disabled options; a hidden native select carries `name` and value for forms. Arrows open and move, typing jumps, Enter chooses, Escape closes and returns focus.
 * @do Use a `description` line on options when the label alone is ambiguous.
 * Prefer the native Select for a plain list of words.
 * @dont Use `placeholder` as the only label.
 */
export function Picker({
  label,
  description,
  error,
  items,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select…',
  emptyMessage = 'No options',
  size = 'md',
  required = false,
  disabled = false,
  name,
  autoFocus,
  className,
  ref,
}: PickerProps) {
  const invalid = isPresent(error);
  return (
    <AriaSelect
      className={ariaFieldClass(styles.root, className)}
      data-size={size}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onChange?.(key === null ? null : String(key))}
      placeholder={placeholder}
      isRequired={required}
      isDisabled={disabled}
      isInvalid={invalid}
      name={name}
      autoFocus={autoFocus}
    >
      <AriaFieldLabel required={required}>{label}</AriaFieldLabel>
      <AriaButton ref={ref} className={styles.trigger}>
        <AriaSelectValue className={styles.value} />
        <Icon size="inherit" className={styles.chevron}>
          <ChevronDown />
        </Icon>
      </AriaButton>
      <AriaFieldDescription>{description}</AriaFieldDescription>
      <AriaFieldError>{error}</AriaFieldError>
      <AriaPopover className={styles.popover} placement="bottom start">
        <AriaListBox className={listClass(styles.list)} items={items} renderEmptyState={() => renderEmpty(emptyMessage)}>
          {renderOption}
        </AriaListBox>
      </AriaPopover>
    </AriaSelect>
  );
}

Picker.displayName = 'Picker';
