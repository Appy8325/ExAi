# ADR-002 — Lead Capture Architecture

**Status:** Accepted  
**Date:** 2026-07-13

## Context

ExAi is an Exhibitor Intelligence Platform. Lead capture exists to maximize
exhibitor ROI. The attendee experience exists only to facilitate high-quality
exhibitor interactions; ExAi complements rather than replaces an event
management platform.

This ADR is the source of truth for future lead-related development.

## Decision

### Hybrid capture

Support two entry points to the same canonical Lead Submission:

1. **Visitor self-service:** a visitor scans an exhibitor QR code, opens the
   exhibitor's form, and submits it.
2. **Exhibitor-assisted:** exhibitor staff opens that same form on their
   device and completes it with the visitor.

The submission differs only by its stored interaction source. Initial values
are `visitor_qr` and `exhibitor_device`. Future values may include
`badge_scan`, `api`, `manual_import`, `business_card_ocr`, and `crm_import`.

### Registration and badge data

Badge scans may prefill attendee data through a provider-agnostic abstraction.
Providers can include Cvent, EventMobi, Bizzabo, Swoogo, CSV imports, custom
APIs, and QR payloads. Provider data is an optional input to capture, never a
dependency of the Lead Submission model.

### Forms and submissions

- An event exhibitor can own multiple Lead Forms, such as General Inquiry,
  Product Demo, Partnership, or Careers. Only one default form is needed
  initially.
- Lead Forms are editable and affect only future submissions.
- Lead Submissions are immutable historical records. Each preserves the form
  structure and responses in effect at submission time.
- On a return visit, locate prior submissions and use their answers for
  prefill. Allow edits, then create a new submission; never overwrite prior
  history.

### Duplicates and lifecycle

Never automatically merge submissions. Every interaction has business value.
Potential duplicates may be marked, while historical submissions remain
independent.

The model must support a future lifecycle such as New → Qualified → Follow-up
→ Meeting Scheduled → Opportunity → Customer → Lost. Lifecycle behavior is
not part of initial capture.

### Deferred capability

Offline mode is deferred. The initial product is an online web application.

## Alternatives considered

| Alternative | Decision |
|---|---|
| Separate submission models for QR and staff capture | Rejected: duplicated history and analytics semantics. |
| Provider-specific badge integrations in the core capture model | Rejected: couples capture to external event platforms. |
| Automatic duplicate merging | Rejected: destroys interaction history and can remove exhibitor value. |
| Updating a prior submission for a returning visitor | Rejected: loses historical context. |
| Mutable submission records | Rejected: prevents reliable analytics and form-version history. |
| Offline-first capture now | Deferred: adds synchronization complexity before online capture is proven. |

## Reasoning and trade-offs

One submission model keeps reporting, CRM sync, and AI analysis independent of
how an interaction began. Provider-neutral prefill permits integration with
existing event systems without making ExAi a registration platform. Immutable
submissions retain business history, at the cost of storing snapshots and
handling duplicates as a review signal rather than a merge operation.

Multiple forms preserve exhibitor use cases without fragmenting the capture
path. Deferring offline mode keeps the first implementation focused, while the
interaction-source field leaves an explicit extension point.

## Future compatibility

The canonical model must support, without rewriting historical submissions:

- CRM integrations and field mapping from the preserved form snapshot.
- AI qualification and summarization over immutable responses.
- Analytics by event, exhibitor, form, source, and potential-duplicate state.
- Form versioning through the submission's preserved structure.
- Conditional fields by preserving both the field definition and submitted
  response state.
- Multi-event exhibitors and cross-event analytics through the existing event
  exhibitor relationship.

## Constraints

This ADR authorizes no implementation. Do not add lead submissions, QR
scanning, badge providers, duplicate detection, lifecycle workflow, CRM,
analytics, AI, offline support, schema changes, or UI as part of this ADR.
