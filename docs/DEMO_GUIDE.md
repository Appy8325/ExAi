# ExAi local demo

The demo is local-only. It seeds a realistic TechExpo 2027 environment and does not change production behavior, routes, or credentials.

## Prerequisites

- Node.js 22 or newer and pnpm 9 or newer
- Docker Desktop running

The local Supabase CLI is installed with the repository dependencies.

## Start the demo

From the repository root, run:

```powershell
pnpm install
pnpm supabase:start
pnpm db:migrate
pnpm db:seed:demo
pnpm dev
```

`db:seed:demo` writes ignored local API and web environment files from the running local Supabase instance. The application is then available at [http://localhost:3000](http://localhost:3000); the API is at [http://localhost:3001](http://localhost:3001).

To restore a clean deterministic demo, run:

```powershell
pnpm demo:reset
```

This resets only the local Supabase database, reapplies migrations, provisions local demo identities, seeds the data, refreshes local environment files, and regenerates QR images.

## Demo accounts

All accounts use local Supabase passwordless Magic Links. Open [http://localhost:54324](http://localhost:54324) after requesting a sign-in link; local Inbucket displays the message.

| Role      | Email                                                             | Use                                                   |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| Organizer | `organizer@techexpo.local`                                        | Seeded owner of TechExpo Events                       |
| Exhibitor | `exhibitor@techexpo.local`                                        | Seeded owner of all five demo exhibitor organizations |
| Attendees | `attendee-1@techexpo.local` through `attendee-200@techexpo.local` | Seeded attendee profiles and relationships            |

There are no passwords. To establish a local session for an exhibitor, open any booth URL, enter `exhibitor@techexpo.local`, then open the Magic Link from Inbucket.

## Seeded environment

- **Organizer:** TechExpo Events
- **Event:** TechExpo 2027
- **Exhibitors:** Northstar Cloud (A-101), Vector Labs (A-102), Signal Forge (A-103), Atlas Systems (A-104), and Brightline AI (A-105)
- **Attendees:** 200 provisioned local Supabase identities with completed professional profiles and sharing consent
- **Relationships:** 500 event-scoped relationships, with immutable visitor-QR submissions
- **Activity:** notes, profile-enrichment records, potential-duplicate examples, and prior dashboard visits

## QR codes and dashboard routes

Generated QR PNGs and `manifest.json` are in `demo/qr/`. They are intentionally ignored by Git. Each QR resolves to a relative local product route in the form:

```text
http://localhost:3000/visit/{eventExhibitorId}
```

`manifest.json` supplies the corresponding `organizationId` and `eventExhibitorId`. After signing in as the exhibitor, use those values to open the dashboard:

```text
http://localhost:3000/exhibit/{organizationId}/dashboard/{eventExhibitorId}
```

The dashboard’s relationship links open the corresponding Relationship Workspace. Alternatively, inspect the seeded relationships in the dashboard and follow a link from its activity feed.

## Judge walkthrough

1. Start the demo and open one image from `demo/qr/` on a phone, or open its URL directly.
2. Review the booth experience and select **Connect with this exhibitor**.
3. Enter a new email address. Open the local Magic Link from Inbucket to authenticate and create the event-scoped relationship.
4. Complete the short attendee profile and consent choice. The existing Progressive Enrichment Engine records shared profile changes for the connected exhibitor.
5. In another browser profile, sign in with `exhibitor@techexpo.local` through the same Magic Link mechanism.
6. Open an exhibitor dashboard URL from `demo/qr/manifest.json`, then open a relationship workspace to inspect immutable submissions, relationship data, notes, and consent-filtered profile information.

The seed intentionally includes varied relationship histories so the dashboard and workspace have useful content without any external service.
