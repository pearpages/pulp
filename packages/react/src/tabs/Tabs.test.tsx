import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tabs } from './Tabs';

function Example(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs defaultValue="one" {...props}>
      <Tabs.List aria-label="Sections">
        <Tabs.Tab value="one">One</Tabs.Tab>
        <Tabs.Tab value="two">Two</Tabs.Tab>
        <Tabs.Tab value="three" disabled>
          Three
        </Tabs.Tab>
        <Tabs.Tab value="four">Four</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one">Panel one</Tabs.Panel>
      <Tabs.Panel value="two">Panel two</Tabs.Panel>
      <Tabs.Panel value="three">Panel three</Tabs.Panel>
      <Tabs.Panel value="four">Panel four</Tabs.Panel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('wires roles, ids and relationships', () => {
    render(<Example />);
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).toHaveAttribute('aria-orientation', 'horizontal');
    const one = screen.getByRole('tab', { name: 'One' });
    const panel = screen.getByRole('tabpanel');
    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(one).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', one.id);
    expect(panel).toHaveTextContent('Panel one');
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
  });

  it('selects on click', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('data-state', 'active');
  });

  it('moves with arrows, wraps, skips disabled, and selects automatically', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Four' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Four' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
  });

  it('only moves focus in manual activation until Enter or Space', async () => {
    render(<Example activation="manual" />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
  });

  it('uses vertical arrows when vertical', async () => {
    render(<Example orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
  });

  it('works controlled', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('one');
      return (
        <Example
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            if (next !== 'four') setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
    await userEvent.click(screen.getByRole('tab', { name: 'Four' }));
    expect(onValueChange).toHaveBeenLastCalledWith('four');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
  });

  it('throws when a part is used outside Tabs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tabs.Tab value="x">x</Tabs.Tab>)).toThrow(/inside <Tabs>/);
    spy.mockRestore();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Example />
        <Example orientation="vertical" defaultValue="two" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
