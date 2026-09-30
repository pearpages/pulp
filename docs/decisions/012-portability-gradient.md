# 012. Portability is layered: data, DOM, platform

Date: 2026-09-30. Status: accepted. It records a direction: neither renderer below has been
started.

## Context

pulp's tagline is "a design system built to outlive its frameworks", and principle 1 says that when
the next framework arrives, the token and CSS packages do not change. Both read as one guarantee
for the whole system. It is not one, and nothing in the repository said so.

pulp has one renderer today, React. Two more are planned:

- **Web Components**, to prove that the architecture holds outside React and to make adding a
  renderer a known cost.
- **Native iOS and Android**, for apps where a web view is not the answer.

Record 011 found the first crack: the complex widgets' behaviour lives in React hooks, so a second
DOM renderer gets their tokens and CSS and none of their accessibility. Its answer, Ark UI on Zag's
DOM state machines, closes that crack for DOM renderers only. What a native renderer inherits was
written down nowhere.

## Decision

**The promise in principle 1 is layered, and pulp states it that way.** Three rings, each crossing
to fewer renderers than the one below it:

| Ring | What is in it | React | Web Components | Native (iOS, Android) |
| --- | --- | --- | --- | --- |
| **Data** | DTCG token JSON; the component manifest as a spec | yes | yes | yes, through a generated output |
| **DOM** | stylesheets, `data-*` state, simple components, Zag-driven widgets | yes | yes | no: rewritten on the same tokens |
| **Platform** | accessibility of native controls | n/a | n/a | built fresh, per component |

- **Data crosses everywhere, unchanged.** The JSON is the source; each platform gets an output
  generated from it. `./native` already does this for React Native (record 005); Swift or Kotlin
  outputs would be more outputs of the same build, with the same drift check. The manifest crosses
  too, as a specification: component names, variants, props and the `@accessibility` notes say what a
  native `Button` must be, even though no line of its code carries over.
- **The DOM ring crosses to renderers that have a DOM.** The stylesheets, the cascade layers and the
  `data-*` contract are web technology; a Web Components renderer reuses them as they are, and the
  simple components (Button, Badge, Card, Pagination) are markup plus a stylesheet. Complex widgets
  join this ring only once they run on Zag (record 011). Until then a React Aria widget reaches
  no second renderer at all, and DataGrid stays React-only by 011's own exception.
- **The platform ring does not cross.** On iOS and Android, VoiceOver and TalkBack read the
  platform's own controls and accessibility APIs. A native renderer builds that fresh, on native
  components, and checks it with those screen readers. That is the cost of a native renderer, and it
  is budgeted as new work, never assumed to be inherited.

**Rejected: one behaviour layer for every platform** (React Native Web, or an accessibility
abstraction shared between the DOM and native). It would pull the web widgets down to what both
sides can express, and would fight each platform's conventions where users notice them most:
focus order, gestures, rotor navigation. The web keeps the best DOM behaviour layer available, and
native gets the platform's.

This is a clarification of principle 1, not a retreat from it. The tokens, the part that decides
what a brand is, stay framework-agnostic end to end. The promise narrows only where the technology
does.

## Consequences

- Principle 1 names the three rings and points here; principle 4 names the DOM as the behaviour
  layer's floor. The tagline stays: it is true at the bottom, and principle 1 now says how far up.
- Every principle belongs to a ring. Tiers (§3), brands and schemes as data (§2) and "brands never
  break" (§9) hold for every renderer. Native CSS (§4) and state on the DOM (§5) are DOM-ring
  promises; a native renderer honours their intent (state that can be read, overrides without a
  fight) in its platform's terms.
- The manifest is part of the portable ring, which raises the bar on its JSDoc: `@accessibility`
  has to describe the behaviour, not the React Aria call, so a native implementer can build from it
  (principle 11).
- The Web Components renderer is the proof of the DOM ring. It is also what record 011 waits
  for to decide DataGrid and the five hand-rolled widgets.
- Nothing is built, deprecated or promised by this record: no package, no API, no date.

## Revisit when

- The Web Components renderer starts: it tests the DOM ring for real, and anything that fails to
  cross is recorded here.
- A native renderer starts: decide React Native or Swift and Kotlin, and which token outputs it needs
  beyond `./native` (shadows, type sizes, motion, all left out by record 005).
- Zag, or anything comparable, ships a machine that drives native accessibility: the platform ring
  would then be worth re-examining.
