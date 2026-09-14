import { createElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './VisuallyHidden.module.css';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /** @default 'span' */
  as?: 'span' | 'div';
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * Content for assistive technology only: read by screen readers, invisible
 * on screen, still in the accessibility tree (unlike `display: none`). Use
 * it to give icon-only controls a name or to add context a sighted user
 * gets from layout.
 */
export function VisuallyHidden({ as = 'span', className, ref, children, ...rest }: VisuallyHiddenProps) {
  return createElement(as, { ...rest, ref, className: classes(styles.root, className) }, children);
}

VisuallyHidden.displayName = 'VisuallyHidden';
