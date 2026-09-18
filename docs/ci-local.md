# Replicating CI locally

Some failures only show on the GitHub runner: Linux, x64, a slower machine, different fonts. The
visual check was the first (2026-09-17): it timed out in CI and passed on macOS every time.
`scripts/ci-local.sh` runs the pipeline in CI's own browser image, as `linux/amd64`, so those
failures can be reproduced, measured and fixed in two-minute loops instead of eight-minute pushes.

## What it is

- A **throwaway Colima profile**, `pulp-ci` (vz + Rosetta, 4 CPU, 8 GB RAM, 20 GB disk). Colima
  only, never Docker Desktop. It starts with `--activate=false` and every Docker call names the
  context `colima-pulp-ci`, so your `default` profile and current Docker context are never touched.
- One container from `mcr.microsoft.com/playwright:v<version>-noble`, the version read from the
  installed `playwright` package, so Chromium is the build `playwright install` fetches in CI. Node
  comes from `.nvmrc` and pnpm from `packageManager`, as in the workflows.
- A **copy** of the working tree at `/work`, uncommitted changes included. It is never a bind mount:
  macOS `node_modules` hold per-platform binaries (esbuild, rolldown) that cannot run on Linux.

## Prerequisites

```
brew install colima docker   # docker is the CLI only; Colima provides the daemon
```

Apple Silicon with Rosetta installed (`softwareupdate --install-rosetta`). On an x64 Linux machine
you do not need any of this: run the commands from `deploy.yml` directly.

## A session

```
pnpm ci:local up          # ~1 min; the first time also pulls ~2 GB
pnpm ci:local sync        # copy the tree in, pnpm install --frozen-lockfile
pnpm ci:local verify      # everything deploy.yml runs
pnpm ci:local visual -u 5 # render baselines in the container, then compare 5 times
pnpm ci:local diffs       # failed shots → apps/storybook/test-results/ci-local (gitignored)
pnpm ci:local stop        # between sessions: frees the RAM, keeps the image and the copy
pnpm ci:local down        # delete the profile; prints what is left
```

Edit, `sync`, run again: `sync` replaces everything in `/work` except `node_modules`, so a re-sync
is quick. `pnpm ci:local run <cmd>` runs anything (`PULP_VISUAL=1 pnpm ci:local run pnpm test:site`),
and `pnpm ci:local shell` opens a shell in the container.

**Never leave it up.** The profile holds 8 GB of RAM while it runs. `stop` frees that and keeps the
2 GB image, so the next `up` takes seconds; `down` is the full cleanup: it removes the VM,
the image, the container and its volumes in one go, then prints `colima list` and
`docker context ls` so you can see nothing is left.

## What it is not

It is CI's image and architecture, not CI's machine. Measured on 2026-09-17:

- **Rendering matches the runner pixel for pixel** for web fonts: 131 of 136 visual baselines
  rendered on GitHub matched in the container.
- **System fonts differ.** The container falls back to WenQuanYi Zen Hei Mono for `monospace`; the
  runner has other fonts. bitepals' mono family is system fonts (`ui-monospace, 'SF Mono', Menlo,
  monospace`; pulp ships Geist Mono), so Text and Slider in bitepals mismatch the *committed*
  baselines here, on the monospace text only. For "is this stable?" questions render baselines
  inside the container first (`visual -u`). The committed baselines stay GitHub's
  (`gh workflow run visual-update.yml`). The same fact means they need re-rendering whenever GitHub
  changes the runner image's fonts.
- **Rosetta is emulation, and this is 4 fast cores.** A timing problem on a 2-core runner may not
  show. If something reproduces only on GitHub, fall back to a `workflow_dispatch` debug workflow on
  a branch.

## What it found the first time

Kept here because the method matters more than the bug:

1. The "hang" was not a hang. `expect.element(...).toMatchScreenshot()` retries a *real* mismatch
   until the test times out, so CI showed `Test timed out in 15000ms` and no diff, and the uploaded
   "actual" shot was taken by the abandoned attempt during the *next* story. Patching Vitest's
   stabiliser in the container to log its comparisons showed the same pixel count every time: a
   stable mismatch, not jitter.
2. `DEBUG=pw:api` showed Playwright taking 80 successful screenshots in 12 s — the browser was fine.
3. Rendering baselines in the container and comparing five times separated the deterministic
   stories (all but two) from the flaky ones (Toast in bitepals, one description line; DatePicker,
   its focus ring), which no amount of reading had done.
4. Two theories were disproved by running them, not by arguing: a frozen `Date`, and font-load order.
