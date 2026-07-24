# ExAi RC3 Layout Guidelines

## Page composition

Every workspace screen follows this order: orientation, page header, decision-critical content, supporting content, then progressive disclosure. The header contains a concise title, optional description, location context, and one primary action. Do not place competing primary actions in the same header.

## Dashboard patterns

Operational dashboards answer “is this on track?” in the first viewport:

1. page identity and health state;
2. up to four primary KPIs, each with meaningful context;
3. attention or next-best actions; show a positive empty state when none exist;
4. activity, recent items, supporting charts, and quick actions;
5. historical or secondary detail below the fold.

Analytics pages answer “why?” using trend, comparison, segmentation, and filters. AI reports are narrative-first with traceable metrics. Settings are task-first: title, concise context, grouped form, sticky save only when needed.

Organizer, exhibitor, and admin dashboards share this grammar but differ by decision: organizers see event readiness and growth, exhibitors see lead and booth outcomes, and admins see platform health and exceptions. Each should feel related through shell, typography, components, and data hierarchy—not through identical content blocks.

## Grids and responsive behavior

Use the 12-column desktop grid and collapse deliberately: primary content stays first, secondary side content follows, and dense tables transform rather than merely overflow. On mobile, page gutters are 16px, controls remain touch-friendly, and navigation moves into the established mobile pattern. Do not rely on hover to reveal required actions.

## Navigation and hierarchy

The sidebar provides durable workspace orientation; top navigation provides global utilities; breadcrumbs show depth where needed; tabs switch peer views. Page headers use the same title/action alignment across roles. Active, selected, unread, and status signals must be visually distinct and semantically named.

## Forms and tables

Forms use a single readable column unless comparison is necessary. Tables prioritize an identifying column, use sticky headers only for long scrolling, and place bulk actions after selection is made. Filter and search controls sit close to the dataset they affect.

Activity feeds and timelines are supporting content, not dashboard decoration: group by date, prioritize exceptions and human actions, and let users filter high-volume histories. On narrow screens, move noncritical metadata into row detail and keep the identifier, status, and next action visible.

## Density, empty, and error states

Density changes padding and row/control height, never type scale. Empty states explain the next expected event or offer a single safe action. Errors retain user input and put recovery closest to the failure. Loading reserves the final layout to prevent visual jump.
