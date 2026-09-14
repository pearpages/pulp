import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card } from './Card';

describe('Card', () => {
  it('renders a section with variant and padding on the DOM', () => {
    render(
      <Card aria-label="Plan">
        <Card.Body>Content</Card.Body>
      </Card>,
    );
    const card = screen.getByRole('region', { name: 'Plan' });
    expect(card.tagName).toBe('SECTION');
    expect(card).toHaveAttribute('data-variant', 'raised');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('renders slots in order with their classes', () => {
    render(
      <Card variant="outlined" padding="lg">
        <Card.Header>Head</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Foot</Card.Footer>
      </Card>,
    );
    const [header, body, footer] = ['Head', 'Body', 'Foot'].map((text) => screen.getByText(text));
    expect(header?.className).toMatch(/header/);
    expect(body?.className).toMatch(/body/);
    expect(footer?.className).toMatch(/footer/);
    expect(header?.compareDocumentPosition(body!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(body?.compareDocumentPosition(footer!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(header?.parentElement).toHaveAttribute('data-padding', 'lg');
  });

  it('makes an interactive section focusable, but not an already focusable child', () => {
    render(
      <>
        <Card interactive aria-label="A">
          <Card.Body>A</Card.Body>
        </Card>
        <Card interactive asChild>
          <a href="/b">B</a>
        </Card>
      </>,
    );
    expect(screen.getByRole('region', { name: 'A' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('link', { name: 'B' })).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute('data-interactive');
  });

  it('renders a link card with asChild, keeping href and adding the card styling', () => {
    render(
      <Card asChild variant="sunken" className="extra">
        <a href="/docs" className="mine">
          <Card.Body>Docs</Card.Body>
        </a>
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-variant', 'sunken');
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['mine', 'card', 'extra']));
  });

  it('forwards refs on root and slots', () => {
    const root = createRef<HTMLElement>();
    const body = createRef<HTMLDivElement>();
    render(
      <Card ref={root}>
        <Card.Body ref={body}>x</Card.Body>
      </Card>,
    );
    expect(root.current?.tagName).toBe('SECTION');
    expect(body.current?.tagName).toBe('DIV');
  });

  it('has no accessibility violations in any variant', async () => {
    const { container } = render(
      <div>
        {(['raised', 'outlined', 'sunken'] as const).map((variant) => (
          <Card key={variant} variant={variant} aria-label={variant}>
            <Card.Header>
              <h2>{variant}</h2>
            </Card.Header>
            <Card.Body>Body text</Card.Body>
            <Card.Footer>Footer</Card.Footer>
          </Card>
        ))}
        <Card asChild interactive>
          <a href="/x">
            <Card.Body>Link card</Card.Body>
          </a>
        </Card>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
