import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Inline } from '../inline';
import { Chip } from './Chip';

const meta = {
  title: 'Components/Actions/Chip',
  component: Chip,
  args: { children: 'Vegan', size: 'md', tone: 'neutral', onSelectedChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tone: { control: 'select', options: ['neutral', 'action'] },
    ref: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Toggle: Story = {
  args: { defaultSelected: false },
  play: async ({ args, canvasElement }) => {
    const chip = within(canvasElement).getByRole('button', { name: 'Vegan' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith(true);
  },
};

export const Action: Story = { args: { tone: 'action', defaultSelected: true } };

export const Filters: Story = {
  args: { onSelectedChange: undefined },
  render: (args) => (
    <Inline gap={2} role="group" aria-label="Diet">
      {['Vegan', 'Vegetarian', 'Gluten free', 'Halal'].map((diet, index) => (
        <Chip {...args} key={diet} defaultSelected={index === 0}>
          {diet}
        </Chip>
      ))}
    </Inline>
  ),
};

function Tags() {
  const [tags, setTags] = useState(['tapas', 'natural wine', 'terrace']);
  return (
    <Inline gap={2}>
      {tags.map((tag) => (
        <Chip key={tag} onRemove={() => setTags(tags.filter((other) => other !== tag))}>
          {tag}
        </Chip>
      ))}
    </Inline>
  );
}

export const Removable: Story = {
  args: { onSelectedChange: undefined },
  render: () => <Tags />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label is text here; the only control is the remove button, named after its chip.
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove natural wine' }));
    await expect(canvas.queryByText('natural wine')).toBeNull();
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

export const ToggleAndRemove: Story = {
  args: { defaultSelected: true, onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Vegan' });
    const remove = canvas.getByRole('button', { name: 'Remove Vegan' });
    // Two tab stops, side by side: not a button inside a button.
    await expect(toggle.contains(remove)).toBe(false);
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.tab();
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledOnce();
    await expect(args.onSelectedChange).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true, defaultSelected: false, onRemove: fn() } };

const sizes = ['sm', 'md', 'lg'] as const;
const tones = ['neutral', 'action'] as const;
const matrix = (
  <div className="sb-grid">
    {tones.map((tone) => (
      <Inline gap={2} align="center" key={tone}>
        {sizes.map((size) => (
          <Chip key={size} tone={tone} size={size} selected={false}>
            {size}
          </Chip>
        ))}
        <Chip tone={tone} selected>
          selected
        </Chip>
        <Chip tone={tone} selected onRemove={() => {}}>
          both
        </Chip>
        <Chip tone={tone} onRemove={() => {}}>
          removable
        </Chip>
        <Chip tone={tone} selected={false} disabled>
          disabled
        </Chip>
      </Inline>
    ))}
  </div>
);

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
  render: () => matrix,
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
