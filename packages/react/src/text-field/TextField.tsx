import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './TextField.module.css';

export type TextFieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Always rendered: a placeholder is not a label. */
  label: ReactNode;
  /** Help text under the field, exposed as the input's accessible description. */
  description?: ReactNode;
  /**
   * Error message. Its presence marks the input invalid (`aria-invalid`,
   * `data-invalid`) and the message is announced as an alert.
   */
  error?: ReactNode;
  /** @default 'md' */
  size?: TextFieldSize;
  /** The `<input>` element. */
  ref?: Ref<HTMLInputElement>;
  /** Applied to the wrapper, not the input. */
  className?: string;
}

/**
 * A single-line text input with its label, description and error wired for
 * assistive technology. Controlled and uncontrolled behave exactly like the
 * native input (`value`/`onChange` or `defaultValue`). Every value comes from
 * `--text-field-*` tokens; state is exposed as `data-size`, `data-invalid`,
 * `data-disabled` and `data-readonly` on the wrapper.
 */
export function TextField({
  label,
  description,
  error,
  size = 'md',
  required,
  disabled,
  readOnly,
  id,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = invalid ? `${inputId}-error` : undefined;
  const describedIds = [describedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={classes(styles.field, className)}
      data-size={size}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
    >
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        className={styles.input}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        aria-describedby={describedIds}
      />
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      {invalid && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

TextField.displayName = 'TextField';
