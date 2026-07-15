# Local setup

## Prerequisites
- Node.js 22+
- pnpm 9+
- Docker Desktop

## Install and start
1. Copy .env.example to .env.local if you need to override values.
2. Run `pnpm install`.
3. Run `npx supabase start`.
4. Run `pnpm db:migrate`.
5. Run `pnpm db:seed:demo`.
6. Run `pnpm dev`.

## Demo credentials
- Organizer: organizer@techexpo.local
- Exhibitor: exhibitor@techexpo.local
- Attendees: attendee-1@techexpo.local through attendee-200@techexpo.local

## Demo walkthrough
- Open `/demo` for launcher links.
- Use the QR booth flow to enroll.
- Sign in as the exhibitor to view the dashboard and relationship workspace.

## Troubleshooting
- If Supabase is not running, run `npx supabase start`.
- If the database is missing tables, rerun `pnpm db:migrate`.
- If demo data is inconsistent, rerun `pnpm db:seed:demo`.
