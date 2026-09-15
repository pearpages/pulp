import type { HTMLAttributes, Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Skeleton.module.css';

export type SkeletonShape = 'text' | 'rect' | 'circle';
export type SkeletonSize = 'sm' | 'md' | 'lg';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** @default 'text' */
  shape?: SkeletonShape;
  /** Number of text lines; the last is shorter. @default 1 */
  lines?: number;
  /** Circle diameter, from the control scale. @default 'md' */
  size?: SkeletonSize;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * A placeholder for content that is loading. Decorative: hidden from
 * assistive technology, so mark the *container* `aria-busy` and announce
 * the loaded state there. Width for text and rect is the consumer's (pass
 * a `className`); the shimmer runs only when motion is allowed.
 *
 * @status stable
 * @accessibility `aria-hidden`: a placeholder has nothing to announce. Mark the container `aria-busy` while loading and clear it when content arrives; the shimmer stops under reduced motion.
 * @do Match the shape of the content it stands in for.
 * Set `aria-busy` on the region, not on the skeleton.
 * @dont Show it for content that arrives in under a few hundred milliseconds.
 * Animate it when the user prefers reduced motion; the CSS already stops it.
 */
export function Skeleton({ shape = 'text', lines = 1, size = 'md', className, ref, ...rest }: SkeletonProps) {
  if (shape === 'text' && lines > 1) {
    return (
      <span {...rest} ref={ref} aria-hidden="true" className={classes(styles.lines, className)} data-shape="text">
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className={styles.skeleton} data-shape="text" data-last={index === lines - 1 ? '' : undefined} />
        ))}
      </span>
    );
  }
  return <span {...rest} ref={ref} aria-hidden="true" className={classes(styles.skeleton, className)} data-shape={shape} data-size={size} />;
}

Skeleton.displayName = 'Skeleton';
