import { useRef, useState, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Close, Search } from '@pearpages/pulp-icons';
import { Field } from '../field';
import { mergeRefs } from '../internal/asChild';
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
  /** Keeps the label for assistive technology only. For a search box that a heading or its place in the page already names. @default false */
  hideLabel?: boolean;
  /** A decorative glyph inside the field, before the text. `type="search"` gets the Search glyph unless you pass another (or `null`). */
  iconStart?: ReactNode;
  /**
   * Adds a clear button that appears once the field has a value. Called when it
   * is pressed and when Escape is pressed with a value. Controlled: set your
   * value to `''` here. Uncontrolled: the input is emptied for you.
   */
  onClear?: () => void;
  /** The clear button's name, for other languages. @default 'Clear' */
  clearLabel?: string;
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
 *
 * @status stable
 * @category Forms
 * @accessibility A native text `input` wired through Field: `label[for]`, `aria-describedby` for description and error, `aria-invalid` and `aria-required`. Everything the browser gives a native input (autofill, IME, forms) applies. `hideLabel` hides the label visually, never from assistive technology. The leading icon is decorative. The clear button is a real `button` named by `clearLabel`, after the input in the tab order, present only while there is a value; pressing it (or Escape in the field) empties the field and leaves focus in the input. `type="search"` gives the input the `searchbox` role; wrap the form in `<search>` or `role="search"` yourself when it is the page's search.
 * @do Always pass `label`; use a visible one.
 * Prefer `error` text that says how to fix the value.
 * @do For a search box: `type="search"`, `hideLabel` if a heading names it, and `onClear`.
 * @dont Use `placeholder` as the label.
 * Use it for multi-line text; use Textarea.
 */
export function TextField({
  label,
  description,
  error,
  hideLabel = false,
  iconStart,
  onClear,
  clearLabel = 'Clear',
  size = 'md',
  type,
  value,
  defaultValue,
  onChange,
  onKeyDown,
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
  const inner = useRef<HTMLInputElement>(null);
  // Uncontrolled: remember whether there is text, so the clear button can come and go.
  const [ownHasValue, setOwnHasValue] = useState(defaultValue !== undefined && String(defaultValue) !== '');
  const hasValue = value !== undefined ? String(value) !== '' : ownHasValue;

  const icon = iconStart === undefined && type === 'search' ? <Search /> : iconStart;
  const clearable = onClear !== undefined && hasValue && !disabled && !readOnly;
  const decorated = icon != null || onClear !== undefined;

  const clear = () => {
    if (value === undefined && inner.current) {
      inner.current.value = '';
      setOwnHasValue(false);
    }
    onClear?.();
    inner.current?.focus();
  };

  const input = (
    <Field.Control aria-describedby={describedBy}>
      <input
        {...rest}
        ref={mergeRefs(inner, ref)}
        type={type}
        value={value}
        defaultValue={defaultValue}
        className={classes(styles.input, decorated && styles.inControl)}
        readOnly={readOnly}
        onChange={(event) => {
          onChange?.(event);
          if (value === undefined) setOwnHasValue(event.currentTarget.value !== '');
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.key !== 'Escape' || !clearable) return;
          // Handled here, so a dialog around the field does not also close on this Escape.
          event.preventDefault();
          event.stopPropagation();
          clear();
        }}
      />
    </Field.Control>
  );

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
      <Field.Label className={hideLabel ? styles.hiddenLabel : undefined}>{label}</Field.Label>
      {decorated ? (
        <span className={styles.control} data-icon={icon != null ? '' : undefined} data-clearable={onClear ? '' : undefined}>
          {input}
          {/* After the input in the DOM: they share a grid cell, and the input's background would paint over it. */}
          {icon != null && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          {clearable && (
            <button type="button" className={styles.clear} aria-label={clearLabel} onClick={clear}>
              <Close aria-hidden="true" />
            </button>
          )}
        </span>
      ) : (
        input
      )}
      {description && <Field.Description>{description}</Field.Description>}
      {invalid && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}

TextField.displayName = 'TextField';
