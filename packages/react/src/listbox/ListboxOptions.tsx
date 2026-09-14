import type { ReactNode } from 'react';
import { ListBoxItem as AriaListBoxItem, Text as AriaText } from 'react-aria-components';
import { Check } from '@pearpages/pulp-icons';
import { Icon } from '../icon';
import { classes } from '../internal/classes';
import styles from './Listbox.module.css';

/** One option. `id` is the value; `label` is what the user sees and types against. */
export interface ListboxItem {
  id: string;
  label: string;
  /** A second, muted line under the label. */
  description?: string;
  /** @default false */
  disabled?: boolean;
}

/**
 * The option renderer shared by Listbox, Combobox and Picker, so the three
 * agree on what an option looks like and read the same `--listbox-item-*`
 * tokens. React Aria adds the state (`data-selected`, `data-focused`,
 * `data-disabled`); the tick is always in the DOM and shown by CSS.
 */
export function renderOption(item: ListboxItem) {
  return (
    <AriaListBoxItem id={item.id} textValue={item.label} isDisabled={item.disabled} className={styles.item}>
      <Icon size="inherit" className={styles.check}>
        <Check />
      </Icon>
      <span className={styles.itemBody}>
        <AriaText slot="label" className={styles.itemLabel}>
          {item.label}
        </AriaText>
        {item.description && (
          <AriaText slot="description" className={styles.itemDescription}>
            {item.description}
          </AriaText>
        )}
      </span>
    </AriaListBoxItem>
  );
}

export function renderEmpty(message: ReactNode) {
  return <div className={styles.empty}>{message}</div>;
}

/** The list class, for Combobox and Picker to put the list inside their popovers. */
export const listClass = (...extra: Array<string | false | null | undefined>) => classes(styles.list, ...extra);
