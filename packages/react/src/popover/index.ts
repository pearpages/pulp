export { Popover } from './Popover';
export type { PopoverPlacement, PopoverProps } from './Popover';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Popover.Trigger` is undefined there, `PopoverTrigger` is not.
export { PopoverTrigger, PopoverContent, PopoverClose } from './Popover';
