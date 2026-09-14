import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './Icon.module.css';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Any SVG (for instance from `@pearpages/pulp-icons`); it is sized to the icon box. */
  children: ReactNode;
  /** `inherit` follows the surrounding font size, for icons inside text-sized controls. @default 'md' */
  size?: IconSize | 'inherit';
  /**
   * Accessible name. Without it the icon is decorative and hidden from
   * assistive technology; with it the icon is an image with that name.
   */
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Sizes any SVG to the icon scale and settles its accessibility: decorative
 * by default, an image when given a `label`. Colour is `currentColor`, so an
 * icon inherits the text tone around it.
 */
export function Icon({ children, size = 'md', label, className, ref, ...rest }: IconProps) {
  return (
    <span
      {...rest}
      ref={ref}
      className={classes(styles.icon, className)}
      data-size={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}

Icon.displayName = 'Icon';
