import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Icon } from '../icon';
import { classes } from '../internal/classes';
import { VisuallyHidden } from '../visually-hidden';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'action';
export type BadgeVariant = 'solid' | 'subtle' | 'dot';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Meaning, not colour: `neutral` for counts and tags; `action` is the brand's colour, for a marker that is not a status (a navigation's unread count). @default 'neutral' */
  tone?: BadgeTone;
  /**
   * `solid` fills with the tone; `subtle` tints and uses the tone as text; `dot` is a
   * small filled circle with no visible text, which needs a `label`. @default 'subtle'
   */
  variant?: BadgeVariant;
  /** @default 'md' */
  size?: BadgeSize;
  /** Leading glyph, decorative. */
  icon?: ReactNode;
  /**
   * A number to show instead of children, clamped to `max` ("99+"). Zero or less
   * renders nothing: an empty inbox has no badge.
   */
  count?: number;
  /** The highest count shown as is. @default 99 */
  max?: number;
  /**
   * What the badge means, for assistive technology. Required for `variant="dot"`
   * ("Unread messages"), where it is the only content. With a `count` it is read
   * after the number: `count={3} label="unread"` is announced as "3 unread".
   */
  label?: string;
  ref?: Ref<HTMLSpanElement>;
  children?: ReactNode;
}

// Guarded: a consumer's bundler may not define `process`.
const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

/**
 * A small label for status, counts and tags. Tone and variant resolve
 * through `--badge-*` onto the status tokens, whose contrast is proven by
 * the token tests. Not interactive: for a removable chip, compose with a
 * Button.
 *
 * @status stable
 * @category Feedback
 * @accessibility Plain text: no role, no interaction, and deliberately no live region: a badge that is there when the page renders must not be announced as news (put `role="status"` on a wrapper yourself if a count changes while the user is on the page). A `dot` has no visible text, so its `label` is rendered visually hidden; a `count` above `max` reads as "99+", followed by the `label` if there is one. Every tone × variant pair meets WCAG AA, proven by the token tests. Tone is reinforced by the text, not only by colour.
 * @do Keep the text to one or two words.
 * @do Give a `dot` a `label` that says what it marks, and a `count` a `label` that says what is counted.
 * Pair a leading icon with text, never alone.
 * @dont Make it clickable; compose a Button for a removable chip.
 * Use tone alone to convey meaning; say it in the text.
 */
export function Badge({ tone = 'neutral', variant = 'subtle', size = 'md', icon, count, max = 99, label, className, ref, children, ...rest }: BadgeProps) {
  if (count !== undefined && count <= 0) return null;

  const dot = variant === 'dot';
  if (DEV && dot && !label) {
    console.warn('Badge: variant="dot" has no visible text, so it needs a `label` for assistive technology.');
  }
  const text = count === undefined ? children : count > max ? `${max}+` : String(count);

  return (
    <span {...rest} ref={ref} className={classes(styles.badge, className)} data-tone={tone} data-variant={variant} data-size={size}>
      {!dot && icon && <Icon size="inherit">{icon}</Icon>}
      {!dot && text}
      {label && (dot || count !== undefined) && <VisuallyHidden>{dot ? label : ` ${label}`}</VisuallyHidden>}
    </span>
  );
}

Badge.displayName = 'Badge';
