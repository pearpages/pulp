import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Text } from './Text';

describe('Text', () => {
  it('renders a paragraph by default with its variants on the DOM', () => {
    render(<Text>Body</Text>);
    const el = screen.getByText('Body');
    expect(el.tagName).toBe('P');
    expect(el).toHaveAttribute('data-size', 'md');
    expect(el).toHaveAttribute('data-weight', 'regular');
    expect(el).toHaveAttribute('data-tone', 'default');
    expect(el).toHaveAttribute('data-family', 'body');
    expect(el).not.toHaveAttribute('data-truncate');
  });

  it('renders the requested element and variants', () => {
    render(
      <Text as="span" size="xs" weight="semibold" tone="faint" family="mono" align="center" truncate>
        Meta
      </Text>,
    );
    const el = screen.getByText('Meta');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('data-size', 'xs');
    expect(el).toHaveAttribute('data-weight', 'semibold');
    expect(el).toHaveAttribute('data-tone', 'faint');
    expect(el).toHaveAttribute('data-family', 'mono');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-truncate');
  });

  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text ref={ref} className="extra">
        x
      </Text>,
    );
    expect(ref.current?.className.split(' ')).toEqual(expect.arrayContaining(['text', 'extra']));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Text>Default</Text>
        <Text tone="muted">Muted</Text>
        <Text tone="faint">Faint</Text>
        <Text as="small">Small print</Text>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
