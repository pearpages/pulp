---
'@pearpages/pulp-react': patch
---

`Menu` and `Popover` can be server-rendered open. With `defaultOpen` (or a controlled `open` that starts true) their content read `document.body` during the render, so a server render threw. The content now renders closed on the server and opens one commit after hydration, moving focus in as it does after a click.
