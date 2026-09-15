import type { ReactNode, Ref, SelectHTMLAttributes } from 'react';
import { Field } from '../field';
import { classes } from '../internal/classes';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visible label. Always rendered. */
  label: ReactNode;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** @default 'md' */
  size?: SelectSize;
  /** An empty first option shown until a value is chosen. */
  placeholder?: string;
  /** The `<select>` element. */
  ref?: Ref<HTMLSelectElement>;
  /** Applied to the wrapper, not the select. */
  className?: string;
  /** `<option>` and `<optgroup>` elements. */
  children: ReactNode;
}

/**
 * A native `<select>` on top of Field: the browser's own popup, keyboard and
 * assistive-technology support, with the closed control drawn from
 * `--select-*` tokens. For rich options or multi-select, a listbox component
 * comes later on a headless layer; this one stays native on purpose.
 *
 * @status stable
 * @accessibility A native `select` on top of Field: the browser's own popup, keyboard and screen-reader behaviour; the placeholder is a disabled empty option when `required`.
 * @do Use it for a plain list of words; it is the most robust choice on every platform.
 * @dont Use it for options that need a description or an icon; use Picker.
 */
export function Select({
  label,
  description,
  error,
  size = 'md',
  placeholder,
  required,
  disabled,
  id,
  className,
  ref,
  children,
  'aria-describedby': describedBy,
  ...rest
}: SelectProps) {
  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  return (
    <Field
      id={id}
      invalid={invalid}
      disabled={Boolean(disabled)}
      required={Boolean(required)}
      className={classes(styles.field, className)}
      data-size={size}
    >
      <Field.Label>{label}</Field.Label>
      <span className={styles.control}>
        <Field.Control aria-describedby={describedBy}>
          <select {...rest} ref={ref} className={styles.select}>
            {placeholder !== undefined && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {children}
          </select>
        </Field.Control>
      </span>
      {description && <Field.Description>{description}</Field.Description>}
      {invalid && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}

Select.displayName = 'Select';
