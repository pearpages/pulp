import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { ToggleField, type ToggleSize } from '../internal/ToggleField';
import styles from './Switch.module.css';

export type SwitchSize = ToggleSize;

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Visible label beside the switch. */
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** @default 'md' */
  size?: SwitchSize;
  /** The `<input>` element. */
  ref?: Ref<HTMLInputElement>;
  /** Applied to the wrapper, not the input. */
  className?: string;
}

/**
 * An on/off control: a native checkbox with `role="switch"`, so assistive
 * technology announces on and off, and the browser handles keyboard, forms
 * and state. Use it for settings that take effect immediately; use Checkbox
 * for choices submitted with a form. Drawn with `--switch-*` tokens.
 *
 * @status stable
 * @category Forms
 * @accessibility A native checkbox with `role="switch"`, so on and off are announced; Space toggles; label, description and error wire through Field.
 * @do Use it for settings that apply immediately.
 * @dont Use it inside a form that needs a submit; use Checkbox.
 */
export function Switch({
  label,
  description,
  error,
  size = 'md',
  required,
  disabled,
  id,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: SwitchProps) {
  return (
    <ToggleField
      label={label}
      description={description}
      error={error}
      size={size}
      required={required}
      disabled={disabled}
      id={id}
      className={className}
      rootClassName={styles.switch}
      rowClassName={styles.row}
      aria-describedby={describedBy}
      control={<input {...rest} ref={ref} type="checkbox" role="switch" className={styles.input} />}
    />
  );
}

Switch.displayName = 'Switch';
