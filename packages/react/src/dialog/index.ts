import { Dialog } from './Dialog';

export { Dialog, DialogSystem } from './Dialog';
export type { DialogProps, DialogSystemProps } from './Dialog';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Dialog.Trigger` is undefined there, `DialogTrigger` is not.
export const DialogTrigger = Dialog.Trigger;
export const DialogContent = Dialog.Content;
export const DialogHeader = Dialog.Header;
export const DialogTitle = Dialog.Title;
export const DialogDescription = Dialog.Description;
export const DialogClose = Dialog.Close;
export const DialogBody = Dialog.Body;
export const DialogFooter = Dialog.Footer;
