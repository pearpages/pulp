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
