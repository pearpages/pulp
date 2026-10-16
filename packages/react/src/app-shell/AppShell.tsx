import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { classes } from '../internal/classes';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Across the top at every width: the app's top bar, which renders its own `header`. */
  header?: ReactNode;
  /** The navigation column, from 48rem up: usually a `NavList`. Hidden below 48rem. */
  sidebar?: ReactNode;
  /** The bottom bar, below 48rem: usually a `TabBar`. Hidden from 48rem up. */
  tabBar?: ReactNode;
  /** Under the page at every width: the app's footer, which renders its own `footer`. */
  footer?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  /** The page, rendered in the shell's `main`. */
  children: ReactNode;
}

/**
 * The frame of an app's pages: a header, the page, a footer, and the app's
 * navigation, as a sidebar on a wide screen and a tab bar on a phone. Every
 * slot but the page is optional; a slot left out takes no room, so a signed-out
 * page passes no navigation and gets a plain header, page and footer. The
 * switch at 48rem is CSS only, so the server and the first client render are
 * the same page. Below 48rem, with a tab bar, the page is padded by the bar's
 * height and `--app-shell-inset-block-end` carries it, for toasts and anything
 * else fixed to the bottom edge. Every value comes from `--app-shell-*` tokens.
 *
 * @status experimental
 * @category Layout
 * @accessibility Renders one `main` landmark around the page; the header, footer and navigation bring their own landmarks (`header`, `footer`, a named `nav`). The navigation slot that does not fit the width is `display: none`, so assistive technology meets one primary navigation, never two. Focus order follows the DOM: header, sidebar, page, footer, then the tab bar, which is last in the DOM and drawn over the bottom edge.
 * @do Pass the same places to `sidebar` and `tabBar`, as a NavList and a TabBar.
 * @do Leave the navigation slots out for a signed-out page.
 * @dont Put a `main` in the page; the shell renders it.
 * @dont Use it inside a page; it is the frame of the whole viewport.
 */
export function AppShell({ header, sidebar, tabBar, footer, className, ref, children, ...rest }: AppShellProps) {
  return (
    <div
      {...rest}
      ref={ref}
      className={classes(styles.root, className)}
      data-sidebar={sidebar != null ? '' : undefined}
      data-tab-bar={tabBar != null ? '' : undefined}
      data-footer={footer != null ? '' : undefined}
    >
      {header != null && <div className={styles.header}>{header}</div>}
      {sidebar != null && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarInner}>{sidebar}</div>
        </div>
      )}
      <main className={styles.main}>{children}</main>
      {footer != null && <div className={styles.footer}>{footer}</div>}
      {tabBar != null && <div className={styles.tabBar}>{tabBar}</div>}
    </div>
  );
}

AppShell.displayName = 'AppShell';
