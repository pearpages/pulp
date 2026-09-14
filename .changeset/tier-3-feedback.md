---
"@pearpages/pulp-react": minor
"@pearpages/pulp-tokens": minor
---

Tier 3 feedback: `Spinner` (Button now uses it), `Badge`, `Alert`, `Toast`
(`ToastProvider` + `useToast`), `Progress` and `Skeleton`. The status layer
gains `<tone>-text`, `<tone>-subtle` and `on-<tone>` tokens for every tone
plus a `neutral` tone, with contrast proven by the token tests; bitepals'
error and info fills are one step darker so white text on them meets AA.
`layer.toast` and `size.toast-width` tokens. `@pearpages/pulp-icons` becomes a
runtime dependency of the React package (Alert's default glyphs).
