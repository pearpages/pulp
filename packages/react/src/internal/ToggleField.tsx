import type { ReactNode } from 'react';
import { Field } from '../field';
import { classes } from './classes';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleFieldProps {
  /** Visible inline label. */
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  size: ToggleSize;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  /** The Field root class of the concrete control (checkbox, switch). */
  rootClassName: string | undefined;
  /** The class of the row holding the control and its label. */
  rowClassName: string | undefined;
  /** The single `<input>` element; Field.Control wires it. */
  control: ReactNode;
  'aria-describedby'?: string;
}

/** Field wiring for a control whose label sits beside it: Checkbox, Switch. */
export function ToggleField({
  label,
  description,
  error,
  size,
  disabled,
  required,
  id,
  className,
  rootClassName,
  rowClassName,
  control,
  'aria-describedby': describedBy,
}: ToggleFieldProps) {
  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  return (
    <Field
      id={id}
      invalid={invalid}
      disabled={Boolean(disabled)}
      required={Boolean(required)}
      className={classes(rootClassName, className)}
      data-size={size}
    >
      <div className={rowClassName}>
        <Field.Control aria-describedby={describedBy}>{control}</Field.Control>
        <Field.Label>{label}</Field.Label>
      </div>
      {description && <Field.Description>{description}</Field.Description>}
      {invalid && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}
