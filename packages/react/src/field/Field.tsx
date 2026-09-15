import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './Field.module.css';

type Part = 'description' | 'error';

export interface FieldContextValue {
  /** The control's id; the label points at it. */
  id: string;
  /** The label's id, for controls that are labelled by reference (`aria-labelledby`), such as a radio group. */
  labelId: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  /** ids of the description and error that are actually mounted, space separated. */
  describedBy: string | undefined;
  /** Registers a mounted part; returns the unregister function. */
  register: (part: Part) => () => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

/** The field's ids and state, for controls that wire themselves instead of using `Field.Control`. */
export function useField(): FieldContextValue {
  const context = useContext(FieldContext);
  if (!context) throw new Error('useField must be used inside <Field>');
  return context;
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** The control's id. Generated when omitted. */
  id?: string;
  /** @default false */
  invalid?: boolean;
  /** @default false */
  disabled?: boolean;
  /** @default false */
  required?: boolean;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * The wiring every form control shares: a label pointing at the control, a
 * description and an error exposed through `aria-describedby`, and invalid,
 * disabled and required state in one place. Only parts that are mounted end
 * up in `aria-describedby`, so no id ever dangles. Compose with
 * `Field.Label`, `Field.Control`, `Field.Description` and `Field.Error`
 * (one of each); state on the DOM as `data-invalid`, `data-disabled`,
 * `data-required`.
 *
 * Known limitation: parts register in a layout effect, so server-rendered
 * HTML carries no `aria-describedby` until hydration. The relationship is
 * complete for every interactive use; static HTML consumers should not rely
 * on it yet.
 *
 * @status stable
 * @category Forms
 * @accessibility Wires `label[for]`, `aria-describedby` (only mounted parts), `aria-invalid`, `aria-required` and `disabled` onto the control. Server-rendered HTML has no `aria-describedby` until hydration (a test pins the gap).
 * @do Use `Field.Label as="span"` with `useField().labelId` for groups that cannot be labelled by `for`.
 * @dont Mount two `Field.Description` or two `Field.Error`; ids would collide (development warns).
 */
export function Field({ id, invalid = false, disabled = false, required = false, className, ref, children, ...rest }: FieldProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  // Counts, not booleans: a second instance of a part is a bug (duplicate ids)
  // and is reported in development instead of silently colliding.
  const [parts, setParts] = useState<Record<Part, number>>({ description: 0, error: 0 });

  const register = useCallback((part: Part) => {
    setParts((current) => {
      const next = current[part] + 1;
      if (DEV && next === 2) console.warn(`Field: more than one Field.${part === 'error' ? 'Error' : 'Description'} is mounted; their ids collide.`);
      return { ...current, [part]: next };
    });
    return () => setParts((current) => ({ ...current, [part]: Math.max(0, current[part] - 1) }));
  }, []);

  const describedBy =
    [parts.description > 0 && `${controlId}-description`, parts.error > 0 && `${controlId}-error`].filter(Boolean).join(' ') ||
    undefined;

  return (
    <FieldContext.Provider value={{ id: controlId, labelId: `${controlId}-label`, invalid, disabled, required, describedBy, register }}>
      <div
        {...rest}
        ref={ref}
        className={classes(styles.field, className)}
        data-invalid={invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-required={required ? '' : undefined}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * `label` points at the control with `for`. `span` is for controls that are
   * not labelable (a radio group, a fieldset): it carries `labelId` and the
   * control references it with `aria-labelledby`.
   * @default 'label'
   */
  as?: 'label' | 'span';
  ref?: Ref<HTMLLabelElement>;
  children: ReactNode;
}

function FieldLabel({ as = 'label', className, ref, children, ...rest }: FieldLabelProps) {
  const field = useField();
  const marker = field.required && (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );
  if (as === 'span') {
    return (
      <span {...rest} id={field.labelId} className={classes(styles.label, className)}>
        {children}
        {marker}
      </span>
    );
  }
  return (
    <label {...rest} ref={ref} htmlFor={field.id} className={classes(styles.label, className)}>
      {children}
      {marker}
    </label>
  );
}

interface FieldControlProps {
  /** Extra ids to describe the control by, kept alongside the field's own. */
  'aria-describedby'?: string;
  /** The single control element; the field's wiring is merged into it. */
  children: ReactNode;
}

function FieldControl({ 'aria-describedby': extra, children }: FieldControlProps) {
  const field = useField();
  return renderAsChild('Field.Control', children, {
    id: field.id,
    'aria-describedby': [extra, field.describedBy].filter(Boolean).join(' ') || undefined,
    'aria-invalid': field.invalid || undefined,
    disabled: field.disabled || undefined,
    required: field.required || undefined,
  });
}

interface FieldTextProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
}

function FieldDescription({ className, ref, children, ...rest }: FieldTextProps) {
  const field = useField();
  const { register } = field;
  useLayoutEffect(() => register('description'), [register]);
  return (
    <p {...rest} ref={ref} id={`${field.id}-description`} className={classes(styles.description, className)}>
      {children}
    </p>
  );
}

function FieldError({ className, ref, children, ...rest }: FieldTextProps) {
  const field = useField();
  const { register } = field;
  useLayoutEffect(() => register('error'), [register]);
  return (
    <p {...rest} ref={ref} id={`${field.id}-error`} role="alert" className={classes(styles.error, className)}>
      {children}
    </p>
  );
}

Field.displayName = 'Field';
FieldLabel.displayName = 'Field.Label';
FieldControl.displayName = 'Field.Control';
FieldDescription.displayName = 'Field.Description';
FieldError.displayName = 'Field.Error';

Field.Label = FieldLabel;
Field.Control = FieldControl;
Field.Description = FieldDescription;
Field.Error = FieldError;
