import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './TabBar.module.css';

export type TabBarPosition = 'fixed' | 'static';

export interface TabBarProps extends HTMLAttributes<HTMLElement> {
  /** Names the landmark ("Primary"). Required: a page with several `nav`s needs them told apart. */
  label: string;
  /** `fixed` docks the bar to the bottom of the viewport, above the safe-area inset; `static` leaves it in the flow. @default 'fixed' */
  position?: TabBarPosition;
  ref?: Ref<HTMLElement>;
  /** Three to five `TabBar.Item`s. */
  children: ReactNode;
}

/**
 * An app's primary navigation on a phone: three to five places, each an icon
 * over a short label, in a bar docked to the bottom edge where the thumb
 * reaches. One tab can be `prominent`, a raised round button for the action
 * the app is about. It holds no router and no state: the app says which tab is
 * current and passes its router's link with `asChild`, so it renders on the
 * server. Every value comes from `--tab-bar-*` tokens.
 *
 * @status experimental
 * @category Navigation
 * @accessibility A `nav` landmark named by `label`, holding a list of links: not the ARIA `tablist` its name suggests, because each tab loads another page. The current tab has `aria-current="page"`. Every tab shows its label (an icon alone is not a name), is as tall as the bar and shares its width, so the touch target is never smaller than the bar's height. Tab moves through the tabs; there are no arrow keys. Icons are decorative; a badge carries its own label. Fixed, it pads itself by the safe-area inset so the home indicator never covers a tab.
 * @do Use it for an app's three to five top-level places on a phone, and NavList for the same places on a wide screen.
 * @do Keep labels to one short word; a label that does not fit ends in an ellipsis.
 * @dont Use it for more than five places, or for actions on the current page.
 * @dont Use it to switch views inside a page; that is Tabs or a SegmentedControl.
 */
export function TabBar({ label, position = 'fixed', className, ref, children, ...rest }: TabBarProps) {
  return (
    <nav {...rest} ref={ref} aria-label={label} className={classes(styles.root, className)} data-position={position}>
      <ul role="list" className={styles.list}>
        {children}
      </ul>
    </nav>
  );
}

export interface TabBarItemProps<E extends HTMLElement = HTMLAnchorElement> extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** This tab is the page being shown: `aria-current="page"` and the action colour. @default false */
  current?: boolean;
  /** Drawn over the label. Decorative: hidden from assistive technology, so the label must stand on its own. */
  icon: ReactNode;
  /** On the icon's corner: a `Badge`, usually `variant="dot"`, with its own `label`. */
  badge?: ReactNode;
  /** The raised round button in the middle of the bar, for the app's main action. One per bar. @default false */
  prominent?: boolean;
  /** Render the single child instead of an `a`: a router's link. @default false */
  asChild?: boolean;
  ref?: Ref<E>;
  /** The visible label. */
  children: ReactNode;
}

/** One tab of a `TabBar`. With `asChild`, the router's own link takes the styles, the icon and the label. */
export function TabBarItem<E extends HTMLElement = HTMLAnchorElement>({
  current = false,
  icon,
  badge,
  prominent = false,
  asChild = false,
  className,
  ref,
  children,
  ...rest
}: TabBarItemProps<E>) {
  const decorate = (label: ReactNode) => (
    <>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
      {/* After the label, so the name reads "Friends New activity"; the grid draws it on the icon's corner. */}
      {badge != null && ' '}
      {badge != null && <span className={styles.badge}>{badge}</span>}
    </>
  );
  const props = {
    ...rest,
    className: classes(styles.tab, className),
    'data-prominent': prominent ? '' : undefined,
    'aria-current': current ? ('page' as const) : undefined,
  };

  return (
    <li className={styles.item}>
      {asChild ? (
        // eslint-disable-next-line react-hooks/refs -- forwarded, not read
        renderAsChild('TabBar.Item', children, {
          ...props,
          ref,
          children: decorate((children as { props?: { children?: ReactNode } }).props?.children),
        })
      ) : (
        <a {...props} ref={ref as Ref<HTMLAnchorElement>}>
          {decorate(children)}
        </a>
      )}
    </li>
  );
}

TabBar.displayName = 'TabBar';
TabBarItem.displayName = 'TabBar.Item';

TabBar.Item = TabBarItem;
