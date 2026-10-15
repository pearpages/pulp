---
name: release
description: Release pulp - version the pending changesets, push main, wait for CI, then tag vX.Y.Z so publish.yml publishes to npm, deploys the Storybook site and writes the GitHub Release. Optionally merges an approved PR first. Use when asked to release, publish, deploy, cut a version or ship pulp, or invoked as /release [PR number].
---

# Release pulp

A release is a tag (decision record 017). One `vX.Y.Z` tag on `main`, named after
`@pearpages/pulp-react`'s version, makes `publish.yml` do three things in this order: npm, the
site (pulp.pearpages.com), the GitHub Release. `main` itself deploys and publishes nothing. This
skill does the steps around the tag, in the order that keeps them from failing.

The one tag covers all four packages: the Release notes list every package whose version changed
(`scripts/release-notes.mjs`). Changesets bumps react whenever tokens or icons change, so react's
version is the release number. A release with only a css change leaves react unchanged and has
no new tag name: stop and say so (the fix is a react patch changeset).

Argument: an optional PR number. With one, the PR is merged first and released with the rest.

## Steps

1. **Preflight. Read-only; stop with the reason at the first failure.**
   ```
   git fetch origin
   git status --porcelain                 # must be empty
   git rev-parse --abbrev-ref HEAD        # must be main (git switch main && git pull --ff-only)
   gh pr checks <n>                       # with a PR: every check passes
   gh pr view <n> --json mergeable,state  # MERGEABLE, OPEN
   gh run list --workflow ci.yml --branch main --limit 1   # completed, success
   pnpm changeset status --verbose        # at least one package to bump
   ```
   No changesets (and no PR bringing one) means nothing to release.

2. **Work out the release, without keeping anything.** With a PR, run this on a throwaway merge
   (`git merge --no-commit --no-ff origin/<head>`) or read the PR's changesets; on `main`, directly:
   ```
   pnpm version-packages
   for d in tokens css icons react; do node -p "require('./packages/$d/package.json').name + ' ' + require('./packages/$d/package.json').version"; done
   ```
   The tag is `v` + react's version. Stop if react's version did not change, or if
   `git tag -l <tag>` already lists it. Then restore the tree (`git checkout -- . && git clean -fd .changeset packages`,
   `git merge --abort` for a PR).

3. **Confirm once.** Show the table (package, from, to), the tag, and the CHANGELOG lines each
   package gains. Ask Pere for one yes. That yes covers this release's merge, version commit,
   push of `main` and tag, and nothing else.

4. **Merge (with a PR).** `gh pr merge <n> --merge`, then `git pull --ff-only`. The merge commit is
   on `main`; nothing deploys.

5. **Version, verify, commit, push.**
   ```
   pnpm version-packages
   pnpm verify                            # what CI and the release run do, locally
   git add -A && git commit -m "Version packages: <X.Y.Z>"
   git push origin main
   ```
   The message matches the history (`Version packages: 0.6.0`). If `verify` fails, stop: nothing
   is pushed.

6. **Wait for CI on that commit.** A tag on a commit whose CI is red would release it.
   ```
   gh run list --workflow ci.yml --commit "$(git rev-parse HEAD)" --json databaseId --jq '.[0].databaseId'
   gh run watch <id> --exit-status
   ```
   The run can take a few seconds to appear; list again rather than guess. Red: stop, report the
   failing step and the `visual-diffs` artifact if there is one.

7. **Tag.**
   ```
   git tag <tag> && git push origin <tag>
   ```

8. **Wait for the release run** and report each job as it finishes (verify, publish, deploy,
   release):
   ```
   gh run list --workflow publish.yml --event push --limit 1 --json databaseId,headBranch
   gh run watch <id> --exit-status
   ```
   A failed job: fix the cause, then `gh run rerun <id> --failed`. Versions already on npm are
   skipped and an existing Release is kept, so a rerun only does what is missing. A rejected
   `deploy` means the `github-pages` environment does not allow the tag (it must allow `v*`).

9. **Check what shipped, not only that the run is green.**
   ```
   npm view @pearpages/pulp-<name> version     # each bumped package: the new version
   gh release view <tag>                       # one section per bumped package
   ```
   Open https://pulp.pearpages.com: the toolbar shows the new react version and links to the
   Release.

10. **Report** the versions published, the Release URL and the two run URLs, and add a one-line
    entry at the top of the session log in `tasks.md`.

## What not to do

- Never push the tag before CI on the version commit is green: `publish.yml` re-checks, but a red
  release run after npm has published cannot be taken back.
- Never tag a commit that is not on `main` (`publish.yml` refuses it).
- Never rename `publish.yml`: npm's Trusted Publisher entries name the file.
- Never deploy the site from `main` by hand: the site documents the latest release.
