import type { HTMLAttributes, Ref } from 'react';
import { classes } from '../internal/classes';
import { VisuallyHidden } from '../visually-hidden';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'inherit';
export type SpinnerTone = 'default' | 'inherit';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** `inherit` follows the surrounding font size, for spinners inside controls. @default 'md' */
  size?: SpinnerSize;
  /** `inherit` draws with the surrounding text colour, for coloured controls. @default 'default' */
  tone?: SpinnerTone;
  /** Announced to assistive technology (`role="status"`). @default 'Loading' */
  label?: string;
  /** Hide from assistive technology: the parent already announces busy. @default false */
  decorative?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * An indeterminate progress indicator. Announces its label as a status
 * unless `decorative`, in which case the parent is responsible (Button sets
 * `aria-busy`). Under reduced motion the ring stops but keeps its coloured
 * quarter, so it still reads as "in progress".
 */
export function Spinner({ size = 'md', tone = 'default', label = 'Loading', decorative = false, className, ref, ...rest }: SpinnerProps) {
  return (
    <span
      {...rest}
      ref={ref}
      className={classes(styles.spinner, className)}
      data-size={size}
      data-tone={tone}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
    >
      <span className={styles.ring} aria-hidden="true" />
      {!decorative && <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  );
}

Spinner.displayName = 'Spinner';
