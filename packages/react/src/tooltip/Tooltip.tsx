import { useCallback, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { renderAsChild } from '../internal/asChild';
import { useFloatingPosition, type FloatingPlacement } from '../internal/floating';
import styles from './Tooltip.module.css';

export type TooltipPlacement = FloatingPlacement;

export interface TooltipProps {
  /** The tooltip text. Supplementary only: it must not be the control's only name. */
  content: ReactNode;
  /** Preferred side; flips when there is no room. @default 'top' */
  placement?: TooltipPlacement;
  /** Hover delay in milliseconds. Focus shows immediately. @default 300 */
  delay?: number;
  /** The single element that owns the tooltip; it receives the hover, focus and `aria-describedby` wiring. */
  children: ReactElement;
}

/**
 * A short description shown on hover or focus and linked with
 * `aria-describedby` while visible. Never the only name of a control: use it
 * for extra detail, and give icon-only controls a real label. Escape hides it.
 *
 * @status stable
 * @category Overlays
 * @accessibility Shown on hover after a delay and on focus immediately; the trigger gets `aria-describedby` pointing at the `tooltip` while it is visible; Escape hides it. It is a description, never a name.
 * @do Use it for extra detail on controls that already have a name.
 * @dont Put interactive content in it.
 * Use it to name an icon-only control; use IconButton's `label`.
 */
export function Tooltip({ content, placement = 'top', delay = 300, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { refs, positionStyle, placement: resolved } = useFloatingPosition({ open, placement });

  const show = useCallback(
    (wait: number) => {
      clearTimeout(timer.current);
      if (wait === 0) setOpen(true);
      else timer.current = setTimeout(() => setOpen(true), wait);
    },
    [],
  );
  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, hide]);

  // The helper merges these handlers with the child's own and forwards the ref.
  // eslint-disable-next-line react-hooks/refs -- forwarded to the reference element, not read
  const trigger = renderAsChild('Tooltip', children, {
    ref: refs.setReference,
    onMouseEnter: () => show(delay),
    onMouseLeave: hide,
    onFocus: () => show(0),
    onBlur: hide,
    'aria-describedby': open ? id : undefined,
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          // eslint-disable-next-line react/forbid-dom-props -- per-instance position (--_x/--_y), see internal/floating.ts
          <div ref={refs.setFloating} id={id} role="tooltip" className={styles.tooltip} data-placement={resolved} style={positionStyle}>
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
