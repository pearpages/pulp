---
"@pearpages/pulp-react": minor
"@pearpages/pulp-tokens": minor
"@pearpages/pulp-css": minor
---

Add `Dialog` and `DialogSystem`, built on `@pearpages/modals` (new dependency of
the React package). pulp owns the portal element and themes the vendor through
`--dialog-*` tokens, so dialogs follow brand and scheme. New semantic tokens
`color.overlay.backdrop` and `shadow.overlay`. The CSS package adds a `vendor`
cascade layer for third-party stylesheets.
