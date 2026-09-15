import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Field, useField } from '../field';
import { classes } from '../internal/classes';
import styles from './Radio.module.css';

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioGroupOrientation = 'vertical' | 'horizontal';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
  size: RadioSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Visible group label. */
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  /** Form field name shared by the radios. Generated when omitted. */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Initially selected value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @default 'vertical' */
  orientation?: RadioGroupOrientation;
  /** @default 'md' */
  size?: RadioSize;
  disabled?: boolean;
  required?: boolean;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * A set of native radios under one label. The group is labelled by
 * reference (`aria-labelledby`) and described through Field, so description
 * and error apply to the whole set. Keyboard is the browser's own: arrows
 * move and select within the group. Controlled or uncontrolled by `value`.
 *
 * @status stable
 * @category Forms
 * @accessibility A `radiogroup` labelled by reference through Field and described by its description and error. Native radios: arrows move and select within the group, Tab leaves it.
 * @do Use it for two to five exclusive options that should all be visible.
 * @dont Preselect a consequential choice; leave the group empty and mark it required.
 */
export function RadioGroup({
  label,
  description,
  error,
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  size = 'md',
  disabled = false,
  required = false,
  id,
  className,
  ref,
  children,
  ...rest
}: RadioGroupProps) {
  const autoName = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : uncontrolled;
  const setValue = useCallback(
    (next: string) => {
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );
  const invalid = error !== undefined && error !== null && error !== false && error !== '';

  return (
    <RadioGroupContext.Provider value={{ name: name ?? autoName, value: current, setValue, size }}>
      <Field id={id} invalid={invalid} disabled={disabled} required={required} className={classes(styles.group, className)} data-size={size}>
        <Field.Label as="span">{label}</Field.Label>
        <RadioGroupItems {...rest} ref={ref} orientation={orientation}>
          {children}
        </RadioGroupItems>
        {description && <Field.Description>{description}</Field.Description>}
        {invalid && <Field.Error>{error}</Field.Error>}
      </Field>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemsProps extends HTMLAttributes<HTMLDivElement> {
  orientation: RadioGroupOrientation;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function RadioGroupItems({ orientation, className, ref, children, ...rest }: RadioGroupItemsProps) {
  const field = useField();
  return (
    <div
      {...rest}
      ref={ref}
      id={field.id}
      role="radiogroup"
      aria-labelledby={field.labelId}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      aria-required={field.required || undefined}
      className={classes(styles.items, className)}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'name' | 'checked' | 'defaultChecked' | 'onChange'> {
  /** The value this radio contributes to the group. */
  value: string;
  /** Visible label beside the radio. */
  label: ReactNode;
  /** The `<input>` element. */
  ref?: Ref<HTMLInputElement>;
  /** Applied to the wrapping label, not the input. */
  className?: string;
}

/** One option of a RadioGroup. Must be rendered inside `RadioGroup`. */
/**
 * One option of a RadioGroup: a native radio with its own visible label.
 *
 * @status stable
 * @category Forms
 * @accessibility A native `input type="radio"` labelled by its visible text; the group semantics, description and error come from RadioGroup.
 * @do Render it only inside RadioGroup.
 * @dont Disable a single radio without saying why in its label or the group description.
 */
export function Radio({ value, label, disabled, className, ref, ...rest }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const field = useField();
  if (!group) throw new Error('Radio must be rendered inside <RadioGroup>');
  const checked = group.value === value;
  return (
    <label className={classes(styles.radio, className)} data-checked={checked ? '' : undefined} data-disabled={disabled || field.disabled ? '' : undefined}>
      <input
        {...rest}
        ref={ref}
        type="radio"
        className={styles.input}
        name={group.name}
        value={value}
        checked={checked}
        onChange={() => group.setValue(value)}
        disabled={disabled || field.disabled}
        required={field.required}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
}

RadioGroup.displayName = 'RadioGroup';
Radio.displayName = 'Radio';
