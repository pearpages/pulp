export { Card } from './Card';
export type { CardPadding, CardProps, CardVariant } from './Card';

// Every part under a flat name too. A Server Component reaches a client entry as a client
// reference, which has no static properties: `Card.Header` is undefined there, `CardHeader` is not.
export { CardHeader, CardBody, CardFooter } from './Card';
