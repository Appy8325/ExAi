# ADR-001 — Organization Architecture Decisions

**Status:** Accepted for M0-3 design and implementation planning  
**Date:** 2026-07-13

## Context

The platform has one global `organizations` tenant entity with immutable,
globally unique slugs and `kind` values of `organizer` or `exhibitor`.
`organization_memberships` is the durable user-to-organization relationship;
event-level authority is represented separately by `event_staff` and
`exhibitor_staff`. Invitations use the existing single-use `auth_tokens`
mechanism.

This ADR resolves the lifecycle rules that are required to implement M0-3
without introducing a parallel tenancy, role, or invitation model.

## Decision 1 — Organization ownership and lifecycle

### Decision

- Every active organization must have at least one active `owner` membership.
- An owner transfer is one database transaction: verify the recipient is an
  active member, promote the recipient to `owner`, then demote or remove the
  transferring owner. The recipient may be an existing admin or member; a
  pending member cannot receive ownership.
- A direct demotion or removal that would leave no active owner is rejected.
- Normal lifecycle is archival, not deletion. An archived organization is
  read-only to ordinary members, absent from normal switchers, and may be
  restored only by Platform Admin. Its historical events and audit trail stay
  intact.
- No ordinary organization deletion is provided. Permanent removal is a
  Platform Admin retention/legal operation after dependencies and retention
  rules are evaluated; it is never a cascading self-service action.

### Alternatives considered

- Allow zero owners temporarily during transfer.
- Permit the final owner to delete the organization.
- Hard-delete organizations and cascade memberships/events.

### Reasoning and trade-offs

The owner invariant prevents tenant orphaning and gives support a reliable
human authority. Archival preserves auditability and event history but needs a
future organization lifecycle state; this ADR does not add that schema now.
The extra transfer transaction is deliberate: two independent updates can
otherwise create a zero-owner window.

### Constraints

The M0-3 migration must enforce the invariant at the shared write boundary,
not only in UI code. Platform Admin bypasses tenant RLS but must still audit
owner and lifecycle operations.

## Decision 2 — Invitation lifecycle

### Decision

Use `auth_tokens(kind = 'invite')` for every invitation. Do not add an
invitation table. The token hash, expiration, `used_at`, and `revoked_at`
remain the lifecycle state. `payload` is the typed invitation contract:

| Invitation | Required payload | Claim result |
|---|---|---|
| Organizer membership | `type: 'organization_membership'`, `organizationId`, `role`, `email` | Active `organization_memberships` row with `owner` never grantable by invite. |
| Event staff | `type: 'event_staff'`, `eventId`, `role`, `email` | `event_staff` row only after the claimant has an active membership in the organizer organization. |
| Exhibitor organization claim | `type: 'event_exhibitor_claim'`, `eventId`, `eventExhibitorId`, contact email | Claim or create the exhibitor organization, then create/activate the participation and initial `exhibitor_staff(admin)` row. |
| Exhibitor staff | `type: 'exhibitor_staff'`, `eventExhibitorId`, `role`, `email` | `exhibitor_staff` row; no organization membership is implied. |

All claim paths authenticate first, consume the token through one conditional
write, and create the target relationship in the same transaction. Replaying a
successfully claimed token returns the already-created relationship rather
than creating another one. Revocation and expiry prevent claim.

Organizer membership, event-staff, and exhibitor-staff invitations are bound
to the invited normalized email. The existing exhibitor-organization flow is
the explicit exception: its first claim is not identity-bound, matching the
blueprint's forwarded-contact rule; the issuer can revoke and reissue it.

### Alternatives considered

- One table per invitation type.
- A generic `invitations` table plus separate token records.
- Make every exhibitor-organization claim identity-bound.

### Reasoning and trade-offs

The existing polymorphic token table already provides secure, single-use
mechanics. Typed payloads keep the target-specific data explicit without
duplicating lifecycle state. The forwarded exhibitor-contact exception is less
strict than email binding, but is an intentional product rule and remains
revocable.

### Constraints

An organizer invitation grants only organization roles. Event authority is
created by `event_staff`; exhibitor authority is created by `exhibitor_staff`.
An accepted invitation must be idempotent by its target relation as well as by
token consumption.

