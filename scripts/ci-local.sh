#!/usr/bin/env bash
# A local replica of the CI pipeline: CI's Playwright image, as linux/amd64, in a throwaway Colima
# profile. For problems that only show on the runner. See docs/ci-local.md.
#
#   pnpm ci:local up          start the profile and the container (first run pulls ~2 GB)
#   pnpm ci:local sync        copy the working tree in (uncommitted changes included) and install
#   pnpm ci:local run <cmd>   run anything in the copy, with CI=true
#   pnpm ci:local verify      the whole chain deploy.yml runs
#   pnpm ci:local visual [-u] [N]   build the site, then the screenshot suite against it, N times (default 1)
#   pnpm ci:local diffs       copy failed-shot images out to apps/storybook/test-results/ci-local
#   pnpm ci:local shell       a shell in the container
#   pnpm ci:local stop        free the RAM, keep the image and the copy (`up` resumes in seconds)
#   pnpm ci:local down        delete the profile and everything in it
#
# Colima only, never Docker Desktop. The `default` Colima profile and the current Docker context are
# never touched: the profile starts with --activate=false and every call names its own context.
set -euo pipefail

PROFILE=pulp-ci
CONTEXT="colima-$PROFILE"
CONTAINER=pulp-ci
WORK=/work
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# A function, not a variable holding "docker --context …": zsh does not word-split unquoted
# variables, and this script gets pasted into zsh sessions.
dk() { docker --context "$CONTEXT" "$@"; }
in_work() { dk exec -w "$WORK" -e CI=true "$@"; }

need() { command -v "$1" >/dev/null 2>&1 || { echo "ci-local: '$1' is not installed ($2)" >&2; exit 1; }; }
running() { colima list 2>/dev/null | awk -v p="$PROFILE" '$1 == p && $2 == "Running" { found = 1 } END { exit !found }'; }
require_up() { running && dk inspect "$CONTAINER" >/dev/null 2>&1 || { echo "ci-local: not up. Run: pnpm ci:local up" >&2; exit 1; }; }

playwright_version() {
  node -p "require('$ROOT/apps/storybook/node_modules/playwright/package.json').version" 2>/dev/null ||
    { echo "ci-local: cannot read the installed playwright version; run pnpm install first" >&2; exit 1; }
}

cmd_up() {
  need colima "brew install colima"
  need docker "brew install docker  (the CLI only; Colima provides the daemon)"
  if ! running; then
    # vz + Rosetta runs amd64 binaries at near-native speed on Apple Silicon. --activate=false leaves
    # the current Docker context alone.
    colima start "$PROFILE" --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 20 --activate=false
  fi
  if ! dk inspect "$CONTAINER" >/dev/null 2>&1; then
    local version; version="$(playwright_version)"
    # The image carries the Chromium build that `playwright install` fetches in CI for this version.
    dk run -d --name "$CONTAINER" --platform linux/amd64 --ipc=host \
      "mcr.microsoft.com/playwright:v${version}-noble" sleep infinity >/dev/null
    local node_version pnpm_version
    node_version="$(tr -d 'v \n' < "$ROOT/.nvmrc")"
    pnpm_version="$(node -p "require('$ROOT/package.json').packageManager.split('@')[1]")"
    # CI takes Node from .nvmrc and pnpm from packageManager; the image ships a newer Node.
    dk exec "$CONTAINER" bash -lc "npm install -g n >/dev/null 2>&1 && n $node_version >/dev/null 2>&1 && hash -r && corepack enable && corepack prepare pnpm@$pnpm_version --activate >/dev/null 2>&1"
  fi
  # After `stop`, the container exists but is not running.
  [ "$(dk inspect -f '{{.State.Running}}' "$CONTAINER")" = "true" ] || dk start "$CONTAINER" >/dev/null
  dk exec "$CONTAINER" bash -lc 'echo "ci-local: up — $(uname -m), node $(node --version), pnpm $(pnpm --version)"'
  echo "ci-local: next: pnpm ci:local sync"
}

