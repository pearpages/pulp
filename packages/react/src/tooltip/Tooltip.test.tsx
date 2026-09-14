import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('shows on focus immediately and describes the trigger while visible', async () => {
    render(
      <Tooltip content="Saves to the cloud">
        <button type="button">Save</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(button).not.toHaveAttribute('aria-describedby');
    act(() => button.focus());
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Saves to the cloud');
    expect(button).toHaveAccessibleDescription('Saves to the cloud');
    act(() => button.blur());
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows on hover after the delay and hides on leave', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" delay={0}>
        <button type="button">Hover</button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.unhover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('hides on Escape and keeps the child handlers', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(
      <Tooltip content="Tip">
        <button type="button" onFocus={onFocus}>
          Key
        </button>
      </Tooltip>,
    );
    await user.tab();
    expect(onFocus).toHaveBeenCalled();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('has no accessibility violations while open', async () => {
    render(
      <Tooltip content="Detail">
        <button type="button">Named</button>
      </Tooltip>,
    );
    act(() => screen.getByRole('button').focus());
    await screen.findByRole('tooltip');
    // A floating layer is not page content: the landmark ("region") rule does not apply to it.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
