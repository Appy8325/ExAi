# Phase 0.5 Implementation Plan — Development Identity Bridge

**Status:** Implemented; live Supabase validation pending environment configuration

## Objective

Replace the current application-cookie-only development session with a development login that produces a standard Supabase authenticated session. Existing API authorization, RLS, organizations, memberships, and event/exhibitor ownership then operate unchanged.

## Authentication flow

1. The user submits the approved development email and password to `/auth`.
2. A server-side development bridge validates those credentials.
3. The bridge signs in to Supabase using the corresponding pre-provisioned development user through the normal password session flow.
4. Supabase sets its standard session cookies; no service-role credential is sent to or usable by the browser.
5. The browser redirects to `/organizer`; middleware and API clients use the normal Supabase session.

The bridge must fail closed: absent or invalid bridge configuration, a missing Supabase user, or failed Supabase sign-in returns the same generic invalid-login result.

## Identity flow

The development email maps one-to-one to a durable Supabase Auth user and its existing application `users` record. The bridge never invents a user ID, embeds a user ID in a client cookie, or impersonates an arbitrary principal.

The development user is provisioned once through the approved operational setup, not dynamically by the login screen. Its password is stored/configured in Supabase; the user-facing development password is not a database or RLS bypass.

## Organization resolution

After Supabase authenticates the development user, existing membership and RLS policies resolve the organizer organization. The user must have an active owner/admin membership in one organizer organization.

For exhibitor management, the existing data model also requires a real exhibitor organization for each exhibitor participation. Phase 3 create flows must create or select that organization through the existing authorized domain/API path; they must not attach records to a synthetic organization ID.

## Session lifecycle

- Supabase owns refresh, expiry, validation, and sign-out.
- Middleware returns to its existing Supabase `getClaims` path for `/organizer`.
- Sign-out revokes the standard browser session via Supabase.
- The Phase 0 signed development cookie is removed once the bridge is enabled, preventing two competing session authorities.
- Sessions retain the existing Supabase session policy; the bridge adds no parallel renewal mechanism.

## Cleanup strategy

The bridge is isolated behind one development-auth route and configuration flag. Removing it consists of:

1. Disable the development-login route/flag.
2. Remove its credential mapping and the pre-provisioned development account from the deployment environment when no longer needed.
3. Restore `/auth` to the production Supabase login UI.
4. Keep all RLS policies, organization records, memberships, event records, and API authorization unchanged.

No schema migration, RLS policy change, or production data cleanup is required because the bridge uses normal durable identities and ownership.

## Migration path to production authentication

Production authentication remains the canonical Supabase boundary. The bridge is a narrow alternate sign-in entrypoint, not a separate identity system. On restoration, OAuth, magic links, MFA, invitations, registration, and password recovery resume at the same boundary and create the same session type used by the bridge.

## Acceptance criteria

- A valid development login creates a real Supabase session.
- `/organizer` requests carry a normal authenticated principal.
- Existing organization membership and RLS allow only the development user's authorized records.
- Existing event/exhibitor API endpoints work without service-role browser access or authorization exceptions.
- Invalid development credentials do not create a session.
- Disabling the bridge restores the production authentication flow without data migration.
