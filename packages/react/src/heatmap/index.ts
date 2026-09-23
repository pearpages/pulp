export { Heatmap } from './Heatmap';
export type { HeatmapProps } from './Heatmap';
// The data helpers the component needs, so a consumer imports one entry. They are the
// vendor's own, re-exported unchanged (decision record 009).
export { groupByWeeks, createDateString, parseDateString, getLastYearPeriod, getLastMonthPeriod } from '@pearpages/heatmap';
export type { ContributionData, Week, Period, HeatmapLabels, GroupByWeeksOptions } from '@pearpages/heatmap';
