import { useCallback, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { ToggleField, type ToggleSize } from '../internal/ToggleField';
import styles from './Checkbox.module.css';

export type CheckboxSize = ToggleSize;

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Visible label beside the box. */
  label: ReactNode;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** @default 'md' */
  size?: CheckboxSize;
  /** The "some selected" state; visual and `aria-checked="mixed"`, independent of `checked`. @default false */
  indeterminate?: boolean;
  /** The `<input>` element. */
  ref?: Ref<HTMLInputElement>;
  /** Applied to the wrapper, not the input. */
  className?: string;
}

/**
 * A native checkbox drawn with tokens: `appearance: none` on the input, the
 * box and tick in CSS, so keyboard, forms and assistive technology are the
 * browser's own. Label, description and error come from Field. Controlled and
 * uncontrolled behave like the native input. State is the native `:checked`
 * and `:indeterminate`, plus `data-indeterminate` on the input.
 *
 * @status stable
 * @category Forms
 * @accessibility A native `input type="checkbox"` with `appearance: none`; label, description and error wire through Field. `indeterminate` sets the DOM property and `aria-checked="mixed"`. Keyboard: Space toggles.
 * @do Use `indeterminate` for a parent whose children are partly selected.
 * Group related checkboxes under a `fieldset`.
 * @dont Use it for an immediate setting; use Switch.
 * Hide the label; the description does not name the control.
 */
export function Checkbox({
  label,
  description,
  error,
  size = 'md',
  indeterminate = false,
  required,
  disabled,
  id,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: CheckboxProps) {
  // `indeterminate` is a property, not an attribute: set it on the element as it mounts and whenever it changes.
  const setRef = useCallback(
    (element: HTMLInputElement | null) => {
      if (element) element.indeterminate = indeterminate;
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    },
    [indeterminate, ref],
  );

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
      rootClassName={styles.checkbox}
      rowClassName={styles.row}
      aria-describedby={describedBy}
      control={
        <input
          {...rest}
          ref={setRef}
          type="checkbox"
          className={styles.input}
          aria-checked={indeterminate ? 'mixed' : undefined}
          data-indeterminate={indeterminate ? '' : undefined}
        />
      }
    />
  );
}

Checkbox.displayName = 'Checkbox';
