# Architecture Review v1.0

**Status:** Review only  
**Date:** 2026-07-13

## Executive summary

ExAi has a sound tenant foundation for an Exhibitor Intelligence Platform:
organizer-owned events, exhibitor-owned event participation, organization
membership/RLS foundations, immutable lead-submission history, and a clear
privacy rule that organizers do not read exhibitor-private lead data.

The implementation is ready to continue only after treating the relationship
capture data boundary as the next architectural hardening priority. The
current submission service validates event/form/exhibitor consistency, but
the database does not enforce all of those cross-table invariants. At event
scale, direct writes, future import paths, and background workers must not be
able to create analytically inconsistent submissions.

The other material gap is intentional but now visible: ADR-003 defines a
living attendee professional profile, while the implementation currently has
only the global `users` identity (`email` and `full_name`) and no profile
aggregate for enrichment attributes. This is a blocker for implementing
progressive enrichment, not a reason to add speculative profile fields now.

## Strengths

- The tenant hierarchy is clear: organizer organization owns an event;
  `event_exhibitors` is the explicit exhibitor participation bridge; lead
  forms and submissions are exhibitor-owned.
- ADR-001's organization/membership/owner model separates tenant membership
  from future event and exhibitor staff scopes.
- Lead submissions are append-only for tenant callers: grants allow `SELECT`
  and `INSERT`, while submission values include immutable field snapshots.
- RLS prevents organizers from reading raw lead submissions and submission
  values; this matches ADR-003's exhibitor-relationship ownership boundary.
- Form definitions support extensible field types and JSON validation without
  introducing a schema-per-form anti-pattern.
- The service validates active form ownership, event/exhibitor association,
  required fields, source, and response shape in one transaction before
  persisting a submission and all values.
- Existing indices support primary exhibitor-local submission history and
  attendee-repeat detection. UUIDv7 supports append-oriented writes.
- The role and permission resolution path is separated from enforcement, and
  the authorization guard caches resolved permissions for the request.
- ROADMAP_V2 correctly treats events and agenda as context, not a replacement
  for an event-management platform.

## Findings

### Domain model and product alignment

The completed organization, event, event-exhibitor, form, and submission
aggregates align with the exhibitor-intelligence vision. `agenda_sessions`
and broad scaffold modules are potential generic-event-management drift, but
they remain isolated and should receive no new investment unless they improve
exhibitor outcomes.

There is no duplicate tenant concept. `organization_memberships` should remain
the canonical organization relationship; future `event_staff` and
`exhibitor_staff` must remain scoped relationships rather than extra
organization-role models.

`event_exhibitors` correctly represents multi-event exhibitors: one exhibitor
organization can participate in multiple organizer-owned events. Cross-event
analytics should be a future exhibitor-owned read model, not an expansion of
the transactional participation table.

### Database and integrity

`lead_submissions` deliberately denormalizes `event_id` for future filtering,
but the database does not prove that it equals the event of
`event_exhibitor_id`. It also does not prove that `lead_form_id` belongs to
that same event exhibitor, or that each `lead_submission_values` field belongs
to the form recorded on its submission. The service enforces these rules, but
imports, workers, SQL maintenance, and future APIs can bypass it.

The current duplicate flag is a useful signal, not a duplicate invariant. Two
concurrent submissions for the same attendee/exhibitor can both observe no
prior record and remain unflagged. This preserves ADR-003's no-merge rule, but
future duplicate detection should be transactional or asynchronous and
recomputable.

There is no partial unique constraint for one active default form per event
exhibitor. ADR-002/003 require only one default initially; the current model
has an `is_default` column but does not enforce the intended cardinality.

The existing `users` record is a global identity, not yet the ADR-003 attendee
profile aggregate. It cannot represent company, title, industry, interests,
or field-level sharing/consent. The profile-read RLS function is narrowly
scoped to exhibitors with an existing relationship, which is directionally
correct, but it needs explicit lifecycle and consent design before more
profile data is added.

### API and transaction boundaries

Module ownership is broadly appropriate: organizations, events, exhibitors,
and engagement are separate. The lead-submission repository establishes RLS
inside a transaction and performs validation/read/write atomically.

The repository layer is inconsistent elsewhere. Some membership lookup
methods query directly without establishing request-scoped RLS context, while
other mutations use transactions. All future authorization-participating reads
and writes should use the established request context and an explicit scope;
a query that depends on ambient database session state is brittle.

The current engagement files are compact and use broad `any` input types in
the lead-form layer. This is not a runtime architecture failure, but it makes
boundary validation and future API contracts harder to audit. Future work
should introduce concrete input types only at public/service boundaries, not
another generic abstraction layer.

### Performance and scalability

The submission write is bounded: one form lookup, one field read, one optional
duplicate lookup, one submission insert, and one batched values insert. This
is suitable for the first online capture path and avoids N+1 inserts.

At scale, dashboard queries by event and time will need an explicit
`(event_id, submitted_at)` access path or an aggregate/read model; the current
indexes optimize exhibitor-local history instead. JSON values are correct for
immutable arbitrary form responses but are not a general analytics query
surface. Future analytics and semantic extraction should use derived,
permission-scoped read models rather than repeatedly scanning JSON values.

The synchronous duplicate lookup will become a contention and latency point
under high repeat-capture volume. Do not cache transactional submissions;
instead, measure it and move duplicate marking to a safe transactional or
asynchronous path when event traffic requires it.

