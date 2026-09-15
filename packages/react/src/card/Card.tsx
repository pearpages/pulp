import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import styles from './Card.module.css';

export type CardVariant = 'raised' | 'outlined' | 'sunken';
export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps<E extends HTMLElement = HTMLElement> extends HTMLAttributes<HTMLElement> {
  /**
   * How the card separates from the page: `raised` by shadow, `outlined` by
   * border, `sunken` by a recessed surface.
   * @default 'raised'
   */
  variant?: CardVariant;
  /** One knob for every slot's inner spacing. @default 'md' */
  padding?: CardPadding;
  /**
   * Hover and focus affordances for a card that is itself a target. Pair it
   * with `asChild` and a link, or supply your own role and handlers.
   * @default false
   */
  interactive?: boolean;
  /**
   * Render the single child element as the card (an `<a>` for a link card),
   * merging the card's props into it.
   * @default false
   */
  asChild?: boolean;
  /** The rendered element; a `<section>` unless `asChild`. */
  ref?: Ref<E>;
  children: ReactNode;
}

interface SlotProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/**
 * A surface that groups related content. Compose with `Card.Header`,
 * `Card.Body` and `Card.Footer`; the slots carry the padding and dividers so
 * the root stays a plain surface. Every value comes from `--card-*` tokens;
 * state is exposed as `data-variant`, `data-padding` and `data-interactive`.
 *
 * @status stable
 * @accessibility A `section` by default (a `region` when it has an accessible name); with `asChild` the child element's own semantics apply. `interactive` adds a focus ring and a tab stop only when the element is not already focusable.
 * @do Give a card an `aria-label` or a heading in `Card.Header` when it is a landmark worth naming.
 * Use `asChild` with an `a` for a whole-card link.
 * @dont Put more than one primary action inside an interactive card.
 * Nest interactive cards.
 */
export function Card<E extends HTMLElement = HTMLElement>({
  variant = 'raised',
  padding = 'md',
  interactive = false,
  asChild = false,
  className,
  tabIndex,
  ref,
  children,
  ...rest
}: CardProps<E>) {
  const props = {
    ...rest,
    ref,
    className: classes(styles.card, className),
    'data-variant': variant,
    'data-padding': padding,
    'data-interactive': interactive ? '' : undefined,
    // An interactive section must be reachable; a link or button already is.
    tabIndex: tabIndex ?? (interactive && !asChild ? 0 : undefined),
  };

  if (asChild) {
    // The helper merges the forwarded ref with the child's; nothing reads it.
    // eslint-disable-next-line react-hooks/refs -- forwarded, not read
    return renderAsChild('Card', children, props);
  }

  return <section {...(props as HTMLAttributes<HTMLElement>)}>{children}</section>;
}

function CardHeader({ className, ref, ...rest }: SlotProps) {
  return <div {...rest} ref={ref} className={classes(styles.header, className)} />;
}

function CardBody({ className, ref, ...rest }: SlotProps) {
  return <div {...rest} ref={ref} className={classes(styles.body, className)} />;
}

function CardFooter({ className, ref, ...rest }: SlotProps) {
  return <div {...rest} ref={ref} className={classes(styles.footer, className)} />;
}

Card.displayName = 'Card';
CardHeader.displayName = 'Card.Header';
CardBody.displayName = 'Card.Body';
CardFooter.displayName = 'Card.Footer';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
