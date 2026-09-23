---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

New `Heatmap` (`@pearpages/pulp-react/heatmap`, Data): a GitHub-style contribution calendar built on `@pearpages/heatmap`, themed by pulp's tokens and following brand and `data-scheme`. Import `@pearpages/heatmap/styles.css` into the vendor layer when you use it. The entry re-exports the data helpers (`groupByWeeks`, `createDateString`, `parseDateString`, `getLastYearPeriod`, `getLastMonthPeriod`) and their types.

New semantic tokens `--color-data-sequential-0` … `-4` in both brands: a sequential scale on the brand's own hue for density data, inverted in dark so more is always brighter (decision record 009).
