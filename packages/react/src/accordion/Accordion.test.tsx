import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Accordion } from './Accordion';

function Example(props: Partial<React.ComponentProps<typeof Accordion>>) {
  return (
    <Accordion {...props}>
      <Accordion.Item value="tokens">
        <Accordion.Trigger>Tokens</Accordion.Trigger>
        <Accordion.Panel>Tokens are the product.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="css">
        <Accordion.Trigger>CSS</Accordion.Trigger>
        <Accordion.Panel>Native CSS, no runtime.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="react" disabled>
        <Accordion.Trigger>React</Accordion.Trigger>
        <Accordion.Panel>One renderer.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders headings with buttons controlling labelled regions', () => {
    render(<Example defaultValue="tokens" />);
    const trigger = screen.getByRole('button', { name: 'Tokens' });
    expect(trigger.closest('h3')).not.toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const region = screen.getByRole('region', { name: 'Tokens' });
    expect(trigger).toHaveAttribute('aria-controls', region.id);
    expect(region).toHaveTextContent('Tokens are the product.');
    expect(screen.getByRole('button', { name: 'CSS' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'CSS' })).toBeNull();
    expect(screen.getByRole('button', { name: 'React' })).toBeDisabled();
  });

  it('single mode opens one at a time and can collapse', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example defaultValue="tokens" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'CSS' }));
    expect(screen.getByRole('button', { name: 'CSS' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Tokens' })).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('css');
    await user.click(screen.getByRole('button', { name: 'CSS' }));
    expect(screen.getByRole('button', { name: 'CSS' })).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('');
  });

  it('single non-collapsible keeps one open; multiple allows several', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Example defaultValue="tokens" collapsible={false} />);
    await user.click(screen.getByRole('button', { name: 'Tokens' }));
    expect(screen.getByRole('button', { name: 'Tokens' })).toHaveAttribute('aria-expanded', 'true');
    unmount();
    const onValueChange = vi.fn();
    render(<Example type="multiple" defaultValue={['tokens']} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'CSS' }));
    expect(screen.getAllByRole('region')).toHaveLength(2);
    expect(onValueChange).toHaveBeenLastCalledWith(['tokens', 'css']);
  });

  it('moves between triggers with arrows, Home and End, skipping disabled', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tokens' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'CSS' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Tokens' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'CSS' })).toHaveFocus();
  });

  it('works controlled with a custom heading level', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | string[]>('css');
      return <Example value={value} onValueChange={setValue} headingLevel={2} />;
    }
    render(<Controlled />);
    expect(screen.getByRole('button', { name: 'CSS' }).closest('h2')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Tokens' }));
    expect(screen.getByRole('region', { name: 'Tokens' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Example type="multiple" defaultValue={['tokens', 'css']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
