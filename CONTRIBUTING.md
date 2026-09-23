# Contributing to pulp

Thanks for looking. The full guide, including how to add a component step by step, is the
[Contributing page](https://pulp.pearpages.com/?path=/docs/contributing--docs) on the docs site.
The short version:

- **Read first:** [`PRINCIPLES.md`](PRINCIPLES.md) (why), [`architecture.md`](architecture.md) (how
  it fits together), [`CLAUDE.md`](CLAUDE.md) (the rules CI enforces; they apply to people and coding
  agents alike).
- **Set up:** Node 22 (`.nvmrc`) and pnpm 11 (`mise.toml`), then `pnpm install`.
- **Before a PR:** `pnpm verify` runs everything CI runs, in the same order.
- **New component:** `pnpm --filter @pearpages/pulp-react scaffold Name Category`, then follow the page
  above. Every component ships tests with an `axe` check, stories for the four brand × scheme
  combinations, and a token file that reads the semantic tier only.
- **A notable change** gets a changeset: `pnpm changeset`.
- **Screenshots** are rendered in CI only. After an intended visual change, run
  `gh workflow run visual-update.yml --ref <branch>` and review the image diff of the commit it pushes.

Bugs and ideas go to [GitHub issues](https://github.com/pearpages/pulp/issues).
