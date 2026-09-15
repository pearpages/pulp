import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  args: { page: 5, count: 12, siblings: 1, boundaries: 1, size: 'md', onPageChange: fn() },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: React.ComponentProps<typeof Pagination>) {
  const [page, setPage] = useState(props.page);
  return (
    <Pagination
      {...props}
      page={page}
      onPageChange={(next) => {
        setPage(next);
        props.onPageChange?.(next);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(6);
    await expect(canvas.getByRole('button', { name: 'Page 6' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 12' }));
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

export const FewPages: Story = { args: { page: 2, count: 4 } };
export const Links: Story = { args: { page: 3, count: 20, getHref: (page: number) => `?page=${page}` } };
export const Small: Story = { args: { size: 'sm' } };

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
