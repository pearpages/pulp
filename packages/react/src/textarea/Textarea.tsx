import type { ReactNode, Ref, TextareaHTMLAttributes } from 'react';
import { Field } from '../field';
import { classes } from '../internal/classes';
import styles from './Textarea.module.css';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'vertical' | 'none' | 'both';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** The label. Always rendered; `hideLabel` keeps it for assistive technology only. */
  label: ReactNode;
  /** Keeps the label for assistive technology only. For a message box that a heading or its place in the page already names. @default false */
  hideLabel?: boolean;
  description?: ReactNode;
  /** Presence marks the control invalid and announces the message. */
  error?: ReactNode;
  /** @default 'md' */
  size?: TextareaSize;
  /** @default 'vertical' */
  resize?: TextareaResize;
  /** Grow with the content (`field-sizing: content`, where supported). @default false */
  autoGrow?: boolean;
  /** The `<textarea>` element. */
  ref?: Ref<HTMLTextAreaElement>;
  /** Applied to the wrapper, not the textarea. */
  className?: string;
}

/**
 * A multi-line text input on top of Field. Same contract as TextField;
 * its own `--textarea-*` tokens so it can diverge. `rows` sets the initial
 * height; `autoGrow` follows the content in browsers that support
 * `field-sizing`, and falls back to `rows` elsewhere.
 *
 * @status stable
 * @category Forms
 * @accessibility A native `textarea` wired through Field; `autoGrow` uses `field-sizing: content` where supported and falls back to `rows`.
 * @do Set `rows` to the typical length of the answer.
 * @dont Disable `resize` without giving the field enough rows.
 */
export function Textarea({
  label,
  hideLabel = false,
  description,
  error,
  size = 'md',
  resize = 'vertical',
  autoGrow = false,
  rows = 3,
  required,
  disabled,
  readOnly,
  id,
  className,
  ref,
  'aria-describedby': describedBy,
  ...rest
}: TextareaProps) {
  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  return (
    <Field
      id={id}
      invalid={invalid}
      disabled={Boolean(disabled)}
      required={Boolean(required)}
      className={classes(styles.field, className)}
      data-size={size}
      data-resize={resize}
      data-auto-grow={autoGrow ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
    >
      <Field.Label visuallyHidden={hideLabel}>{label}</Field.Label>
      <Field.Control aria-describedby={describedBy}>
        <textarea {...rest} ref={ref} rows={rows} readOnly={readOnly} className={styles.textarea} />
      </Field.Control>
      {description && <Field.Description>{description}</Field.Description>}
      {invalid && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}

Textarea.displayName = 'Textarea';
