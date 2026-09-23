export { SegmentedControl } from './SegmentedControl';
export type { SegmentedControlProps } from './SegmentedControl';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `SegmentedControl.Nav` is undefined there, `SegmentedControlNav` is not.
export { SegmentedControlNav, SegmentedControlNavItem } from './SegmentedControl';
