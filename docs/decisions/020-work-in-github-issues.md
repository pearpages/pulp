# 020. Pending work is tracked in GitHub Issues, and there is no session log

Date: 2026-11-04. Status: accepted. It deletes `tasks.md`; its history stays in git.

## Context

`tasks.md` held three things: the pending work, a recommended order, and a session log that
every session and every release appended to. There was no view across repos, nothing linked a
to-do to the commit or PR that finished it, and the log grew without being read. On 2026-11-04 every
pending item became a GitHub issue on the owner's Backlog project board.

## Decision

- Pending work is a GitHub issue, labelled `type:*`, `priority:*` and `area:*`. The
  `priority:*` labels give the order.
- Finished work closes its issue from the commit or PR (`Fixes #N`). A release closes the
  issues it completes with a comment naming the tag.
- There is no session log. Git, the PRs and the GitHub Releases are the history.

## Consequences

+ One board across repos, and every to-do links to the change that closed it.
+ Sessions and releases no longer end with a docs edit just to log them.
− Tracking work depends on GitHub: reading it needs `gh` or the web, not a file.
