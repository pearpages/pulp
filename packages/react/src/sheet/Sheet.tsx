import { useRef, type ComponentProps, type PointerEvent } from 'react';
import { useModalId, useModalStack } from '@pearpages/modals';
import { Dialog, type DialogProps } from '../dialog';
import { classes } from '../internal/classes';
import { releaseVelocity, shouldDismiss } from './drag';
import styles from './Sheet.module.css';

export type SheetProps = DialogProps;

/** The edge a sheet docks to. `start` and `end` follow the writing direction. */
export type SheetPlacement = 'start' | 'end' | 'top' | 'bottom';

export interface SheetContentProps extends Omit<ComponentProps<typeof Dialog.Content>, 'placement'> {
  /**
   * The edge the sheet docks to. `start` and `end` take `--sheet-width` and the full height;
   * `top` and `bottom` take the full width and `--sheet-height`. There is no `center`: a centred
   * sheet is a Dialog.
   * @default 'end'
   */
  placement?: SheetPlacement;
  /**
   * `placement="bottom"` only: a grab handle at the top of the sheet that can be dragged down to
   * close it (past a quarter of the sheet's height, or with a flick). Pointer and touch only, and
   * off under `prefers-reduced-motion`; Escape, the backdrop and `Sheet.Close` are unchanged.
   * @default true
   */
  dragToDismiss?: boolean;
}

/**
 * A dialog docked to an edge of the viewport: a side panel for detail or settings that keeps the
 * page in view, or a bottom sheet on a phone. It is Dialog with a `placement`: the same parts
 * (`Sheet.Trigger`, `Sheet.Content`, `Sheet.Header`, `Sheet.Title`, `Sheet.Description`,
 * `Sheet.Close`, `Sheet.Body`, `Sheet.Footer`), the same focus trap, stacking and dismissal, and
 * the same colours and type, from Dialog's tokens. Only the size is Sheet's: `--sheet-width`,
 * `--sheet-height` and `--sheet-motion-translate`, the distance it slides in from its edge.
 *
 * It needs what Dialog needs: `DialogSystem` mounted once near the app root, and
 * `@pearpages/modals/styles.css` imported into the `vendor` layer.
 *
 * @status experimental
 * @category Overlays
 * @accessibility The drag handle of a bottom sheet is a pointer and touch shortcut, hidden from assistive technology and not focusable: it adds no keyboard stop, and closing by keyboard stays Escape or `Sheet.Close`, so always render a `Sheet.Close` in a sheet that can be dragged. Otherwise Dialog's: `role="dialog"` with `aria-modal`, named by `Sheet.Title` and described by `Sheet.Description`; focus moves in on open, is trapped, and returns to the trigger on close; Escape and the backdrop dismiss it; the page behind is inert. Docking changes the layout only, never the semantics.
 * @do Always render a `Sheet.Title`.
 * Size one sheet by setting `--sheet-width` (or `--sheet-height` when it is docked to an edge on the block axis) in a class on `Sheet.Content`.
 * @do Dock to `end` for detail and settings beside the page, and to `bottom` for choices on a narrow screen.
 * @dont Use it for a short confirmation; a centred Dialog reads as more urgent and takes less room.
 * @dont Put the page's primary content in a sheet: it is modal, so everything behind it is out of reach.
 */
export function Sheet(props: SheetProps) {
  return <Dialog {...props} />;
}

/**
 * The docked dialog element. Dialog's `Content`, with `placement` and the class that maps pulp's
 * `--sheet-*` tokens onto the vendor's sheet variables.
 */
export function SheetContent({ placement = 'end', dragToDismiss = true, className, children, ...rest }: SheetContentProps) {
  const draggable = placement === 'bottom' && dragToDismiss;
  return (
    <Dialog.Content {...rest} placement={placement} className={classes(styles.content, className)} data-draggable={draggable ? '' : undefined}>
      {draggable && <SheetHandle />}
      {children}
    </Dialog.Content>
  );
}

/** The grab handle. Internal: rendered by `Sheet.Content`, never on its own. */
function SheetHandle() {
  const id = useModalId();
  const { close } = useModalStack();
  const drag = useRef<{ startY: number; panel: HTMLElement; samples: Array<{ time: number; y: number }> } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const panel = event.currentTarget.closest<HTMLElement>('[role="dialog"]');
    if (!panel || event.button !== 0) return;
    // The sheet following the finger is motion; without it the handle is not offered at all (see the stylesheet).
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startY: event.clientY, panel, samples: [{ time: performance.now(), y: event.clientY }] };
    panel.dataset.dragging = '';
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current.samples.push({ time: performance.now(), y: event.clientY });
    // The one per-instance value: how far this sheet has been pulled. A custom property, read by the stylesheet.
    drag.current.panel.style.setProperty('--_drag', `${Math.max(0, event.clientY - drag.current.startY)}px`);
  };

  const end = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    current.samples.push({ time: performance.now(), y: event.clientY });
    delete current.panel.dataset.dragging;
    const dismiss =
      !cancelled &&
      shouldDismiss({ offsetY: event.clientY - current.startY, velocityY: releaseVelocity(current.samples), panelHeight: current.panel.offsetHeight });
    if (dismiss) {
      // The offset stays, so the sheet leaves from where it was let go instead of snapping back first.
      close(id);
    } else {
      current.panel.style.removeProperty('--_drag');
    }
  };

  return (
    <div
      className={styles.handle}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => end(event, false)}
      onPointerCancel={(event) => end(event, true)}
    />
  );
}

Sheet.displayName = 'Sheet';
SheetContent.displayName = 'Sheet.Content';
Sheet.Trigger = Dialog.Trigger;
Sheet.Content = SheetContent;
Sheet.Header = Dialog.Header;
Sheet.Title = Dialog.Title;
Sheet.Description = Dialog.Description;
Sheet.Close = Dialog.Close;
Sheet.Body = Dialog.Body;
Sheet.Footer = Dialog.Footer;
