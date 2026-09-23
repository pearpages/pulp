# Security

pulp ships design tokens, CSS and React components; it handles no data and runs no server. If you
find something that could hurt a site using it (script injection through a prop, a compromised
dependency, a problem in how the packages are published), report it privately through
[GitHub's private vulnerability reporting](https://github.com/pearpages/pulp/security/advisories/new),
not in a public issue.

Only the latest minor release of each `@pearpages/pulp-*` package gets fixes. Releases are published
from CI with npm trusted publishing and provenance, so a tarball on npm can be traced to the commit
and workflow run that built it.
