import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { Field } from '../field';
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
 * A single-line text input on top of `Field`: label, description and error
 * wired for assistive technology. Controlled and uncontrolled behave exactly
 * like the native input (`value`/`onChange` or `defaultValue`). Every value
 * comes from `--text-field-*` and `--field-*` tokens; state is exposed as
 * `data-size`, `data-invalid`, `data-disabled` and `data-readonly` on the
 * wrapper.
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
  const invalid = error !== undefined && error !== null && error !== false && error !== '';

  return (
    <Field
      id={id}
      invalid={invalid}
      disabled={Boolean(disabled)}
      required={Boolean(required)}
      className={classes(styles.field, className)}
      data-size={size}
      data-readonly={readOnly ? '' : undefined}
    >
      <Field.Label>{label}</Field.Label>
      <Field.Control aria-describedby={describedBy}>
        <input {...rest} ref={ref} className={styles.input} readOnly={readOnly} />
      </Field.Control>
      {description && <Field.Description>{description}</Field.Description>}
      {invalid && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}

TextField.displayName = 'TextField';
