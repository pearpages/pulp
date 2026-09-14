import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Modal as VendorModal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalSystem as VendorSystem,
  ModalTitle,
  ModalTrigger,
  type ModalProps,
} from '@pearpages/modals';
import styles from './Dialog.module.css';

export type DialogProps = ModalProps;

export interface DialogSystemProps extends Omit<ComponentProps<typeof VendorSystem>, 'container'> {
  children: ReactNode;
}

/**
 * Mount once near the app root. Owns the portal element every dialog renders
 * into and sets the vendor's `--modal-*` variables on it from pulp's
 * `--dialog-*` tokens, so backdrop, surface, type and motion follow the
 * current brand and scheme. Because the variables sit on an ancestor of the
 * dialog, they win over the vendor stylesheet regardless of cascade layers
 * or import order.
 */
export function DialogSystem({ children, ...rest }: DialogSystemProps) {
  // Created detached during the first render (no DOM mutation yet, so it is
  // safe to do here and needs no state update); attached and removed in the
  // effect. Undefined on the server, where the vendor falls back to its default.
  const [container] = useState<HTMLDivElement | undefined>(() => {
    if (typeof document === 'undefined') return undefined;
    const element = document.createElement('div');
    element.className = styles.root ?? '';
    element.dataset.pulpDialogs = '';
    return element;
  });

  useEffect(() => {
    if (!container) return;
    document.body.append(container);
    return () => container.remove();
  }, [container]);

  return (
    <VendorSystem {...rest} container={container}>
      {children}
    </VendorSystem>
  );
}

/**
 * An accessible modal dialog: focus trap, inert page, Escape and backdrop
 * dismissal, stacking. Built on `@pearpages/modals`; pulp adds the theming and
 * the compound API (`Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`,
 * `Dialog.Title`, `Dialog.Description`, `Dialog.Close`, `Dialog.Body`,
 * `Dialog.Footer`). The trigger is a sibling of the dialog, not a child: a
 * dialog's children render only while it is open. Use pulp's `Button` for
 * actions. Requires `DialogSystem` above it and the vendor stylesheet
 * `@pearpages/modals/styles.css`.
 */
export function Dialog(props: DialogProps) {
  return <VendorModal {...props} />;
}

Dialog.displayName = 'Dialog';
Dialog.Trigger = ModalTrigger;
Dialog.Content = ModalContent;
Dialog.Header = ModalHeader;
Dialog.Title = ModalTitle;
Dialog.Description = ModalDescription;
Dialog.Close = ModalClose;
Dialog.Body = ModalBody;
Dialog.Footer = ModalFooter;
