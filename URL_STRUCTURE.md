# ExAi RC3 URL Structure

**Status:** Phase -1 proposal — approval required before implementation

| Route | Purpose |
|---|---|
| `/login` | temporary development sign-in |
| `/organizer` | organization dashboard |
| `/organizer/events` | event collection |
| `/organizer/events/new` | create event |
| `/organizer/events/:eventId` | event dashboard |
| `/organizer/events/:eventId/exhibitors` | exhibitor collection |
| `/organizer/events/:eventId/exhibitors/:exhibitorId` | exhibitor dashboard |
| `/organizer/events/:eventId/exhibitors/:exhibitorId/leads` | exhibitor leads |
| `/organizer/events/:eventId/exhibitors/:exhibitorId/relationships` | exhibitor relationships |
| `/organizer/events/:eventId/exhibitors/:exhibitorId/products` | exhibitor products |
| `/organizer/events/:eventId/exhibitors/:exhibitorId/analytics` | exhibitor analytics |
| `/organizer/events/:eventId/exhibitors/:exhibitorId/settings` | exhibitor settings |
| `/organizer/events/:eventId/attendees` | attendee collection |
| `/organizer/events/:eventId/attendees/:attendeeId` | attendee detail |
| `/organizer/events/:eventId/sessions` | session collection |
| `/organizer/events/:eventId/sessions/:sessionId` | session detail |
| `/organizer/events/:eventId/analytics` | event analytics |
| `/organizer/events/:eventId/users` | event users placeholder |
| `/organizer/events/:eventId/settings` | event settings placeholder |
| `/organizer/analytics` | organization analytics |
| `/organizer/users` | organization users placeholder |
| `/organizer/settings` | organization settings placeholder |

IDs are stable opaque identifiers; labels and slugs are not routing keys. Query parameters may represent collection state (`q`, `status`, `sort`) but never ownership scope.
