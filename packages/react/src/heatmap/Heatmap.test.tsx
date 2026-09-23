import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Heatmap, createDateString, groupByWeeks, type ContributionData, type Period } from '.';

// A fixed fortnight: Wed 3 Jan to Tue 16 Jan 2024, so the Sunday-start weeks pad three days
// before the period and four after it.
const period: Period = { start: new Date(2024, 0, 3), end: new Date(2024, 0, 16) };

function fortnight(): ContributionData[] {
  const days: ContributionData[] = [];
  for (let day = 3; day <= 16; day++) {
    const count = day % 5;
    days.push({ date: createDateString(new Date(2024, 0, day)), count, level: Math.min(count, 4) as ContributionData['level'] });
  }
  return days;
}

function Example(props: Partial<Parameters<typeof Heatmap>[0]>) {
  const contribution = fortnight();
  return <Heatmap data={{ contribution, period, weeks: groupByWeeks(contribution) }} {...props} />;
}

describe('Heatmap', () => {
  it("puts pulp's theming class on the vendor's root, next to the consumer's", () => {
    const { container } = render(<Example className="mine" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('contribution-heatmap', 'mine');
    expect(root?.className).toMatch(/root/);
  });

  it('names every day in the period and only those', () => {
    render(<Example />);
    const days = screen.getAllByRole('button');
    expect(days).toHaveLength(14);
    expect(screen.getByRole('button', { name: 'Wed, Jan 3, 2024: 3 contributions' })).toBeInTheDocument();
  });

  it('reaches the days from the keyboard, row by row, skipping the padding', async () => {
    render(<Example />);
    // The table runs one row per weekday, so the first stop is the first Sunday in the period.
    await userEvent.tab();
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-07');
  });

  it('translates the day names and the sentence through locale and labels', () => {
    const contribution = fortnight();
    render(
      <Heatmap
        locale="ca"
        labels={{ contributions: (n) => `${n} contribucions` }}
        data={{ contribution, period, weeks: groupByWeeks(contribution, { weekStartsOn: 1 }) }}
      />,
    );
    // Monday first, named in Catalan.
    const firstRow = screen.getByRole('table').querySelector('tbody tr');
    expect(within(firstRow as HTMLElement).getAllByRole('cell')[0]).toHaveTextContent(/^dl/);
    expect(screen.getByRole('button', { name: 'dl., 8 de gen. 2024: 3 contribucions' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
