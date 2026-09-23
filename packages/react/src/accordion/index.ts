export { Accordion } from './Accordion';
export type { AccordionHeadingLevel, AccordionProps, AccordionType } from './Accordion';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Accordion.Item` is undefined there, `AccordionItem` is not.
export { AccordionItem, AccordionTrigger, AccordionPanel } from './Accordion';
