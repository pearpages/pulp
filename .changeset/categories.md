---
"@pearpages/pulp-react": minor
---

The component manifest gains `category` per component (Typography, Layout,
Actions, Forms, Navigation, Overlays, Feedback, Data, Utilities) from a
required `@category` JSDoc tag, and a top-level `categories` list in sidebar
order. The Storybook groups components by it, marks non-stable ones in the
sidebar, and the Status page is grouped by category. The scaffold takes the
category as its second argument.
