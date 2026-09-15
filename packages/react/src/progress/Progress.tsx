import { useId, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import { VisuallyHidden } from '../visually-hidden';
import styles from './Progress.module.css';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value; omit for indeterminate. */
  value?: number;
  /** @default 100 */
  max?: number;
  /** Required: what is progressing. Visible unless `hideLabel`. */
  label: ReactNode;
  /** Keep the label for assistive technology only. @default false */
  hideLabel?: boolean;
  /** Human-readable value ("3 of 10 files"); defaults to a percentage. */
  valueText?: string;
  /** @default 'primary' */
  tone?: ProgressTone;
  /** @default 'md' */
  size?: ProgressSize;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A determinate or indeterminate progress bar. The bar is `role="progressbar"`
 * labelled by the visible (or visually hidden) label; the fill width is the
 * one place in the library that carries a per-instance inline value, set as
 * a custom property. Indeterminate motion stops under reduced motion.
 *
 * @status stable
 * @category Feedback
 * @accessibility `role="progressbar"` labelled by the required `label` (visible or visually hidden), with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` when determinate and `aria-valuetext` from `valueText`. Indeterminate bars omit `aria-valuenow`.
 * @do Set `valueText` when the percentage is not the meaningful reading ("3 of 5 files").
 * @dont Use it for an unknown wait shorter than a few seconds; use Spinner.
 */
export function Progress({ value, max = 100, label, hideLabel = false, valueText, tone = 'primary', size = 'md', className, ref, ...rest }: ProgressProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const indeterminate = value === undefined;
  const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const text = indeterminate ? undefined : (valueText ?? `${Math.round(percent)}%`);
  // The single per-instance value the bar needs. A stylesheet cannot enumerate percentages.
  const fill = { '--_value': `${percent}%` } as CSSProperties;

  return (
    <div {...rest} ref={ref} className={classes(styles.progress, className)} data-size={size} data-tone={tone} data-indeterminate={indeterminate ? '' : undefined}>
      <div className={styles.header}>
        {hideLabel ? (
          <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
        ) : (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        )}
        {text && !hideLabel && <span className={styles.value}>{text}</span>}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={text}
        className={styles.track}
      >
        {/* eslint-disable-next-line react/forbid-dom-props -- per-instance fill width, see the component JSDoc */}
        <div className={styles.indicator} style={fill} />
      </div>
    </div>
  );
}

Progress.displayName = 'Progress';
