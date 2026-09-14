import { createElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type HeadingTone = 'default' | 'muted';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** The document outline level; sets the element (`h1`–`h6`). */
  level: HeadingLevel;
  /** Visual size, decoupled from the level. Defaults by level: 1→2xl, 2→xl, 3→lg, 4→md, 5 and 6→sm. */
  size?: HeadingSize;
  /** @default 'default' */
  tone?: HeadingTone;
  ref?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}

const SIZE_BY_LEVEL: Record<HeadingLevel, HeadingSize> = { 1: '2xl', 2: 'xl', 3: 'lg', 4: 'md', 5: 'sm', 6: 'sm' };

/**
 * A heading whose outline level and visual size are separate decisions, so
 * the document structure stays honest while the design stays flexible.
 * Display family and tight leading from `--heading-*` tokens.
 */
export function Heading({ level, size, tone = 'default', className, ref, children, ...rest }: HeadingProps) {
  return createElement(
    `h${level}`,
    {
      ...rest,
      ref,
      className: classes(styles.heading, className),
      'data-size': size ?? SIZE_BY_LEVEL[level],
      'data-tone': tone,
    },
    children,
  );
}

Heading.displayName = 'Heading';
