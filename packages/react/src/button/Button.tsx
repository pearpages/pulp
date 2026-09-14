import { Children, isValidElement, type ButtonHTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react';
import { Icon } from '../icon';
import { renderAsChild } from '../internal/asChild';
import { Spinner } from '../spinner';
import { classes } from '../internal/classes';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps<E extends HTMLElement = HTMLButtonElement> extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual emphasis. One `primary` per view; `secondary` for the rest;
   * `ghost` for actions that sit inside other content.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
  /**
   * Shows a spinner, sets `aria-busy` and `aria-disabled`, and blocks
   * activation. The element stays focusable so focus is not lost mid-action,
   * and the label stays in place so the button keeps its width.
   * @default false
   */
  loading?: boolean;
  /** Decorative element before the label. Hidden from assistive technology. */
  iconStart?: ReactNode;
  /** Decorative element after the label. Hidden from assistive technology. */
  iconEnd?: ReactNode;
  /**
   * Render the single child element instead of a `<button>`, merging the
   * button's props into it. Use it to style a router `<Link>` or an `<a>` as a
   * button. Disabled and loading states then use `aria-disabled`, and the
   * child's own `onClick` does not run while the control is inert.
   * @default false
   */
  asChild?: boolean;
  /**
   * The rendered element. With `asChild` that is the child's element, so pass
   * the type parameter: `<Button<HTMLAnchorElement> asChild ref={anchorRef}>`.
   */
  ref?: Ref<E>;
  children: ReactNode;
}

const BLOCK = (event: MouseEvent) => event.preventDefault();

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

/** True when some text exists anywhere in the children tree. */
function hasText(node: ReactNode): boolean {
  return Children.toArray(node).some((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    if (typeof child === 'number') return true;
    if (isValidElement<{ children?: ReactNode }>(child)) return hasText(child.props.children);
    return false;
  });
}

/**
 * The one action component. Variants map to emphasis, not colour: one
 * `primary` per view, `secondary` for the rest, `ghost` inside other content.
 * Every value comes from `--button-*` tokens, so a brand restyles it without
 * touching the component. State is exposed as `data-variant`, `data-size` and
 * `data-loading` for styling, tests and agents alike.
 */
export function Button<E extends HTMLElement = HTMLButtonElement>({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconStart,
  iconEnd,
  asChild = false,
  className,
  disabled = false,
  type,
  onClick,
  ref,
  children,
  ...rest
}: ButtonProps<E>) {
  // Inert: must not activate. `disabled` on a real <button> also removes it
  // from the tab order, which is right for "disabled" and wrong for "loading":
  // the element the user just pressed must keep focus. So loading (and every
  // asChild state) uses aria-disabled and blocks activation in the handler.
  const inert = disabled || loading;
  const nativeDisabled = !asChild && disabled;

  if (DEV && !hasText(asChild ? (children as { props?: { children?: ReactNode } }).props?.children : children)) {
    if (!rest['aria-label'] && !rest['aria-labelledby']) {
      console.warn('Button: no text content and no aria-label. Icon-only buttons need an accessible name.');
    }
  }

  const props = {
    ...rest,
    ref,
    className: classes(styles.button, className),
    'data-variant': variant,
    'data-size': size,
    'data-loading': loading ? '' : undefined,
    'aria-busy': loading || undefined,
    disabled: nativeDisabled || undefined,
    'aria-disabled': inert && !nativeDisabled ? true : undefined,
    type: asChild ? undefined : (type ?? 'button'),
    onClick: inert ? BLOCK : onClick,
  };

  const decorate = (label: ReactNode) => (
    <>
      {loading && <Spinner decorative size="inherit" tone="inherit" />}
      {iconStart && <Icon size="inherit">{iconStart}</Icon>}
      <span className={styles.label}>{label}</span>
      {iconEnd && <Icon size="inherit">{iconEnd}</Icon>}
    </>
  );

  if (asChild) {
    const child = children as { props?: { children?: ReactNode } };
    // The helper merges the forwarded ref with the child's; nothing reads it.
    // eslint-disable-next-line react-hooks/refs -- forwarded, not read
    return renderAsChild('Button', children, { ...props, children: decorate(child.props?.children) }, {
      // An inert control must not run the child's handler either.
      replace: inert ? ['onClick'] : [],
    });
  }

  return <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>{decorate(children)}</button>;
}

Button.displayName = 'Button';
