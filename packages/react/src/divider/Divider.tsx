import type { HTMLAttributes, Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** @default 'horizontal' */
  orientation?: DividerOrientation;
  /** Space on both sides, along the axis the line separates. @default 'none' */
  spacing?: DividerSpacing;
  /**
   * A decorative line is hidden from assistive technology. Pass `false` when the
   * line is the only thing that says two groups are separate. @default true
   */
  decorative?: boolean;

  ref?: Ref<HTMLDivElement>;
}

/**
 * A hairline between two groups of content, horizontal or vertical. A vertical
 * divider stretches to its flex or grid row, so it needs a parent that lays it out.
 *
 * @status experimental
 * @category Layout
 * @accessibility Decorative by default: `role="none"`, nothing is announced, because headings and landmarks should already carry the structure. With `decorative={false}` it is a `separator`, and a vertical one says so through `aria-orientation`. It is never focusable: a separator that moves is a splitter, which this is not.
 * @do Put it between groups inside a Card, a Menu-like list or a toolbar.
 * @do Let `spacing` set the distance, so it stays on the spacing scale.
 * @dont Use it to draw a border around something; that is the container's border.
 * @dont Rely on it alone to tell a screen reader that a new section starts; use a heading.
 */
export function Divider({
  orientation = 'horizontal',
  spacing = 'none',
  decorative = true,
  className,
  ref,
  ...rest
}: DividerProps) {
  return (
    <div
      {...rest}
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      className={classes(styles.divider, className)}
      data-orientation={orientation}
      data-spacing={spacing}
    />
  );
}

Divider.displayName = 'Divider';
