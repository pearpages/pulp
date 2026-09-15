---
"@pearpages/pulp-react": minor
---

The component manifest now carries each component's `status`
(`experimental | stable | deprecated`), an `accessibility` note and `do`/`dont`
bullets, taken from JSDoc tags that the build requires. The Storybook renders a
Docs page per component and a Status page from it. New guardrails: a
bundle-size budget per entry (`pnpm check:size`; leaf entries 2.1 kB brotli,
barrel 16.5 kB, stylesheet 9 kB) and a test that every `--modal-*` variable
Dialog maps is declared by the installed `@pearpages/modals` stylesheet.
