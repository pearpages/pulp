---
'@pearpages/pulp-react': minor
---

React Server Components: every entry that needs the browser now ships with `'use client'`, so pulp can be imported from a server file on the Next.js App Router. 18 leaf entries carry no directive and render on the server as they are (Text, Heading, Stack, Inline, Card, Divider, Badge, Skeleton, Spinner, Progress, Icon, VisuallyHidden, Link, Button, IconButton, Alert, Pagination, EmptyState). The component manifest gains a `client` field per component. The barrel is a client module: import per-component entries to keep server-safe components on the server.
