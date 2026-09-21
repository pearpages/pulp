---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

Toast: `placement="bottom-center"`, for an app with a bottom navigation. The distance from the top or the bottom edge is now its own token, `--toast-offset-block`, separate from the inline `--toast-offset`, and the safe-area inset (`env(safe-area-inset-top)` / `-bottom`) is added to it, so a toast clears the notch and the home indicator; raise `--toast-offset-block` by the height of your navigation. If you had overridden `--toast-offset` to move the stack vertically, override `--toast-offset-block` too: both default to the same value.
