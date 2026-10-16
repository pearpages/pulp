---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

AppShell: the frame of an app's pages. Slots for `header`, `sidebar`, `tabBar` and `footer` around the page, which it renders in `main`; a slot left out takes no room, so a signed-out page passes no navigation. From 48rem the sidebar sits beside the page, below it the tab bar docks to the bottom edge, with CSS only. With a tab bar, the page (or the footer) clears it, and `--app-shell-inset-block-end` carries its height, which Toast now reads to stay above the bar. No hooks, so it renders on the server. Record 019. Tokens: `--app-shell-*` and a new semantic `--size-sidebar-width` (15rem).
