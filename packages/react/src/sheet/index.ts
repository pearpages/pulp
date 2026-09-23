import { Sheet } from './Sheet';

export { Sheet } from './Sheet';
export type { SheetContentProps, SheetPlacement, SheetProps } from './Sheet';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Sheet.Trigger` is undefined there, `SheetTrigger` is not.
export const SheetTrigger = Sheet.Trigger;
export const SheetHeader = Sheet.Header;
export const SheetTitle = Sheet.Title;
export const SheetDescription = Sheet.Description;
export const SheetClose = Sheet.Close;
export const SheetBody = Sheet.Body;
export const SheetFooter = Sheet.Footer;
export { SheetContent } from './Sheet';
