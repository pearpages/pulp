import type { ReactNode } from 'react';
import { FieldError, Label, Text } from 'react-aria-components';
import { classes } from './classes';
import styles from './AriaField.module.css';

/**
 * Label, description and error for controls built on React Aria (decision
 * record 001). React Aria wires `htmlFor`, `aria-labelledby` and
 * `aria-describedby` itself through its contexts, so these are the vendor's
 * parts with pulp's `--field-*` tokens: they look exactly like `Field`'s.
 * `Field` stays the wrapper for native controls, where pulp does the wiring.
 */
export function AriaFieldLabel({ required, children }: { required?: boolean; children: ReactNode }) {
  return (
    <Label className={styles.label}>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export function AriaFieldDescription({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Text slot="description" className={styles.description}>
      {children}
    </Text>
  );
}

/** Rendered by React Aria only while the control is invalid. */
export function AriaFieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <FieldError className={styles.error}>{children}</FieldError>;
}

/** The vertical field layout class, for the vendor root element. */
export const ariaFieldClass = (...extra: Array<string | false | null | undefined>) => classes(styles.field, ...extra);

/** `error` is "present" the way Field defines it: not undefined, null, false or empty. */
export const isPresent = (error: ReactNode): boolean => error !== undefined && error !== null && error !== false && error !== '';
