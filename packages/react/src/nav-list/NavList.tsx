import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './NavList.module.css';

export type NavListCurrent = 'page' | 'section';

export interface NavListProps extends HTMLAttributes<HTMLElement> {
  /** Names the landmark ("Primary"). Required: a page with several `nav`s needs them told apart. */
  label: string;
  ref?: Ref<HTMLElement>;
  /** `NavList.Item`s. */
  children: ReactNode;
}

/**
 * A vertical list of links to the places of an app: a sidebar, or the links of
 * one section. Each link carries an optional icon and badge, and the link to
 * the page being shown is marked. A section can list its own pages under its
 * link (`sub`). It holds no router and no state: the app says which link is
 * current and passes its router's link with `asChild`, so it renders on the
 * server. Every value comes from `--nav-list-*` tokens.
 *
 * @status experimental
 * @category Navigation
 * @accessibility A `nav` landmark named by `label`, holding a list of links, so a screen reader announces the count and each link's position. The link to the page being shown has `aria-current="page"`; a section link whose sub-page is shown has `aria-current="true"`, so the user hears both where they are and which section holds it. A sub-list is a nested list inside the section's item. No menu roles and no arrow keys: these are links, reached with Tab like any other. Icons are decorative; a badge carries its own label.
 * @do Use it for an app's primary navigation on wide screens, and for the pages of one section.
 * @do Pass the section's `sub` only while the section is current, so the list stays short.
 * @dont Use it for actions on the current page; that is a Menu.
 * @dont Use it for three to five destinations on a phone; that is a TabBar.
 */
export function NavList({ label, className, ref, children, ...rest }: NavListProps) {
  return (
    <nav {...rest} ref={ref} aria-label={label} className={classes(styles.root, className)}>
      <ul role="list" className={styles.list}>
        {children}
      </ul>
    </nav>
  );
}

export interface NavListItemProps<E extends HTMLElement = HTMLAnchorElement> extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `page`: this link is the page being shown. `section`: a page under this link is. */
  current?: NavListCurrent;
  /** Decorative: hidden from assistive technology, so the label must stand on its own. */
  icon?: ReactNode;
  /** At the end of the row: a `Badge` with its own `label` ("3 unread", a dot for new activity). */
  badge?: ReactNode;
  /** The section's own pages, as `NavList.Item`s, listed under this link. */
  sub?: ReactNode;
  /** Render the single child instead of an `a`: a router's link, or a `button` for an action in the list. @default false */
  asChild?: boolean;
  ref?: Ref<E>;
  children: ReactNode;
}

/** One link of a `NavList`. With `asChild`, the router's own link takes the styles and the icon, label and badge. */
export function NavListItem<E extends HTMLElement = HTMLAnchorElement>({
  current,
  icon,
  badge,
  sub,
  asChild = false,
  className,
  ref,
  children,
  ...rest
}: NavListItemProps<E>) {
  const decorate = (label: ReactNode) => (
    <>
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
      {/* A space, so the name reads "Friends New activity", not "FriendsNew activity". A flex row draws none. */}
      {badge != null && ' '}
      {badge != null && <span className={styles.badge}>{badge}</span>}
    </>
  );
  const props = {
    ...rest,
    className: classes(styles.link, className),
    'data-current': current,
    'aria-current': current === 'page' ? ('page' as const) : current === 'section' ? ('true' as const) : undefined,
  };

  return (
    <li className={styles.item}>
      {asChild ? (
        // eslint-disable-next-line react-hooks/refs -- forwarded, not read
        renderAsChild('NavList.Item', children, {
          ...props,
          ref,
          children: decorate((children as { props?: { children?: ReactNode } }).props?.children),
        })
      ) : (
        <a {...props} ref={ref as Ref<HTMLAnchorElement>}>
          {decorate(children)}
        </a>
      )}
      {sub != null && (
        <ul role="list" className={styles.sub}>
          {sub}
        </ul>
      )}
    </li>
  );
}

NavList.displayName = 'NavList';
NavListItem.displayName = 'NavList.Item';

NavList.Item = NavListItem;
