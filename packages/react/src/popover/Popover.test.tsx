import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Popover } from './Popover';

function Example(props: Partial<React.ComponentProps<typeof Popover>>) {
  return (
    <>
      <Popover {...props}>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content title="Filter results">
          <label>
            Query <input />
          </label>
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover>
      <button type="button">Outside</button>
    </>
  );
}

describe('Popover', () => {
  it('wires the trigger and opens a named dialog with focus inside', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Filter results' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    await waitFor(() => expect(screen.getByLabelText('Query')).toHaveFocus());
  });

  it('closes on Escape, on Close, and on a click outside, returning focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Example open={open} onOpenChange={setOpen} />
          <span>{open ? 'open' : 'closed'}</span>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByText('open')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('supports asChild triggers and throws outside Popover', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger asChild>
          <a href="#x">Link trigger</a>
        </Popover.Trigger>
        <Popover.Content aria-label="Panel">Hi</Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('link', { name: 'Link trigger' }));
    expect(screen.getByRole('dialog', { name: 'Panel' })).toBeInTheDocument();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Popover.Close>x</Popover.Close>)).toThrow(/inside <Popover>/);
    spy.mockRestore();
  });

  it('has no accessibility violations while open', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
