# Roadmap V2 — Exhibitor Intelligence Platform

## Updated product vision

ExAi is an **Exhibitor Intelligence Platform**. It helps exhibitors capture,
qualify, understand, and act on event interactions. It complements the
registration, ticketing, agenda, and event-operations systems an organizer
already uses; it is not a general event-management replacement.

The product must deliver useful exhibitor value before it attempts broad
event-management coverage. An event remains the integration and reporting
context, while the exhibitor organization and its event participation are the
commercial center of the product.

## Core personas

| Priority | Persona | Primary outcome |
|---|---|---|
| 1 | Exhibitor | Capture qualified leads, understand performance, and follow up in their CRM. |
| 2 | Organizer | Provision exhibitors, configure the event context, and see aggregate exhibitor value. |
| 3 | Visitor / attendee | Consent to and complete an interaction; attendee-facing experience is not the initial product surface. |

## Completed foundations that remain essential

| Foundation | Why it remains core |
|---|---|
| Supabase user provisioning and UUID consistency | A durable identity is required for exhibitor staff, organizer administrators, and future CRM attribution. |
| Organizations, memberships, owner invariant, roles, permissions, and RLS | These provide the tenant boundary between exhibitor organizations and organizer organizations. They should remain the shared authorization foundation. |
| Invitation lifecycle | Organizer and exhibitor staff onboarding can reuse the existing token lifecycle when their owning relationship tables exist. |
| Event foundation | Keep as a lightweight organizer-owned context for participation, leads, analytics, and integrations. Do not grow it into a ticketing or registration platform. |
| Agenda-session foundation | It is a valid optional event-context capability, but should not receive additional priority until it demonstrably improves exhibitor outcomes. |

## Features to prioritize

1. **Exhibitor participation and booth profile** — `event_exhibitors`, exhibitor organization claim, exhibitor staff, booth assignment/profile, and organizer provisioning.
2. **Custom lead forms and consent** — organizer/event-configured fields with a stable exhibitor capture flow and explicit contact-sharing consent.
3. **Lead capture and qualification** — manual and scan-assisted capture, idempotent/offline-safe intake, lead pipeline, ownership, notes, and follow-up state.
4. **Exhibitor analytics** — leads, qualified leads, conversion, capture sources, follow-up performance, and booth-level outcomes.
5. **Organizer analytics** — aggregate, privacy-safe adoption and outcome reporting across exhibitors; never expose one exhibitor's raw leads to another tenant.
6. **CRM integration** — outbound lead sync, field mapping, delivery status, retry, and audit trail.
7. **AI insights** — only after clean, deterministic lead and analytics data exist: qualification assistance, summaries, and recommended follow-up.

## Features to defer

- Agenda/session expansion, speakers, check-ins, and attendee schedule features.
- Registration, tickets, payments, badge issuance, and general attendee management.
- Full floor-plan editor and broad venue management; retain only the booth context needed for exhibitor activation and reporting.
- Matchmaking, networking, attendee discovery, and event social features.
- General event CMS, marketing-site event pages, and replacement of an organizer's existing event platform.

These are not rejected. They become integration-dependent or demand-driven
capabilities after the exhibitor intelligence loop is proven.

## Revised milestone order

### V2-0 — Foundation completion and product boundary

Finish the existing authentication wiring, request identity context, and
organization-scoped authorization integration. Treat the event aggregate as
context only. Document external event-system identifiers and import strategy
before adding event-management features.

**Outcome:** an authenticated organizer can establish a secure event context;
an exhibitor tenant can be safely represented.

### V2-1 — Exhibitor participation and activation

Implement organizer-to-exhibitor participation: `event_exhibitors`, exhibitor
organization claim, exhibitor staff, minimal booth/profile data, and invitation
paths authorized by ADR-001. Keep organizer setup intentionally thin.

**Outcome:** an exhibitor can claim its presence at an event and add the staff
who will capture leads.

### V2-2 — Lead capture core

Implement custom lead-form definitions, consent capture, lead capture,
qualification state, notes, idempotency, and offline-safe intake. Add the
minimum visitor interaction needed to create a lead; do not build a general
attendee product.

**Outcome:** exhibitors can reliably collect and qualify leads at an event.

#### Approved lead capture principles

- Each booth has one public QR code that opens its landing page, not a
  form-specific URL. Visitor self-service and exhibitor-assisted capture both
  create the same canonical submission; only the interaction source differs.
- Badge and registration data is an optional, provider-agnostic prefill input,
  never a dependency of the capture model.
- The initial product is online-only. Offline capture is deferred.
- Keep every interaction as an independent historical submission. Detect and
  mark potential duplicates; never merge automatically.
- Returning visitors may prefill from prior submissions, edit their answers,
  and create a new historical submission.
- Each event exhibitor may own multiple forms. One default form is sufficient
  initially.
- Submissions record an interaction source. Initial sources are Visitor QR and
  Exhibitor Device; scan, API, import, OCR, and CRM sources remain future
  extensions.
- Forms remain editable for future captures. Submissions are immutable
  snapshots of the form structure and answers at submission time.
- Lead lifecycle stages and workflow are deferred, but the capture model must
  accommodate them without rewriting historical submissions.

See [ADR-003](ADR-003-Progressive-Lead-Intelligence.md) for the canonical
lead architecture. ADR-002 remains the lead-submission foundation where it
does not conflict with ADR-003.

### V2-3 — Intelligence dashboards

Implement exhibitor dashboards first, then organizer aggregate dashboards.
Build deterministic metrics, data-quality checks, and exportable reports
before AI recommendations.

**Outcome:** exhibitors can measure event ROI and organizers can demonstrate
platform value without accessing tenant-private lead contents.

### V2-4 — CRM and operational integrations

Implement CRM connections, field mappings, sync/retry visibility, audit
history, and import paths from external event systems where needed.

**Outcome:** qualified leads reach the exhibitor's system of record with
traceable delivery.

### V2-5 — AI insights

Add AI lead summaries, suggested qualification, and follow-up recommendations
over the deterministic lead and analytics substrate. Keep each recommendation
reviewable and avoid making AI a capture-path dependency.

**Outcome:** exhibitors receive actionable intelligence, not just a larger
event database.

## Architectural impact assessment

No completed implementation requires refactoring before V2-1.

- The organization and RLS model already supports the required dual tenancy:
  organizer owns the event; exhibitor owns its organization-scoped data;
  `event_exhibitors` is the explicit participation bridge.
- The current permission and invitation foundations should be extended by
  scope-specific relationships (`event_staff`, `exhibitor_staff`), not replaced
  or merged into organization memberships.
- The event aggregate remains a sound parent context. Avoid adding registration,
  tickets, venue catalog, or agenda dependencies to the lead path.
- `agenda_sessions` should remain isolated in the Agenda module and be treated
  as optional. No session refactor is needed; further investment should wait
  for a demonstrated exhibitor intelligence use case.
- The current exhibitor and engagement schemas are placeholders. Replace them
  through focused, additive migrations when V2-1 and V2-2 begin; do not build
  on their placeholder shapes.

## Guardrails for future tickets

- Every new exhibitor-facing record must have an explicit tenant owner and RLS
  policy.
- Organizer reporting must use an explicit aggregate/read model; it must not
  gain standing read access to exhibitor-owned raw lead records.
- Capture remains useful without AI, CRM, or agenda data. Those systems enrich
  the loop later.
- Prefer integration identifiers and import boundaries over recreating an
  external event platform's registration, ticketing, or schedule domain.
