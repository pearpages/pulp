import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../button';
import { Icon } from '../icon';
import { classes } from '../internal/classes';
import styles from './IconButton.module.css';

export interface IconButtonProps<E extends HTMLElement = HTMLButtonElement>
  extends Omit<ButtonProps<E>, 'children' | 'iconStart' | 'iconEnd'> {
  /** The accessible name. Required: an icon alone is not a name. Also used as the tooltip unless `title` is given. */
  label: string;
  /** The glyph, for instance from `@pearpages/pulp-icons`. */
  icon: ReactNode;
  /** With `asChild`: the element to render (a link, for instance). Its own children are replaced by the icon. */
  children?: ReactElement;
}

/**
 * A square Button that shows only an icon and therefore *requires* a name.
 * Everything else (variants, sizes, loading, asChild) is Button's; the
 * `--icon-button-size-*` tokens make it square.
 *
 * @status stable
 * @category Actions
 * @accessibility A Button with `aria-label` from the required `label`; `title` shows it as a tooltip. Everything else is Button's.
 * @do Write the label as the action ("Close", "Add item").
 * @dont Use the icon's name as the label.
 */
export function IconButton<E extends HTMLElement = HTMLButtonElement>({
  label,
  icon,
  title,
  className,
  asChild = false,
  children,
  ...rest
}: IconButtonProps<E>) {
  const glyph = <Icon size="inherit">{icon}</Icon>;
  return (
    <Button
      {...rest}
      asChild={asChild}
      aria-label={label}
      title={title ?? label}
      data-icon-only=""
      className={classes(styles.iconButton, className)}
    >
      {asChild && isValidElement(children) ? cloneElement(children, undefined, glyph) : glyph}
    </Button>
  );
}

IconButton.displayName = 'IconButton';
