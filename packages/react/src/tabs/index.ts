export { Tabs } from './Tabs';
export type { TabsActivation, TabsOrientation, TabsProps } from './Tabs';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Tabs.List` is undefined there, `TabsList` is not.
export { TabsList, TabsTab, TabsPanel } from './Tabs';
