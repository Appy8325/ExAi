# ExAi RC3 Data Ownership

**Status:** Phase -1 proposal — approval required before implementation

| Owner | Data | Scope rule |
|---|---|---|
| Organization | name, brand, organization users, organization settings, event index, aggregate metrics | one organization owns every event |
| Event | name, status, venue, dates, event users/settings, exhibitor participations, attendees, sessions, event metrics | every operational record has one event |
| Exhibitor | company profile, logo, booth, description, primary contact, leads, relationships, products | one exhibitor participation belongs to one event |
| Attendee | attendee profile, registration, event activity | attendee record is event-scoped in RC3 |
| Session | schedule, speakers, capacity, attendance | every session belongs to one event |
| Analytics | derived event and organization metric snapshots, report definitions | source records remain with their transactional owner |
| Settings | scoped configuration for organization, event, or exhibitor | settings never float without a parent scope |

Ownership is enforced at the parent scope. An organization can read its events; an event can read its child records; no child record is addressable without its owning path. Archive changes visibility and lifecycle state, not ownership or history.