## Decision 3 — Verified domains

### Decision

- A domain enters `organizations.verified_domains` only after the creator or
  claimant has a verified email at that domain; free-email domains are never
  added.
- The initial verified email is sufficient for the existing creation flow.
  Adding a later domain requires domain-control proof before it is marked
  verified: DNS TXT is the canonical proof, with an email-based recovery path
  only for a verified existing owner.
- Organizations may hold multiple verified domains.
- Domain matching is a suggestion, never an authorization grant. A match shows
  every organization of the selected kind and offers a pending join request or
  create-new option.
- The same normalized domain may appear on more than one organization. There
  is no automatic merge, automatic membership, or winner-takes-all claim.

### Alternatives considered

- A unique-domain constraint across all organizations.
- Treat domain match as automatic membership.
- Allow free-email domains to become verified domains.

### Reasoning and trade-offs

Companies can legitimately have subsidiaries, agencies, or separate organizer
and exhibitor entities sharing a domain. Permitting collisions avoids false
exclusivity; pending approval avoids tenant takeover. DNS proof raises the bar
for later additions while preserving the blueprint's low-friction initial
creation flow.

### Constraints

Normalize domains case-insensitively and store no email local-part in
`verified_domains`. Never reveal unmatched organizations solely through domain
lookup; the authenticated join/create flow is the only exposure.

## Decision 4 — Last-used context

### Decision

Persist context server-side on the global user profile as three nullable
preferences: last organizer organization, last exhibitor organization, and
last event. Update the relevant value only after successful context resolution.

### Alternatives considered

- Browser-only local storage or cookies.
- One global active-organization value.
- A separate context-preferences table.

### Reasoning and trade-offs

Per-user, per-surface server-side preferences satisfy the navigation blueprint
and work across devices. A single active organization would mix organizer and
exhibitor surfaces. Three nullable profile preferences are the smallest future
storage shape; a separate table is unnecessary until preferences become a
multi-row feature.

### Constraints

These are convenience values, never authorization input. On every use, verify
the user still holds the required active membership/assignment and fall back
to context selection if it does not.

## Decision 5 — Organization kind

### Decision

`organizations.kind` is immutable after creation.

### Alternatives considered

- Permit organizer-to-exhibitor conversion.
- Permit a single organization to carry both kinds.

### Reasoning and trade-offs

Kind determines route surface, event ownership versus participation, tenant
RLS assumptions, navigation, and entitlement interpretation. Conversion would
require moving or reinterpreting dependent data. A company that acts in both
capacities creates two organizations and may use the same global user account
in both.

### Constraints

No ordinary API exposes kind updates. A data-repair exception, if ever needed,
is a Platform Admin migration-grade operation with audit evidence, not product
functionality.

## Decision 6 — Canonical membership and exhibitor-staff model

### Decision

`organization_memberships` stores only the organization-scoped roles
`owner`, `admin`, and `member`. `exhibitor_staff` stores only the
event-exhibitor-scoped roles `admin` and `rep`; it does not require or create
an organization membership. `event_staff` is organizer-event scoped and
requires an active organizer-organization membership.

The `organization_memberships` reference to `exhibitor:admin` in the
exhibitor journey is superseded by this decision. An exhibitor organization's
founder receives an organization `owner` membership and, for a claimed event,
an `exhibitor_staff(admin)` row. A contractor can receive only the latter.

### Alternatives considered

- Put exhibitor event roles into `organization_memberships`.
- Require every exhibitor staff member to be an organization member.

### Reasoning and trade-offs

Keeping scopes separate preserves least privilege: seasonal booth staff cannot
read an organization's reusable catalog, settings, or other events. It also
matches the permission model's role resolver and the existing table design.

### Constraints

Permission resolution must compose the scope-prefixed role name from its table
(`org:admin`, `event:staff`, `exhibitor:rep`) rather than storing prefixed
values in role columns.

## Implementation boundary

This ADR is documentation only. It authorizes no migration, API, role, or UI
implementation by itself. M0-3 should implement the existing organization and
membership model in this order: organization creation, membership lifecycle,
invitation claims, then role/permission enforcement.
