import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './Link.module.css';

export type LinkTone = 'action' | 'default' | 'muted';
export type LinkUnderline = 'always' | 'hover';

export interface LinkProps<E extends HTMLElement = HTMLAnchorElement> extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `action` is the brand's link colour; `default` and `muted` take the text colours. @default 'action' */
  tone?: LinkTone;
  /**
   * `hover` drops the underline until the pointer is over it. Only for links that
   * are obviously links from where they sit (a nav, a footer list). @default 'always'
   */
  underline?: LinkUnderline;
  /** Render the single child instead of an `a`: a router's link component. @default false */
  asChild?: boolean;

  ref?: Ref<E>;
  children: ReactNode;
}

/**
 * A text link. Underlined by default, because colour alone must not be what
 * tells a link from the words around it. With `asChild` the styles and props
 * land on a router's own link, so client-side navigation keeps working.
 *
 * @status experimental
 * @category Typography
 * @accessibility A native `a`: focusable and activated with Enter only when it has an `href` (or the `asChild` element provides one). The focus ring comes from the semantic focus tokens. `underline="hover"` removes the only non-colour cue, so it is for lists of links, never for a link inside a sentence (WCAG 1.4.1).
 * @do Use `asChild` with the router's link: `<Link asChild><NextLink href="/feed">Feed</NextLink></Link>`.
 * @do Write link text that makes sense out of context; screen readers list links on their own.
 * @dont Use it for an action that does not navigate; that is a Button (`variant="ghost"`).
 * @dont Use `underline="hover"` for a link inside running text.
 */
export function Link<E extends HTMLElement = HTMLAnchorElement>({
  tone = 'action',
  underline = 'always',
  asChild = false,
  className,
  ref,
  children,
  ...rest
}: LinkProps<E>) {
  const props = {
    ...rest,
    ref,
    className: classes(styles.link, className),
    'data-tone': tone,
    'data-underline': underline,
  };

  if (asChild) {
    // eslint-disable-next-line react-hooks/refs -- forwarded, not read
    return renderAsChild('Link', children, props);
  }

  return (
    <a {...rest} ref={ref as Ref<HTMLAnchorElement>} className={props.className} data-tone={tone} data-underline={underline}>
      {children}
    </a>
  );
}

Link.displayName = 'Link';
