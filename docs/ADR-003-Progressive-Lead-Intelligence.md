# ADR-003 — Progressive Lead Intelligence Architecture

**Status:** Accepted  
**Date:** 2026-07-13

## Context

ExAi is not a lead scanner. It is an Exhibitor Intelligence Platform built
around progressively enriched professional relationships rather than isolated
lead forms. This ADR is the canonical architecture for all future lead
features and supersedes ADR-002 where the two conflict.

## Decision

### One booth QR

Each booth owns exactly one public QR code. Scanning it opens the booth
landing page, never a specific lead form. The landing page may offer booth and
product information, downloads, videos, an AI assistant, lead capture, and
contact actions.

### Hybrid lead capture

- **Visitor self-service:** the visitor scans the booth QR, opens the landing
  page, completes a lead form, and creates a Lead Submission.
- **Exhibitor-assisted:** exhibitor staff opens the same form on their device
  and completes it with the visitor, creating a Lead Submission.

Both paths create the same canonical Lead Submission. Only `interaction_source`
differs: initially `visitor_qr` or `exhibitor_device`; later possibly
`badge_scan`, `api`, `manual_import`, `business_card_ocr`, or `crm_import`.

### Progressive profile enrichment

The attendee owns one living professional profile. An initial interaction may
contain only an email. As the attendee shares company, title, industry,
company size, interests, LinkedIn, and other profile data, every exhibitor
already authorized to access that attendee receives the newly shared profile
information. No additional submission is required.

### Relationship scope

Relationships are event-scoped. Identity is global. Intelligence may aggregate
across relationships, but relationships themselves are never shared across
events.

### Data ownership

| Layer | Owner | Examples |
|---|---|---|
| Global attendee identity | Attendee | Name, email, company, job title, industry, LinkedIn |
| Exhibitor relationship data | That exhibitor only | Qualification, notes, budget, buying timeline, product interest, meeting outcome |
| AI intelligence | ExAi | AI summary, lead score, buying intent, recommended follow-up, ICP match, risk indicators |

Relationship data is never shared with another exhibitor. AI-derived data
must respect the data layer and audience from which it is generated.

### Interactions, duplicates, and returning visitors

Never automatically merge leads. Each interaction is valuable; a potential
duplicate may be marked while all historical interactions remain independent
and immutable.

On a return visit, prefill previously shared information and permit current
answers to be edited. Create a new interaction rather than updating history.

### Provider-independent badge data

Badge and registration data are accessed through provider adapters, not the
core capture model. Future adapters can support Cvent, EventMobi, Bizzabo,
Swoogo, CSV, and custom APIs.

### Deferred lifecycle and offline operation

Future relationship stages include New, Qualified, Follow-up, Meeting
Scheduled, Opportunity, Customer, and Lost. Lifecycle behavior is not part of
initial lead capture. Offline mode is also deferred; the initial product is an
online web application.

### Hourly intelligence pulse

During live events, ExAi may detect scans, profile enrichment, interactions,
and updated attendee information. Exhibitors may receive lead-enrichment,
new-ICP-match, and AI-summary notifications. Organizers may receive only
anonymous aggregate engagement, booth traffic, heatmaps, and event
intelligence; exhibitor-private relationship data is never exposed.

## Alternatives considered

| Alternative | Decision |
|---|---|
| A QR code per form | Rejected: breaks the booth's stable public entry point. |
| Separate lead records by capture method | Rejected: fragments one relationship model. |
| Duplicate merging | Rejected: destroys interaction history. |
| One lead profile per exhibitor | Rejected: causes repeated data entry and prevents progressive enrichment. |
| Provider-specific capture models | Rejected: couples ExAi to event platforms. |
| Broad organizer access to raw lead data | Rejected: violates exhibitor relationship ownership. |

## Reasoning and trade-offs

A stable booth landing page lets the public QR evolve without reprinting
collateral or selecting a form in advance. A shared attendee profile reduces
repeated data entry, while separate exhibitor relationship data preserves
tenant privacy and competitive boundaries. Immutable interactions retain the
evidence needed for analytics, CRM synchronization, and AI, at the cost of
representing duplicates and returns as separate records.

The intelligence pulse is a future read and notification capability, not a
reason to expose raw exhibitor data to organizers or create an online-only
capture dependency on any registration provider.

## Product philosophy

Attendees should not repeatedly complete the same professional information.
They progressively build one professional identity. Exhibitors progressively
build independent relationships with that identity. ExAi continuously
increases the value of both.

## Constraints

This ADR authorizes no code, schema, migration, test, UI, QR implementation,
profile, submission, provider adapter, lifecycle, notification, analytics, or
AI implementation.