cmd_sync() {
  require_up
  # Tracked files plus untracked-but-not-ignored ones: the working tree as it is, so a fix can be
  # tried before it is committed. Never a bind mount — macOS node_modules hold per-platform binaries.
  dk exec "$CONTAINER" bash -c "mkdir -p $WORK && find $WORK -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +"
  # COPYFILE_DISABLE + --no-mac-metadata: macOS tar otherwise adds an AppleDouble `._name` twin for
  # every file with extended attributes, and Linux sees `._Toast.stories.tsx` as a story file.
  (cd "$ROOT" && git ls-files -co --exclude-standard -z | COPYFILE_DISABLE=1 tar --no-mac-metadata --null -T - -cf -) |
    dk exec -i "$CONTAINER" tar -x -C "$WORK"
  in_work "$CONTAINER" bash -lc 'pnpm install --frozen-lockfile 2>&1 | tail -2'
  # The stories' docs page imports the component manifest. The app's own scripts generate it first;
  # `visual` calls vitest directly, and sync has just wiped dist/.
  in_work "$CONTAINER" bash -lc 'pnpm --filter @pearpages/pulp-react manifest >/dev/null'
  echo "ci-local: synced $(cd "$ROOT" && git rev-parse --short HEAD)$(cd "$ROOT" && git diff --quiet && git diff --cached --quiet || echo ' + uncommitted changes')"
}

cmd_run() {
  require_up
  [ "$#" -gt 0 ] || { echo "ci-local: run what? e.g. pnpm ci:local run pnpm test" >&2; exit 1; }
  local envs=()
  [ -n "${PULP_VISUAL:-}" ] && envs+=(-e "PULP_VISUAL=$PULP_VISUAL")
  in_work "${envs[@]}" "$CONTAINER" bash -lc "$*"
}

cmd_visual() {
  require_up
  local update="" count=1
  for arg in "$@"; do
    case "$arg" in
      -u) update=1 ;;
      ''|*[!0-9]*) echo "ci-local: visual [-u] [N]" >&2; exit 1 ;;
      *) count="$arg" ;;
    esac
  done
  local summarise="sed 's/\x1b\[[0-9;]*m//g' | grep -E '^ +[0-9]+ (passed|failed|flaky)|✘|flaky' | sort | uniq -c | sort -rn | head -16"
  # The shots are of the built site, so build it first (once: the loop below only re-shoots).
  echo "== building storybook-static inside the container"
  in_work "$CONTAINER" bash -lc 'pnpm storybook:build 2>&1 | tail -2'
  if [ -n "$update" ]; then
    # Baselines rendered *here*. Use this before asking "is it stable?": the committed baselines are
    # the GitHub runner's, and its system fonts are not this image's (docs/ci-local.md).
    echo "== rendering baselines inside the container"
    dk exec -w "$WORK/apps/storybook" -e PULP_VISUAL=1 "$CONTAINER" bash -lc "rm -rf visual-baselines test-results; pnpm exec playwright test --update-snapshots 2>&1 | tail -2"
  fi
  local i
  for i in $(seq 1 "$count"); do
    echo "== compare $i/$count"
    # Playwright reports a shot that mismatched and then passed on the retry as "flaky": that is the
    # flake a plain pass/fail line hides, and its diff stays in test-results.
    dk exec -w "$WORK/apps/storybook" -e PULP_VISUAL=1 -e CI=true "$CONTAINER" bash -lc "rm -rf test-results; pnpm exec playwright test 2>&1 | $summarise" || true
  done
}

cmd_diffs() {
  require_up
  local out="$ROOT/apps/storybook/test-results/ci-local"
  rm -rf "$out"; mkdir -p "$out"
  if dk exec "$CONTAINER" test -d "$WORK/apps/storybook/test-results"; then
    dk cp "$CONTAINER:$WORK/apps/storybook/test-results/." "$out" >/dev/null
    echo "ci-local: $(find "$out" -name '*-diff.png' | wc -l | tr -d ' ') diff(s) in ${out#"$ROOT"/}"
  else
    echo "ci-local: no failed shots in the container"
  fi
}

cmd_down() {
  need colima "brew install colima"
  # Deleting the profile removes the VM, the image, the container and its volumes in one go.
  colima delete "$PROFILE" --force 2>&1 | tail -1 || true
  rm -rf "$ROOT/apps/storybook/test-results/ci-local"
  echo "== colima profiles left:"; colima list 2>&1
  echo "== docker contexts:"; docker context ls 2>&1
}

case "${1:-}" in
  up) cmd_up ;;
  sync) cmd_sync ;;
  run) shift; cmd_run "$@" ;;
  verify) cmd_run pnpm verify ;;
  visual) shift; cmd_visual "$@" ;;
  diffs) cmd_diffs ;;
  shell) require_up; dk exec -it -w "$WORK" -e CI=true "$CONTAINER" bash -l ;;
  stop) colima stop "$PROFILE" 2>&1 | tail -1; colima list 2>&1 ;;
  down) cmd_down ;;
  *) sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
