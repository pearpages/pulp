import type { ComponentProps } from 'react';
import { Dialog, type DialogProps } from '../dialog';
import { classes } from '../internal/classes';
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
 * @accessibility Dialog's: `role="dialog"` with `aria-modal`, named by `Sheet.Title` and described by `Sheet.Description`; focus moves in on open, is trapped, and returns to the trigger on close; Escape and the backdrop dismiss it; the page behind is inert. Docking changes the layout only, never the semantics.
 * @do Always render a `Sheet.Title`.
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
function SheetContent({ placement = 'end', className, ...rest }: SheetContentProps) {
  return <Dialog.Content {...rest} placement={placement} className={classes(styles.content, className)} />;
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
