import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Chip } from './Chip';

describe('Chip', () => {
  it('is a toggle button when it has a selected state: aria-pressed, Space and click', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Chip defaultSelected={false} onSelectedChange={onSelectedChange}>Vegan</Chip>);
    const chip = screen.getByRole('button', { name: 'Vegan' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');

    await user.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip.parentElement).toHaveAttribute('data-selected');
    expect(onSelectedChange).toHaveBeenLastCalledWith(true);

    chip.focus();
    await user.keyboard(' ');
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });

  it('controlled: reports the next state and waits for the prop', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const { rerender } = render(<Chip selected={false} onSelectedChange={onSelectedChange}>Vegan</Chip>);
    await user.click(screen.getByRole('button'));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<Chip selected onSelectedChange={onSelectedChange}>Vegan</Chip>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('an onClick that prevents default cancels the toggle', async () => {
    const user = userEvent.setup();
    render(<Chip defaultSelected={false} onClick={(event) => event.preventDefault()}>Vegan</Chip>);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('with only onClick it is a plain button, without aria-pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Near me</Chip>);
    const chip = screen.getByRole('button', { name: 'Near me' });
    expect(chip).not.toHaveAttribute('aria-pressed');
    await user.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('removable: a second button beside the label, never inside it, named after the chip', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onSelectedChange = vi.fn();
    render(<Chip selected onSelectedChange={onSelectedChange} onRemove={onRemove}>Vegan</Chip>);
    const group = screen.getByRole('group', { name: 'Vegan' });
    const toggle = screen.getByRole('button', { name: 'Vegan' });
    const remove = screen.getByRole('button', { name: 'Remove Vegan' });
    expect(toggle).not.toContainElement(remove);
    expect(group).toContainElement(toggle);
    expect(group).toContainElement(remove);

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onSelectedChange).not.toHaveBeenCalled();

    // Both are tab stops, in order.
    toggle.focus();
    await user.tab();
    expect(remove).toHaveFocus();
  });

  it('removable but not pressable: the label is text, the only button removes, and there is no group', () => {
    render(<Chip onRemove={() => {}} removeLabel="Quitar">tapas</Chip>);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Quitar tapas' })).toBeInTheDocument();
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByText('tapas').tagName).toBe('SPAN');
  });

  it('disabled disables both controls and blocks the toggle', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onRemove = vi.fn();
    render(<Chip disabled defaultSelected={false} onSelectedChange={onSelectedChange} onRemove={onRemove}>Vegan</Chip>);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled');
  });

  it('exposes size and tone as data; className on the root, ref and the rest on the button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Chip selected={false} size="lg" tone="action" className="mine" name="diet" data-testid="chip" ref={ref}>Vegan</Chip>);
    const button = screen.getByTestId('chip');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('name', 'diet');
    expect(button).toHaveAttribute('type', 'button');
    const root = button.parentElement!;
    expect(root).toHaveClass('root', 'mine');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-tone', 'action');
    expect(root).toHaveAttribute('data-interactive');
  });

  it('a removed chip leaves the list when the caller drops it', async () => {
    const user = userEvent.setup();
    function Tags() {
      const [tags, setTags] = useState(['tapas', 'wine']);
      return tags.map((tag) => <Chip key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>{tag}</Chip>);
    }
    render(<Tags />);
    await user.click(screen.getByRole('button', { name: 'Remove tapas' }));
    expect(screen.queryByText('tapas')).toBeNull();
    expect(screen.getByText('wine')).toBeInTheDocument();
  });

  it('has no accessibility violations in every state', async () => {
    const { container } = render(
      <div>
        <Chip selected={false}>Off</Chip>
        <Chip selected>On</Chip>
        <Chip selected tone="action" size="sm">Action</Chip>
        <Chip onClick={() => {}} size="lg">Plain</Chip>
        <Chip onRemove={() => {}}>Removable</Chip>
        <Chip selected onRemove={() => {}}>Both</Chip>
        <Chip disabled selected={false} onRemove={() => {}}>Disabled</Chip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
