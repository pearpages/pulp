---
'@pearpages/pulp-react': patch
---

Button (and everything built on it: IconButton, Alert, Pagination, Toast) now declares `-webkit-user-select: none` next to `user-select: none`. Safari has no unprefixed `user-select`, so on the declared support floor the label stayed selectable. Found by the new support-floor check.
