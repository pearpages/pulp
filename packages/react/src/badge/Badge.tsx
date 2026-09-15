import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Icon } from '../icon';
import { classes } from '../internal/classes';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type BadgeVariant = 'solid' | 'subtle';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Meaning, not colour: `neutral` for counts and tags. @default 'neutral' */
  tone?: BadgeTone;
  /** `solid` fills with the tone; `subtle` tints and uses the tone as text. @default 'subtle' */
  variant?: BadgeVariant;
  /** @default 'md' */
  size?: BadgeSize;
  /** Leading glyph, decorative. */
  icon?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
  children: ReactNode;
}

/**
 * A small label for status, counts and tags. Tone and variant resolve
 * through `--badge-*` onto the status tokens, whose contrast is proven by
 * the token tests. Not interactive: for a removable chip, compose with a
 * Button.
 *
 * @status stable
 * @accessibility Plain text: no role, no interaction. Every tone × variant pair meets WCAG AA, proven by the token tests. Tone is reinforced by the text, not only by colour.
 * @do Keep the text to one or two words.
 * Pair a leading icon with text, never alone.
 * @dont Make it clickable; compose a Button for a removable chip.
 * Use tone alone to convey meaning; say it in the text.
 */
export function Badge({ tone = 'neutral', variant = 'subtle', size = 'md', icon, className, ref, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} ref={ref} className={classes(styles.badge, className)} data-tone={tone} data-variant={variant} data-size={size}>
      {icon && <Icon size="inherit">{icon}</Icon>}
      {children}
    </span>
  );
}

Badge.displayName = 'Badge';
