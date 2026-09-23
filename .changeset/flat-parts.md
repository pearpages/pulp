---
'@pearpages/pulp-react': minor
---

Every compound part is now exported under a flat name as well: `MenuTrigger`, `MenuContent`, `DialogTitle`, `TabsList`, `FieldLabel`, `CardHeader` and so on, from the same entry as its parent (and from the barrel). The dotted form (`Menu.Trigger`) keeps working everywhere it did.

Use the flat names in a React Server Component. A Server Component reaches a client entry as a client reference, which carries only the module's named exports, so `<Menu.Trigger>` in an App Router page failed the render with "Element type is invalid … got: undefined". Covers Accordion, Card, DataGrid, Dialog, Field, Menu, Popover, SegmentedControl, Sheet, Table and Tabs.
