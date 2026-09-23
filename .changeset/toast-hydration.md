---
'@pearpages/pulp-react': patch
---

`ToastProvider` no longer breaks hydration. Under server rendering (Next.js), the first client render portalled the notifications region while the server had rendered nothing there, so React discarded the server HTML and re-rendered the whole app on every page load. The region now mounts one commit after hydration; no toast can be fired before then, so nothing is lost. `DialogSystem` was checked the same way and was already safe. Both are covered by a server-render-then-hydrate test.
