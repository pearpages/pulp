# 017. A release is a tag: npm, the site and the Release page together

Date: 2026-10-15. Status: accepted.

## Context

Until now every push to `main` deployed pulp.pearpages.com (`deploy.yml`), and npm got the
packages later, when someone pushed a `vX.Y.Z` tag (`publish.yml`). Between the two, the site
documented whatever `main` held: a component, a prop or a brand a consumer could read about and
not install. The menja brand made the gap concrete: merged, it would have been on the site's brand
toolbar for as long as it took to cut a version.

pulp publishes four packages (`pulp-tokens`, `pulp-css`, `pulp-icons`, `pulp-react`) with
independent versions, so "which tag" needed an answer too. Every tag so far, `v0.1.0` to `v0.6.0`,
carries `pulp-react`'s version: `v0.6.0` shipped tokens 0.5.1, css 0.1.7, icons 0.2.1 and react 0.6.0.

## Decision

1. **`main` is work in progress.** `ci.yml` verifies every push, `main` included. Nothing deploys
   or publishes from a branch.
2. **One tag per release, for the whole monorepo, named `v` + `pulp-react`'s version.** It is the
   package consumers install, the Storybook toolbar shows its version and links to the GitHub Release
   of that name, and `scripts/release-notes.mjs` already writes one Release with a section per
   package whose version changed. Per-package tags (changesets' `@scope/name@x.y.z`) would mean four
   Releases for one change and a toolbar link with no single target.
3. **The tag does the three things, in this order** (`publish.yml`, four jobs, each needing the one
   before): verify the full chain and pack the tarballs; publish them to npm; deploy the site
   built in the same run; write the GitHub Release. npm comes before the site so the site never
   documents a version that cannot be installed. The workflow keeps the name `publish.yml` because
   npm's Trusted Publisher entries name the file; `deploy.yml` is gone.
4. **The `github-pages` environment allows `v*` tags only**, so nothing else can publish the site.
5. **The `release` skill** (`.claude/skills/release`) does the steps around the tag in order:
   version the changesets, `pnpm verify`, push `main`, wait for CI on that commit, tag, watch the
   release run, then check npm, the Release and the site.

## Consequences

- The site always documents the latest release. Work merged to `main` waits for the next tag,
  visual baselines included: `visual-update.yml` commits them and deploys nothing.
- One run does everything, and a rerun does only what is missing: versions already on npm are
  skipped, an existing Release is kept. `gh workflow run publish.yml --ref vX.Y.Z` redeploys the
  site of a release without publishing anything new.
- Changesets bumps `pulp-react` whenever tokens (a peer dependency) or icons (a dependency) change,
  so a release almost always moves react's version. A release whose only change is `pulp-css`
  leaves react where it is and has no new tag name. The skill stops there; the answer is a patch
  changeset for react.

## Revisit when

- A package gets consumers who do not use `pulp-react`, and a react version stops meaning "the
  release" to them. Then per-package tags, and a Release per package, earn their noise.
