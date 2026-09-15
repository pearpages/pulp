import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { renderAsChild } from '../internal/asChild';
import { classes } from '../internal/classes';
import { useFloatingPosition, type FloatingPlacement } from '../internal/floating';
import { useDismiss } from '../internal/useDismiss';
import styles from './Popover.module.css';

export type PopoverPlacement = FloatingPlacement;

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  placement: PopoverPlacement;
  floating: ReturnType<typeof useFloatingPosition>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(part: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`${part} must be rendered inside <Popover>`);
  return context;
}

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when there is no room. @default 'bottom-start' */
  placement?: PopoverPlacement;
  children: ReactNode;
}

/**
 * A non-modal layer anchored to its trigger: a small form, a filter, a
 * detail panel. The page stays interactive; Escape, a click outside or
 * `Popover.Close` dismiss it and focus returns to the trigger. Compose with
 * `Popover.Trigger`, `Popover.Content` and `Popover.Close`. For anything that
 * must block the page, use Dialog.
 *
 * @status stable
 * @category Overlays
 * @accessibility A non-modal `role="dialog"` named by `title` (or `aria-label`); the trigger has `aria-haspopup="dialog"` and `aria-expanded`. Focus moves to the first focusable element on open and back to the trigger on close; Escape and a click outside dismiss it.
 * @do Give it a `title` or `aria-label`.
 * Use `Popover.Close` inside forms so a keyboard user has a clear exit.
 * @dont Put a long form or a destructive confirmation in it; use Dialog.
 * Open it on hover; that is Tooltip.
 */
export function Popover({ open, defaultOpen = false, onOpenChange, placement = 'bottom-start', children }: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : uncontrolled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  const id = useId();
  const floating = useFloatingPosition({ open: isOpen, placement });

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, contentId: `${id}-content`, titleId: `${id}-title`, placement, floating }}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child element as the trigger instead of a plain button. @default false */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

function PopoverTrigger({ asChild = false, onClick, ref, children, ...rest }: PopoverTriggerProps) {
  const popover = usePopover('Popover.Trigger');
  const props = {
    ...rest,
    ref: popover.floating.refs.setReference,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': popover.open,
    'aria-controls': popover.open ? popover.contentId : undefined,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) popover.setOpen(!popover.open);
    },
  };
  if (asChild) {
    // eslint-disable-next-line react-hooks/refs -- forwarded to the reference element, not read
    return renderAsChild('Popover.Trigger', children, { ...props, ref: mergeRefs(ref, popover.floating.refs.setReference) });
  }
  return (
    <button type="button" {...props} ref={mergeRefs(ref, popover.floating.refs.setReference)}>
      {children}
    </button>
  );
}

function mergeRefs<T>(a: Ref<T> | undefined, b: (node: T | null) => void) {
  return (node: T | null) => {
    b(node);
    if (typeof a === 'function') a(node);
    else if (a) a.current = node;
  };
}

interface PopoverContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Rendered as the dialog's heading and used as its accessible name. Otherwise pass `aria-label`. */
  title?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

function PopoverContent({ title, className, ref, children, ...rest }: PopoverContentProps) {
  const popover = usePopover('Popover.Content');
  const { refs, positionStyle, placement } = popover.floating;
  const contentRef = useRef<HTMLDivElement | null>(null);

  useDismiss({
    open: popover.open,
    onDismiss: () => popover.setOpen(false),
    inside: () => [refs.reference.current as Element | null, refs.floating.current],
  });

  // Move focus in on open; give it back to the trigger on close.
  useEffect(() => {
    if (popover.open) {
      const content = contentRef.current;
      if (!content) return;
      const first = content.querySelector<HTMLElement>('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
      (first ?? content).focus();
      return () => {
        const reference = refs.reference.current as HTMLElement | null;
        if (content.contains(document.activeElement) || document.activeElement === document.body) reference?.focus();
      };
    }
  }, [popover.open, refs.reference]);

  if (!popover.open) return null;
  return createPortal(
    <div
      {...rest}
      ref={mergeRefs(ref, (node) => {
        contentRef.current = node;
        refs.setFloating(node);
      })}
      id={popover.contentId}
      role="dialog"
      aria-labelledby={title ? popover.titleId : undefined}
      tabIndex={-1}
      className={classes(styles.content, className)}
      data-placement={placement}
      // eslint-disable-next-line react/forbid-dom-props -- per-instance position (--_x/--_y), see internal/floating.ts
      style={positionStyle}
    >
      {title && (
        <h2 id={popover.titleId} className={styles.title}>
          {title}
        </h2>
      )}
      {children}
    </div>,
    document.body,
  );
}

interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

function PopoverClose({ asChild = false, onClick, children, ...rest }: PopoverCloseProps) {
  const popover = usePopover('Popover.Close');
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) popover.setOpen(false);
    },
  };
  if (asChild) return renderAsChild('Popover.Close', children, props);
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

Popover.displayName = 'Popover';
PopoverTrigger.displayName = 'Popover.Trigger';
PopoverContent.displayName = 'Popover.Content';
PopoverClose.displayName = 'Popover.Close';

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverClose;
