# ExAi Performance Guidelines

**Status:** Mandatory engineering standard  
**Date:** 2026-07-13

## Purpose

Performance is a product feature. Every ExAi implementation must optimize for
low latency, minimal network overhead, smooth interaction, scalability, and
maintainability. Perceived responsiveness matters as much as raw timing: an
interaction should acknowledge pointer or touch input immediately and remain
interruptible.

This document complements ADR-001, ADR-002, ADR-003, and ROADMAP_V2. It is
mandatory for future implementation tickets unless a ticket explicitly
overrides a standard with a documented reason.

Performance targets never justify weakening correctness, authorization, RLS,
transactional integrity, privacy, or accessibility.

## Latency targets

These are engineering targets to measure against, not guarantees. Targets
apply under normal production conditions and should be refined with real-user
measurements.

| Interaction | Target |
|---|---:|
| Initial useful page content | under 2.5 s on a typical mobile connection |
| Local navigation feedback | under 100 ms |
| Completed client-side navigation | under 500 ms when data is warm |
| Typical API response | p95 under 300 ms, excluding intentionally asynchronous work |
| Dashboard incremental refresh | p95 under 1 s |
| Field-level form validation feedback | under 100 ms locally; under 300 ms when server-backed |
| Lead submission acknowledgement | under 500 ms; durable completion under 2 s |

Do not add artificial delays. Show immediate state feedback on pointer/touch
down where appropriate, use motion only to communicate state, and respect
reduced-motion preferences.

## Database standards

- Eliminate N+1 query patterns; load related records with a bounded query,
  explicit join, or batched lookup.
- Select only columns required by the caller. Do not overfetch large JSON,
  profile, or response payloads.
- Add indexes for proven primary filters, joins, ordering, and high-volume
  tenant queries. Review index write cost before adding speculative indexes.
- Batch independent writes where it preserves error semantics. Keep
  authorization and consistency-related writes transactional.
- Keep transactions short: validate and prepare outside the transaction when
  safe, then perform the smallest necessary reads and writes inside it.
- Use cursor pagination for unbounded collections. Avoid offset pagination on
  high-cardinality event data.
- Design high-write tables for event peaks: stable tenant/query keys,
  append-oriented history where appropriate, and a path to future partitioning
  without prematurely partitioning small tables.
- Every mutation that participates in authorization must retain the existing
  request-scoped RLS transaction context.

## React and rendering standards

- Prefer Server Components and server data access for initial reads.
- Use streaming and partial rendering when a page has independent slow regions.
- Lazy-load non-critical client code and defer heavy, below-the-fold surfaces.
- Use optimistic UI only when the operation is safe to reconcile or roll back.
- Keep client state local and minimal. Avoid global state for server data that
  can be rendered or fetched at the boundary that needs it.
- Avoid full-form rerenders for individual field updates. Prefer field-level
  validation and progressive rendering for large lead forms.
- Add memoization only after measurement identifies a render bottleneck.
- Motion must be stateful, interruptible, spatially consistent, and optional
  for reduced-motion users; decorative animation is not a feature.

## Dashboard standards

Dashboards must be designed for incremental refreshes, partial updates,
background refresh, cache invalidation, and future real-time transport. Do
not require a full-page reload to update one metric, chart, or list.

Current implementations do not need live updates. New read models and API
responses must, however, be independently fetchable and cacheable so streaming
or background invalidation can be added without redesign. Organizer reporting
continues to use privacy-safe aggregate models; it must not gain raw exhibitor
lead access for convenience.

## Mobile standards

Assume attendees primarily use mobile devices and may have constrained,
variable connectivity.

- Make primary actions touch-friendly and acknowledge input immediately.
- Minimize typing, repeated data entry, payload size, and round trips.
- Preserve a responsive shell while non-critical content loads.
- Avoid interaction patterns that depend on hover, precise pointers, or large
  uninterrupted bandwidth.
- Keep attendee-facing pages lightweight; load rich media and non-essential
  intelligence on demand.

## API standards

- Use consistent resource shapes, error responses, and HTTP semantics.
- Support explicit filtering, stable sorting, cursor pagination, and field
  projection for collection endpoints where their data can grow.
- Make write endpoints idempotent when retry, weak connectivity, or client
  replay can create duplicate effects.
- Validate at trust boundaries and return actionable, consistent errors.
- Avoid unnecessary serialization, nested expansion, and network hops.
- Treat tenant scope and authorization as mandatory query inputs, never as
  optional post-filtering.

## AI standards

- Run AI work asynchronously whenever it is not required to complete the
  primary user workflow.
- AI must never block lead capture, form submission, identity updates, or
  other durable transactional actions.
- Cache deterministic or safely reusable results only when invalidation and
  data visibility are clear.
- Keep AI inputs bounded, permission-scoped, observable, and independently
  measurable. Deterministic product behavior remains available without AI.

## Observability standards

Every production feature should make its performance observable through
structured logging, metrics, and tracing appropriate to its criticality.

- Record API latency, status class, route, tenant-safe operation name, and
  correlation/request identifiers.
- Track slow queries and database connection/transaction duration.
- Measure dashboard region load and refresh performance separately from page
  shell performance.
- Track lead-capture acceptance time, validation failures, retries, and
  duplicate flags without logging raw attendee or exhibitor-private content.
- Use traces to identify cross-service latency and N+1 behavior before adding
  caches or abstractions.

## Scalability baseline

All future designs must naturally accommodate events with at least:

- 50,000 attendees;
- 1,000 exhibitors;
- millions of interactions; and
- continuous lead-profile enrichment.

This baseline favors bounded queries, append-oriented immutable history,
tenant-scoped indexes, asynchronous enrichment, and independently refreshable
read surfaces. It does not require premature caching, partitioning, live
transport, or distributed infrastructure.

## Ticket expectations

Every future implementation summary must state:

1. performance implications;
2. database implications;
3. rendering implications; and
4. scalability considerations.

If a ticket intentionally departs from these guidelines, document the reason,
the measured or expected cost, and the condition that would trigger a
follow-up.
