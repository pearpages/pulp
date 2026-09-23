export { Menu } from './Menu';
export type { MenuItemTone, MenuPlacement, MenuProps } from './Menu';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Menu.Trigger` is undefined there, `MenuTrigger` is not.
export { MenuTrigger, MenuContent, MenuItem, MenuSeparator } from './Menu';
