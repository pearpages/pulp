import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Heatmap, createDateString, groupByWeeks, type ContributionData, type Period } from '.';

// A fixed year and a seeded generator, so the matrix screenshots only change when the
// component does. The vendor's own generateMockData is random on every call.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function levelFor(count: number): ContributionData['level'] {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

function contributions(period: Period, seed: number): ContributionData[] {
  const random = seeded(seed);
  const days: ContributionData[] = [];
  for (let day = new Date(period.start); day <= period.end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const count = random() < (weekend ? 0.55 : 0.15) ? 0 : Math.floor(random() * (weekend ? 5 : 12));
    days.push({ date: createDateString(day), count, level: levelFor(count) });
  }
  return days;
}

const year: Period = { start: new Date(2025, 0, 1), end: new Date(2025, 11, 31) };
const yearData = contributions(year, 2025);
const march: Period = { start: new Date(2025, 2, 1), end: new Date(2025, 2, 31) };
const marchData = contributions(march, 3);

const meta = {
  title: 'Components/Data/Heatmap',
  component: Heatmap,
  args: { data: { contribution: yearData, period: year, weeks: groupByWeeks(yearData) }, isReverse: false, locale: 'en-US' },
  argTypes: {
    data: { control: false },
    labels: { control: false },
    locale: { control: 'inline-radio', options: ['en-US', 'ca', 'fr', 'ja'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Heatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The first stop is the first Sunday in the period: the table runs one row per weekday.
    await userEvent.tab();
    await expect(canvasElement.ownerDocument.activeElement).toHaveAttribute('data-date', '2025-01-05');
    await expect(canvas.getAllByRole('button')).toHaveLength(365);
  },
};

/** One row per week, weekdays as columns: the shape for a month in a narrow column. */
export const Reversed: Story = {
  args: { isReverse: true, data: { contribution: marchData, period: march, weeks: groupByWeeks(marchData) } },
};

/** Catalan runs weeks Monday to Sunday: `weekStartsOn` goes to `groupByWeeks` with the locale, and the labels translate the rest. */
export const MondayStart: Story = {
  args: {
    locale: 'ca',
    labels: {
      less: 'Menys',
      more: 'Més',
      level: (level) => `Nivell ${level}`,
      noContributions: 'Cap contribució',
      contributions: (n) => (n === 1 ? '1 contribució' : `${n} contribucions`),
    },
    data: { contribution: yearData, period: year, weeks: groupByWeeks(yearData, { weekStartsOn: 1 }) },
  },
  play: async ({ canvasElement }) => {
    // Monday first, named in Catalan.
    const firstRow = within(canvasElement).getByRole('table').querySelector('tbody tr') as HTMLElement;
    await expect(within(firstRow).getAllByRole('cell')[0]).toHaveTextContent(/^dl/);
  },
};

const matrix = (
  <div className="sb-grid">
    <Heatmap data={{ contribution: yearData, period: year, weeks: groupByWeeks(yearData) }} />
    <Heatmap isReverse data={{ contribution: marchData, period: march, weeks: groupByWeeks(marchData) }} />
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
