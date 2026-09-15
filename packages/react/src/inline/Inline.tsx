import { createElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Inline.module.css';

export type InlineGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type InlineAlign = 'start' | 'center' | 'end' | 'stretch';
export type InlineJustify = 'start' | 'center' | 'end' | 'between';
export type InlineElement = 'div' | 'section' | 'nav' | 'ul' | 'ol' | 'li';

export interface InlineProps extends HTMLAttributes<HTMLElement> {
  /** @default 'div' */
  as?: InlineElement;
  /** Step on the spacing scale (`--space-1` … `--space-8`). @default 3 */
  gap?: InlineGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  /** Wrap onto new lines when the row overflows. @default true */
  wrap?: boolean;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * A flex row whose gap is a step on the spacing scale, so consumers
 * compose layout from tokens instead of writing padding and margins.
 * Rendered as `ul`/`ol` it keeps `role="list"` explicitly, because Safari
 * stops announcing a list once `list-style` is removed.
 *
 * @status stable
 * @category Layout
 * @accessibility Layout only: no role unless rendered as `ul`/`ol`, where `role="list"` is kept explicitly because Safari drops list semantics without markers.
 * @do Use `as="ul"` for a list of like items so the count is announced.
 * @dont Use it to space unrelated regions; it is one flex row.
 */
export function Inline({ as = 'div', gap = 3, align, justify, wrap = true, className, ref, children, ...rest }: InlineProps) {
  return createElement(
    as,
    {
      ...rest,
      ref,
      // Safari drops list semantics when list-style is none; say it explicitly.
      role: rest.role ?? (as === 'ul' || as === 'ol' ? 'list' : undefined),
      className: classes(styles.inline, className),
      'data-gap': gap,
      'data-align': align,
      'data-justify': justify,
      'data-wrap': wrap ? '' : undefined,
    },
    children,
  );
}

Inline.displayName = 'Inline';
