import { createElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Stack.module.css';

export type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol' | 'li';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** @default 'div' */
  as?: StackElement;
  /** Step on the spacing scale (`--space-1` … `--space-8`). @default 3 */
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;

  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * A flex column whose gap is a step on the spacing scale, so consumers
 * compose layout from tokens instead of writing padding and margins.
 * Rendered as `ul`/`ol` it keeps `role="list"` explicitly, because Safari
 * stops announcing a list once `list-style` is removed.
 *
 * @status stable
 * @category Layout
 * @accessibility Layout only: no role unless rendered as `ul`/`ol`, where `role="list"` is kept explicitly because Safari drops list semantics without markers.
 * @do Use `as="ul"` for a list of like items so the count is announced.
 * @dont Use it to space unrelated regions; it is one flex column.
 */
export function Stack({ as = 'div', gap = 3, align, justify, className, ref, children, ...rest }: StackProps) {
  return createElement(
    as,
    {
      ...rest,
      ref,
      // Safari drops list semantics when list-style is none; say it explicitly.
      role: rest.role ?? (as === 'ul' || as === 'ol' ? 'list' : undefined),
      className: classes(styles.stack, className),
      'data-gap': gap,
      'data-align': align,
      'data-justify': justify,

    },
    children,
  );
}

Stack.displayName = 'Stack';
