---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

EmptyState (experimental): what a list, a search or a page shows instead of its content. `title` (a real heading at `headingLevel`), `description`, a decorative `icon` in a tinted disc, one `action`, and `tone` (`neutral`, `error`). Composes Heading, Text and Stack. It announces nothing by itself: pass `role="status"` or `role="alert"` when it replaces content after the user did something. Tokens: `--empty-state-*`.
