---
'@pearpages/pulp-react': minor
'@pearpages/pulp-tokens': minor
---

TabBar: an app's primary navigation on a phone, three to five tabs docked to the bottom edge. A labelled `nav` with a list of links (not a `tablist`), the current tab `aria-current="page"`, an icon over a visible label, a badge on the icon's corner, one `prominent` tab drawn as a raised round button, and the safe-area inset under it. `position="static"` leaves it in the flow. No hooks, so it renders on the server. Tokens: `--tab-bar-*`, and a new semantic `--layer-navigation` (900, below dialogs, toasts and popovers).
