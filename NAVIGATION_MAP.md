# ExAi RC3 Navigation Map

**Status:** Phase -1 proposal — approval required before implementation

```text
Organization
├── Dashboard
├── Events
│   ├── Event dashboard
│   ├── Exhibitors
│   │   └── Exhibitor workspace
│   │       ├── Dashboard
│   │       ├── Leads
│   │       ├── Relationships
│   │       ├── Products
│   │       ├── Analytics
│   │       └── Settings
│   ├── Attendees
│   ├── Sessions
│   ├── Analytics
│   ├── Users (Coming soon)
│   └── Settings (Coming soon)
├── Analytics
├── Users (Coming soon)
└── Settings (Coming soon)
```

| Context | Persistent navigation | Entry and exit |
|---|---|---|
| Organization | Dashboard, Events, Analytics, Users, Settings | Login enters Dashboard; Events selects an event |
| Event | Dashboard, Exhibitors, Attendees, Sessions, Analytics, Users, Settings | Breadcrumb returns to Events; selecting an exhibitor enters its workspace |
| Exhibitor | Dashboard, Leads, Relationships, Products, Analytics, Settings | Breadcrumb returns to Event Exhibitors |

Record detail pages inherit their parent navigation and show a breadcrumb. Create, edit, archive, duplicate, search, sort, and filter are actions within their respective collection pages, never primary navigation destinations.
