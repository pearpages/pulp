# 015. `"use client"` is decided from source by a script, not written by hand

Date: 2026-09-30. Status: accepted. It records a choice made on 2026-09-18 for bitepals, the
first App Router consumer, written down afterwards; nothing here changes the build. Second of three
build-versus-buy records; the rule they share is in record 014.

## Context

A React Server Component can import a module only if that module runs where React has no state,
effects or context. A client module has to say so with `"use client"` on its first line, or an
App Router page that imports it fails. bitepals hit exactly that, "Named export 'createContext' not
found"; Tabs, imported under the `react-server` condition, is how `test:dist` reproduces it today. pulp ships one entry per component
(`@pearpages/pulp-react/button`), so the directive is a per-entry fact. At the time 26 of the 44
entries needed it, the barrel included, and 18 leaves (Text, Button, Card…) did not and should
render on the server as they are. Today's split is the Status page's "Renders in" column.

Whether an entry needs the directive is not a property of the component's own file. It is a
property of everything the entry reaches: a leaf with no hook becomes a client module the day an
internal helper it imports gains a `useRef`. The usual ways to put the directive in place:

1. **Write it by hand** at the top of each client component's source, and get the bundler to keep
   it. Whether a directive written in a source module survives bundling depends on the bundler and
   its settings; with tsup that means a plugin or a post-build step anyway.
2. **Stamp every entry** with tsup's `banner`. One line of config, always correct for client code,
   and wrong for the server-safe leaves: they become client references, which a Server Component
   can render but not use as a normal module. A client reference carries only named exports, so
   `Menu.Trigger`-style parts do not reach it; that is why pulp also exports every part flat
   (`MenuTrigger`), and why no entry should be a client reference without needing to be.

## Decision

**`packages/react/scripts/client-entries.mjs` decides per entry from source, and `pnpm build`
stamps `"use client";` onto the built entries that need it. `test:dist` proves the result on the
built package.**

The script walks each entry's relative imports and marks it client when any module it reaches
uses a client-only React API (`useState`, `useEffect`, `useRef`, `createContext`, `createPortal`
and the rest of React's non-server set; not `useId`, which the server build has) or imports a
package listed in `CLIENT_PACKAGES`. It stamps the directive on the first line without a line break,
so source maps stay true. Chunks need none: esbuild puts a shared module in the chunk of exactly
the entries that reach it, so a server-safe entry never imports client code.

Why this over the standard options:

- **The fact has one source, the code** (principle 11). A hand-written directive is a second
  statement of something the imports already say, and it goes stale silently the day a helper
  gains a hook. The analysis follows the imports, so the result moves with them.
- **The server-safe leaves stay server-safe**, which is what a consumer on the App Router asked
  for. Option 2 gives that up for every entry to save one script. Option 1 would still need a
  post-build step to keep the directive, which is most of what the script is, plus a marker per
  file that someone has to keep true by hand.
- **It is proven, not trusted.** `test:dist` asserts the directive per entry, asserts that a named
  list of leaves stays server-safe, and imports every server-safe entry under
  `node --conditions=react-server`, where a client entry without the directive fails as it would
  in an app. Adding a hook to a leaf moves it to the client, and the named list makes that a
  decision, not an accident. The manifest carries `client` per component, and the Status page
  shows it ("Renders in").

## Consequences

The costs, which are the price of a bespoke tool:

- **`CLIENT_PACKAGES` is a hand-maintained list**, and it is the analysis's one blind spot. The
  script does not look inside `node_modules`, so a vendor counts as client only if it is listed
  (today `react-aria-components`, `@pearpages/modals`, `@floating-ui/react-dom`,
  `@internationalized/date`, `react-dom`). A vendor that does not need to be listed stays off:
  `@pearpages/heatmap` renders without hooks, so Heatmap is server-safe, correctly. Nothing
  checks that judgement when a vendor is added; the `react-server` import in `test:dist` catches a
  wrong one only if the vendor fails there.
- **Record 011's Slider pilot must extend the list** before its entry can be right:
  `@ark-ui/react`, and the `@zag-js/*` packages if any pulp module imports one directly. The
  matcher compares whole package names (`name` or `name/…`), so `@zag-js/*` means listing each
  package used or teaching the matcher a scope rule. Record 011 already names this step
  ("`scripts/client-entries.mjs` learns `@ark-ui/react`"); this record says why it has to be done
  by hand.
- **It is a text analysis, not a parser.** Imports and React APIs are matched with regular
  expressions. A match in a comment or a string marks an entry client; that errs toward the safe
  side (an extra directive costs server rendering, never correctness). A dynamic `import()` is
  not followed, and the entry list is read from `tsup.config.ts` by pattern. Today's code uses
  neither a dynamic import nor a computed entry; either would need the script taught first.
- About 75 lines to maintain, owned by pulp, with no upstream to take fixes from.

## Revisit when

- tsup (or its successor) keeps module-level directives per entry and computes them from the
  module graph: then drop the script and keep `test:dist` as the proof.
- A vendor is found misclassified, or a second vendor like Ark arrives: consider replacing
  `CLIENT_PACKAGES` with a check that reads the vendor's own `"use client"` markers or its React
  imports, so the list stops being a judgement.
- An entry needs a dynamic import or a computed name: move from regular expressions to the
  TypeScript compiler API, which the manifest build already uses (`react-docgen-typescript`).

Siblings: record 014 (token output, and the rule the three share) and record 016 (the component
manifest, whose `client` field comes from this same analysis).
