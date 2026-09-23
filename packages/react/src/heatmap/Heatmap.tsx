import type { ComponentProps } from 'react';
import { ContributionHeatmap } from '@pearpages/heatmap';
import { classes } from '../internal/classes';
import styles from './Heatmap.module.css';

export type HeatmapProps = ComponentProps<typeof ContributionHeatmap>;

/**
 * A GitHub-style contribution calendar: one square per day, coloured by a level the caller
 * assigns, over a period of weeks. It is `@pearpages/heatmap` with pulp's tokens mapped onto
 * it, so the cells take the brand's sequential data scale (`--color-data-sequential-*`) and
 * the card follows the brand and `data-scheme` (decision record 009). It holds no state and
 * calls no hook, so it renders on the server.
 *
 * Build the data with the helpers this entry re-exports: `groupByWeeks(contribution,
 * { weekStartsOn })` for the weeks, `getLastYearPeriod()` or a `Period` of local dates for the
 * range. Dates are `YYYY-MM-DD` strings naming local calendar days.
 *
 * @status experimental
 * @category Data
 * @accessibility A `<table>` of days. Every day inside the period is focusable (`role="button"`, in the tab order) and named by its tooltip, such as "Mon, Jan 1, 2024: 3 contributions", so the date is announced with the count; `locale` and `labels` translate that sentence. The days that pad the first and last week draw nothing and are hidden from assistive technology. On screen, colour alone carries the level, so say what the levels mean in text nearby.
 * @do Assign `level` yourself from your counts: the component never derives it.
 * Pass `weekStartsOn: 1` to `groupByWeeks` when `locale` starts weeks on Monday.
 * @dont Rely on the colours being read: the levels mean only what the text around them says.
 * Build a `Period` from `new Date('YYYY-MM-DD')`: that is UTC midnight and loses a day west of Greenwich.
 */
export function Heatmap({ className, ...rest }: HeatmapProps) {
  return <ContributionHeatmap {...rest} className={classes(styles.root, className)} />;
}

Heatmap.displayName = 'Heatmap';
