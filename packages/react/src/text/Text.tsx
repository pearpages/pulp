import { createElement, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Text.module.css';

export type TextElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold';
export type TextTone = 'default' | 'muted' | 'faint';
export type TextFamily = 'body' | 'mono';
export type TextAlign = 'start' | 'center' | 'end';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. For a label use `Field.Label`. @default 'p' */
  as?: TextElement;
  /** @default 'md' */
  size?: TextSize;
  /** @default 'regular' */
  weight?: TextWeight;
  /** Emphasis: `muted` for secondary text, `faint` for the least important. @default 'default' */
  tone?: TextTone;
  /** @default 'body' */
  family?: TextFamily;
  align?: TextAlign;
  /** Single line with an ellipsis. @default false */
  truncate?: boolean;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * The type scale as a component. Every combination of size, weight, tone and
 * family resolves through `--text-*` tokens, so body copy never carries its
 * own font declarations. State on the DOM: `data-size`, `data-weight`,
 * `data-tone`, `data-family`, `data-align`, `data-truncate`.
 */
export function Text({
  as = 'p',
  size = 'md',
  weight = 'regular',
  tone = 'default',
  family = 'body',
  align,
  truncate = false,
  className,
  ref,
  children,
  ...rest
}: TextProps) {
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: classes(styles.text, className),
      'data-size': size,
      'data-weight': weight,
      'data-tone': tone,
      'data-family': family,
      'data-align': align,
      'data-truncate': truncate ? '' : undefined,
    },
    children,
  );
}

Text.displayName = 'Text';
