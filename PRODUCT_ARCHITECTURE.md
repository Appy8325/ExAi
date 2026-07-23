# ExAi RC3 Product Architecture

**Status:** Phase -1 proposal — approval required before implementation

## Product philosophy

ExAi is an AI-powered event-management workspace. It is organized around the organizer's real work: operate an organization, select an event, then manage that event's people, program, and outcomes. AI augments measurable workflows; it never substitutes for durable event data or the ability to operate without AI.

## Product hierarchy

```text
Organization
├── Dashboard
├── Events
│   └── Event
│       ├── Dashboard
│       ├── Exhibitors
│       ├── Attendees
│       ├── Sessions
│       ├── Analytics
│       ├── Users
│       └── Settings
├── Analytics
├── Users
└── Settings
```

An organization is the account boundary. An event is the operational boundary. Exhibitor workspaces are entered from an event and contain Dashboard, Leads, Relationships, Products, Analytics, and Settings.

## Entity relationships

```text
Organization 1 ── * Event
Organization 1 ── * OrganizationUser
Event 1 ── * Exhibitor ── * Lead
Event 1 ── * Attendee
Event 1 ── * Session
Event 1 ── * EventUser
Analytics = derived, scoped views of organization- or event-owned activity
```

An exhibitor is event-scoped: the same company participating in two events has two event records. Leads, relationships, products, and exhibitor analytics belong to that exhibitor's event participation.

## Workspace hierarchy

- Organization workspace: aggregate operational view and event portfolio.
- Event workspace: the primary day-to-day workspace, selected from the organization.
- Exhibitor workspace: a focused sub-workspace inside one event.
- Detail views: records such as an exhibitor, attendee, or session; they retain their parent workspace context.

## Navigation principles

1. The active workspace is always visible.
2. Side navigation lists only sibling destinations for that workspace.
3. Breadcrumbs express parentage, not history.
4. URLs encode scope, so refreshes and deep links preserve context.
5. A destination appears in navigation only when it exists; planned features use intentional `Coming soon` pages.

## Product ownership boundaries

| Boundary | Owns | Does not own |
|---|---|---|
| Organization | account identity, organization users, event portfolio, aggregate analytics, organization settings | event operations or exhibitor records |
| Event | event metadata, event users, exhibitors, attendees, sessions, event analytics, event settings | organization-wide configuration |
| Exhibitor | event participation profile, leads, relationships, products, exhibitor analytics/settings | event-wide attendee or session records |
| Analytics | derived measurements and reporting definitions | source-of-truth transactional data |

## RC3 scope guardrails

RC3 supports one active organization at a time. Multi-organization switching, billing, RBAC, invitations, public registration, external integrations, and copilot workflows remain outside this product slice.