No dashboard read model, cursor convention, projection contract, or cache
invalidation interface exists yet. This does not block the current milestone,
but dashboards must not query transactional submission/value tables directly
for broad, repeated views.

### AI readiness

Immutable form snapshots and independent submissions provide good source
evidence for summaries, qualification, embeddings, and CRM field mapping.
The event-exhibitor relationship supplies the correct tenant boundary for
exhibitor-specific intelligence. The architecture is not yet ready to execute
AI features because it lacks: a complete attendee profile/consent model,
relationship data aggregate, derived intelligence storage with provenance,
asynchronous job/outbox boundary, and analytics/read models. Those are
expected next-layer foundations, not defects to patch inside capture.

## Risks and technical debt

### Critical

1. **Submission cross-table integrity is service-only.** A mismatched event,
   event exhibitor, form, or form field can be written outside the service.
   This risks cross-event analytics corruption and weakens tenant data
   guarantees. Harden the shared database write boundary before imports,
   public capture, workers, or intelligence jobs write submissions.
2. **ADR-003 progressive profile has no aggregate or consent model.** The
   current user identity cannot support the approved shared professional
   profile or field-level sharing. Do not claim automatic enrichment beyond
   email/name until the owning profile and consent milestone is designed.

### Important

1. **Duplicate marking has a concurrency gap.** Preserve every interaction,
   but ensure duplicate detection is eventually consistent under concurrent
   capture.
2. **Default-form cardinality is not enforced.** Add the invariant when a
   default-form selection workflow is implemented.
3. **Some repository reads do not establish RLS context.** Consolidate scoped
   repository access on the existing request-transaction mechanism before
   adding controllers and broader query surfaces.
4. **No idempotency key exists for lead submission.** Online capture is in
   scope now; retries from mobile networks need an explicit idempotency design
   before public/mobile capture is released.
5. **No event-level analytics access path/read model exists.** Add one with
   the dashboard milestone, not prematurely in capture.
6. **Security-definer profile access needs operational controls.** Fix its
   owner and search path deliberately, test its allowed/denied cases, and keep
   it limited to consented, relationship-authorized fields.

### Minor

1. Engagement schema/service formatting and broad input typing reduce
   readability and auditability.
2. Migration files are dense one-line SQL, making future review and incident
   diagnosis harder.
3. Current documentation still references older agenda/registration concepts;
   ROADMAP_V2 appropriately deprioritizes them, but future tickets should use
   the V2 vocabulary.

## Recommended improvements

1. Before Intelligence Layer features, write a small design ticket for the
   submission integrity and idempotency boundary: database-enforced
   event/exhibitor/form/field consistency, retry semantics, and concurrency
   behavior. Do not conflate it with lifecycle or AI work.
2. Create an ADR for the attendee professional profile, consent/share model,
   and profile-to-exhibitor visibility lifecycle before implementing
   enrichment. It must distinguish global attendee identity from
   exhibitor-private relationship data.
3. Define a dashboard read-model contract before dashboard implementation:
   tenant-scoped projections, cursor pagination, event/time access patterns,
   aggregate privacy rules, invalidation, and eventual real-time inputs.
4. Define an asynchronous intelligence boundary (outbox/job/provenance) before
   AI summaries, embeddings, or CRM synchronization. AI must consume durable
   records and never block capture.
5. Make repository reads explicitly scoped through the existing RLS context,
   and add authorization integration coverage when controllers are introduced.

## Security review

The strongest current property is exhibitor isolation: lead submissions and
values are visible only through the exhibitor organization RLS path, while
organizer participation access does not automatically grant raw lead access.
This correctly protects exhibitor relationship data.

Remaining assumptions: public visitor capture has no implemented authorization
path; a future endpoint must authenticate/authorize the event/booth/form
without granting visitors tenant read access. Attendee profile visibility must
be consent-bound before fields beyond basic identity are shared. Platform
bypass, security-definer functions, imports, and background jobs require
audited, least-privilege execution paths; they must not bypass the submission
integrity rules.

## Readiness score

| Area | Score | Rationale |
|---|---:|---|
| Product Architecture | 8/10 | Clear exhibitor-first roadmap and boundaries. |
| Domain Model | 7/10 | Strong tenant/event/capture core; attendee profile and relationship aggregate deferred. |
| Database | 6/10 | Good foundations and RLS; cross-table submission invariants need hardening. |
| API | 6/10 | Sensible modules and service/repository split; scoped read consistency and public contracts remain incomplete. |
| Performance | 7/10 | Good bounded capture write; dashboard/read-model architecture is not yet present. |
| Security | 7/10 | Strong exhibitor isolation; profile consent, public capture, and privileged paths need design. |
| Scalability | 6/10 | Append history and key indexes are sound; aggregate/read paths and retry/concurrency design are pending. |
| AI Readiness | 5/10 | High-quality immutable source evidence exists; profile, consent, jobs, provenance, and derived models are missing. |

## Conclusion

ExAi is not ready to begin broad Intelligence Layer feature implementation.
It is ready for a focused architecture-hardening step: submission integrity
and idempotency design, followed by attendee-profile/consent architecture.
After those boundaries are defined, dashboards, CRM, and AI can evolve from
durable, tenant-safe evidence rather than forcing a redesign of capture.

