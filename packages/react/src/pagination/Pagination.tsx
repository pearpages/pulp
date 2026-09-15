import type { HTMLAttributes, Ref } from 'react';
import { ArrowLeft, ArrowRight } from '@pearpages/pulp-icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { classes } from '../internal/classes';
import { paginationRange } from './range';
import styles from './Pagination.module.css';

export type PaginationSize = 'sm' | 'md';
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The current page, 1-based. */
  page: number;
  /** Total number of pages. */
  count: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. @default 1 */
  siblings?: number;
  /** Pages always shown at each end. @default 1 */
  boundaries?: number;
  /** Render pages as links (server-side or router pagination) instead of buttons. */
  getHref?: (page: number) => string;
  /** @default 'md' */
  size?: PaginationSize;
  /** The landmark's name. @default 'Pagination' */
  'aria-label'?: string;
  /** @default 'Previous page' */
  previousLabel?: string;
  /** @default 'Next page' */
  nextLabel?: string;
  /** Accessible name of a page control. @default (n) => `Page ${n}` */
  pageLabel?: (page: number) => string;
  ref?: Ref<HTMLElement>;
}

/**
 * Page controls in a `nav` landmark: previous, numbered pages with the
 * current one marked `aria-current="page"`, and next. Distant pages
 * collapse into an ellipsis. Buttons by default; `getHref` renders links so
 * the pages are crawlable and open in new tabs. Built from Button and
 * IconButton, so it needs no keyboard model of its own.
 *
 * @status experimental
 * @category Navigation
 * @accessibility A `nav` landmark named by `aria-label`; the current page carries `aria-current="page"`; previous and next are IconButtons with names; ellipses are hidden from assistive technology. With `getHref` the controls are links.
 * @do Use `getHref` when pages have URLs so they can be opened in new tabs and crawled.
 * Keep `siblings` at 1 on narrow screens.
 * @dont Disable the whole component while a page loads; disable only what cannot be pressed.
 */
export function Pagination({
  page,
  count,
  onPageChange,
  siblings = 1,
  boundaries = 1,
  getHref,
  size = 'md',
  'aria-label': ariaLabel = 'Pagination',
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  pageLabel = (n) => `Page ${n}`,
  className,
  ref,
  ...rest
}: PaginationProps) {
  const go = (target: number) => () => onPageChange?.(target);

  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel} className={classes(styles.root, className)} data-size={size}>
      <ul className={styles.list}>
        <li>
          {page > 1 && getHref ? (
            <IconButton<HTMLAnchorElement> asChild label={previousLabel} icon={<ArrowLeft />} variant="ghost" size={size} onClick={go(page - 1)}>
              <a href={getHref(page - 1)} />
            </IconButton>
          ) : (
            <IconButton label={previousLabel} icon={<ArrowLeft />} variant="ghost" size={size} disabled={page <= 1} onClick={go(page - 1)} />
          )}
        </li>
        {paginationRange(page, count, siblings, boundaries).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              {getHref ? (
                <Button<HTMLAnchorElement>
                  asChild
                  variant={item === page ? 'primary' : 'ghost'}
                  size={size}
                  className={styles.page}
                  aria-label={pageLabel(item)}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={go(item)}
                >
                  <a href={getHref(item)}>{item}</a>
                </Button>
              ) : (
                <Button
                  variant={item === page ? 'primary' : 'ghost'}
                  size={size}
                  className={styles.page}
                  aria-label={pageLabel(item)}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={go(item)}
                >
                  {item}
                </Button>
              )}
            </li>
          ) : (
            <li key={item} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
        <li>
          {page < count && getHref ? (
            <IconButton<HTMLAnchorElement> asChild label={nextLabel} icon={<ArrowRight />} variant="ghost" size={size} onClick={go(page + 1)}>
              <a href={getHref(page + 1)} />
            </IconButton>
          ) : (
            <IconButton label={nextLabel} icon={<ArrowRight />} variant="ghost" size={size} disabled={page >= count} onClick={go(page + 1)} />
          )}
        </li>
      </ul>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
