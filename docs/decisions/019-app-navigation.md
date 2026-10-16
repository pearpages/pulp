# 019. App navigation is three components: NavList, TabBar and the AppShell that places them

Date: 2026-10-16. Status: accepted. It adds `NavList` and `TabBar` (Navigation) and `AppShell` (Layout),
the semantic tokens `layer.navigation` and `size.sidebar-width`, and one breakpoint, 48rem.

## Context

bitepals built its navigation in its own Tailwind patterns: `AppShell`, `Sidebar`, `BottomNav`,
`NavMenu` and `NavBadge`. The sidebar shows the app's places on a wide screen, the bottom bar the same
places on a phone, and the shell switches between them with CSS at 768px. That switch is right: it
renders both and hides one, so the server and the first client render match. The rest broke standards
a screen reader user meets:

- `NavMenu` marked page links as `role="menu"` and `menuitem`, which promises arrow keys it did not have.
- The sidebar's section links carried `aria-expanded`, though following one loads a page.
- The landmark's name sat on an `aside` around an unnamed `nav`.
- `NavBadge` was a live region, so a dot that was there when the page loaded could be announced as news.
- Sizes and colours were literals (`text-white`, `text-[10px]`, a `64px` pad under the page that guessed
  the bar's height), so a brand never fully reached it.

## Decision

- **Two navigation components, not one that changes shape.** The two places lists differ: the bar has a
  raised centre button, the sidebar shows a section's own pages. `NavList` is a vertical list of links
  (`current: 'page' | 'section'`, `sub`, `icon`, `badge`); `TabBar` is three to five links docked to the
  bottom edge (`current`, `icon`, `badge`, `prominent`). Both are a named `nav` holding a list of links:
  no menu or tab roles, Tab moves link by link. A section whose sub-page is shown has
  `aria-current="true"`, as GOV.UK's service navigation does. Neither holds a router or state: the app
  says which link is current and passes its link with `asChild`, so both render on the server.
- **AppShell places slots and knows nothing about users.** `header`, `sidebar`, `tabBar`, `footer` and the
  page; a slot left out takes no room. Signing in and out stays in the app, which passes the navigation
  slots or not. There is no `isLoggedIn` prop.
- **One breakpoint, 48rem, written in AppShell's stylesheet.** Below it the tab bar, from it the sidebar.
  A media query takes no custom property, so it cannot be a token. It is bitepals' 768px.
- **The shell publishes the bar's height.** `--app-shell-inset-block-end` is TabBar's height, its border
  and the safe area, set on the shell (the page or the footer pads by it) and on `:root` through `:has()`,
  because toasts render at the end of `body`, outside the shell. Toast reads it.
- **A tab bar sits on its own layer**, `layer.navigation` (900): above the page, below dialogs (the vendor
  uses 1000), toasts and popovers.

## Consequences

- bitepals deletes its five Tailwind navigation files and renders NavList, TabBar and AppShell from its
  own section config and active-link logic.
- `:has()` is past the support floor in Firefox 120. There, toasts keep the plain safe-area offset and
  can sit over the tab bar; the page itself still clears it, because the shell's own padding does not
  use `:has()`.
- AppShell reads TabBar's tokens to compute the inset. Another bar in the `tabBar` slot must be the same
  height or set `--app-shell-inset-block-end` itself.
- A fourth layer value and a sidebar width are now public semantic tokens.

## Revisit when

- An app needs a third layout (a rail of icons between phone and desktop): that is a NavList variant,
  not a new breakpoint system.
- Firefox 121 becomes the floor: the `:has()` note goes.
