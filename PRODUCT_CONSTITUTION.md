# ExAi Product Constitution

**Status:** Active  
**Version:** 1.0.0  
**Effective date:** 2026-07-18  
**Owner:** ExAi Founder / Product Leadership  
**Applies to:** Every product decision, architecture decision, implementation, migration, test, release, and operational change in this repository

## 1. Authority and purpose

This document is the highest-level source of truth for ExAi. It defines what the product is, whom it serves, the workflow it must protect, and the non-negotiable standards for building and operating it.

All future contributors and AI coding sessions must read this document before proposing or making changes. Existing requirements, architecture documents, ADRs, roadmaps, tickets, code, tests, and deployment instructions are subordinate to it. When another artifact conflicts with this constitution:

1. This constitution wins.
2. The conflict must be reported explicitly.
3. Code must not copy or preserve the conflicting behavior merely because it already exists.
4. The subordinate artifact must be reconciled through an approved documentation change before or with the implementation that depends on it.
5. No contributor may silently reinterpret this constitution to make an existing implementation appear compliant.

This is a product constitution, not a complete low-level design. Domain ADRs may choose implementation details only inside the boundaries established here.

### 1.1 Change control

- Constitutional changes require explicit approval from the Founder / Product Leadership.
- Every amendment must include the reason, affected journeys, data/security consequences, migration impact, and rollout plan.
- An amendment may strengthen the canonical workflow. It may not casually replace, bypass, or fragment it.
- Emergency security fixes may be shipped immediately when delay would increase harm, but the decision and any constitutional implication must be documented afterward.
- Convenience, deadlines, demos, build failures, or sunk implementation cost are not valid reasons to weaken a constitutional requirement.

## 2. Product identity and vision

ExAi is a production-grade, AI-powered event platform that turns the physical booth journey into a trusted digital workflow and useful intelligence for organizers, exhibitors, and attendees.

ExAi is not a hackathon prototype, a static event directory, a generic chatbot, or a collection of disconnected dashboards. Its value comes from completing one coherent loop:

> Organizers create the event environment, exhibitors make their booths knowledgeable and measurable, attendees create intentional connections, and ExAi converts those interactions into actionable event intelligence.

The product must work for real events with intermittent connectivity, high concurrency, sensitive commercial data, and users who cannot be trained on internal system concepts. AI should make the workflow more useful, but the workflow must remain reliable and honest when AI or a model provider is unavailable.

### 2.1 Product outcomes

ExAi succeeds when it consistently produces all of the following outcomes:

- Organizers can launch and operate events, onboard exhibitors, observe trustworthy live activity, and prove event value.
- Exhibitors can publish a credible booth experience, collect consented leads, and understand whom to follow up with and why.
- Attendees can move from a QR scan to relevant information, an intentional connection, and useful recommendations with minimal friction.
- Every accepted lead is traceable to a real event, exhibitor participation, booth, attendee interaction, consent state, and form version.
- AI outputs are grounded, attributable, reviewable, and clearly separated from recorded facts.
- The platform is deployable, observable, recoverable, secure, and supportable in production.

### 2.2 North-star workflow metric

The primary product metric is **Qualified Connections per Event**: consented attendee-exhibitor connections that contain sufficient captured context to support meaningful exhibitor follow-up and that contribute to organizer-level event outcomes.

Secondary metrics may measure activation, content readiness, QR conversion, form completion, lead quality, follow-up, and report use. They must not optimize a local step by harming completion, trust, consent, or data quality elsewhere in the canonical workflow.

## 3. Core users and their responsibilities

ExAi has three primary product personas. Internal platform administration supports them but must not redefine the product around internal operations.

### 3.1 Organizer

The Organizer represents an event-producing organization.

Organizers:

- create and administer organizer organizations;
- create, configure, publish, run, complete, and archive events;
- invite exhibitors into specific events;
- monitor exhibitor onboarding and booth readiness;
- monitor live, event-level analytics without accessing exhibitor-owned private lead detail by default;
- manage event operations, policy, and aggregate reporting;
- generate and review AI-assisted end-of-event reports.

Organizer roles may differ in permission, but role differences must not create alternate domain workflows.

### 3.2 Exhibitor

The Exhibitor represents a company participating in an event.

Exhibitors:

- accept an event invitation and join or establish their exhibitor organization;
- create and configure their event-scoped booth experience;
- upload brochures, PDFs, presentations, pricing, websites, product information, and other approved sources;
- review ingestion, extraction, indexing, and publication status;
- configure and publish custom lead forms;
- generate, rotate, disable, download, and test booth QR codes;
- collect leads through attendee self-scan and approved staffed capture flows;
- receive deterministic lead records plus AI-generated lead intelligence;
- manage their own team, notes, exports, follow-up, consent obligations, and retention obligations.

An exhibitor organization may participate in multiple events. Reusable company content and event-specific booth content must remain distinguishable.

### 3.3 Attendee

The Attendee is a person discovering and engaging with exhibitors.

Attendees:

- scan a booth QR code without needing to understand ExAi's tenant model;
- view public booth and product information before being asked for unnecessary personal data;
- interact with grounded AI where available;
- intentionally submit a lead form and grant clear, scoped consent;
- receive confirmation and useful recommendations;
- manage their identity, shared profile data, saved exhibitors, and consent where applicable;
- request access, correction, export, or deletion according to applicable policy and law.

## 4. Canonical domain model

The following relationships are constitutional even if table or service names evolve:

- An **Organizer Organization** is the tenant that owns an event.
- An **Event** belongs to exactly one organizer organization.
- An **Exhibitor Organization** owns its company identity, reusable catalog, private lead workspace, and exhibitor staff relationships.
- An **Event Participation** links exactly one exhibitor organization to exactly one event and records invitation, acceptance, readiness, and commercial state.
- A **Booth Experience** is the event-scoped public and operational presence created for an event participation.
- A **Physical Booth Assignment** is organizer-owned venue/floor inventory. It may be assigned to a booth experience but is not the booth's content or ownership boundary.
- A **Knowledge Source** belongs to an organization and is scoped as reusable company content or event-specific booth content.
- A **Lead Form Version** belongs to an event participation. A published version is immutable for historical submissions.
- A **QR Credential** belongs to a booth experience. It is opaque, revocable, rotatable, rate-limited, and never a raw database identifier.
- A **Lead Submission** is the immutable record of what the attendee submitted, to which form version, under which consent, and at what time.
- A **Lead** is the exhibitor-owned relationship/work item derived from one or more valid interactions. AI enrichment augments it; it does not create the underlying fact.
- **Analytics** are derived projections. They are never independent sources of truth.
- An **AI Insight** is a versioned, attributable interpretation with evidence and confidence. It is never silently stored as a user-provided fact.

IDs, slugs, QR credentials, invitation tokens, and authentication credentials are different concepts and must never be used interchangeably.

## 5. Canonical workflow

Every feature must preserve and strengthen this sequence:

```text
Organizer
  -> Organization
  -> Event
  -> Invite Exhibitors
  -> Exhibitor joins
  -> Booth creation
  -> Upload company documents
  -> AI indexes knowledge
  -> Configure lead form
  -> Generate QR code
  -> Attendee scans QR
  -> Lead form
  -> AI analysis
  -> Lead stored
  -> Dashboard updates
  -> Organizer analytics
  -> AI end-of-event report
```

Nothing may replace this workflow with an unrelated entry point, hidden shortcut, direct database mutation, demo-only path, or disconnected AI experience.

### 5.1 Required workflow gates

The workflow is implemented as explicit, observable states rather than assumptions inferred from page visits.

1. **Organization ready:** an authenticated organizer owns an active organizer organization.
2. **Event ready for onboarding:** required event identity, timezone, dates, privacy policy, and ownership are valid.
3. **Invitation issued:** an event-scoped, expiring, single-use invitation is delivered and auditable.
4. **Exhibitor joined:** the invitation is accepted by the intended identity and linked to an exhibitor organization and event participation.
5. **Booth created:** the event participation has an event-scoped booth experience with an accountable exhibitor owner.
6. **Knowledge ready:** required sources have passed validation, malware checks, extraction, chunking, embedding/indexing, and publication checks; failures are visible and retryable.
7. **Lead form ready:** at least one validated, previewed, published form version exists, including required consent language.
8. **QR ready:** an active, opaque QR credential resolves to the correct published booth and current form; a real scan test has passed.
9. **Attendee capture ready:** public booth content, form rendering, validation, consent, submission, idempotency, and confirmation work on supported mobile devices.
10. **Lead intelligence ready:** the raw submission is durable, the lead is deterministically available, and AI enrichment is queued or complete with an honest state.
11. **Dashboards ready:** exhibitor and organizer projections update from committed domain events and expose their freshness.
12. **Event reporting ready:** after event completion, deterministic metrics reconcile and the AI report is generated from cited, authorized data.

An event or booth may not display a `ready`, `published`, or equivalent state unless the relevant gates actually pass.

### 5.2 Technical ordering and failure safety

The business workflow lists AI analysis before the enriched lead is presented and used. Technical implementation must still protect captured data:

- The immutable lead submission and consent evidence must be durably committed before asynchronous AI work begins.
- A deterministic lead record must be available even if AI is delayed, disabled, over budget, or unavailable.
- AI enrichment transitions through explicit states such as `pending`, `processing`, `complete`, `failed`, and `not_available`.
- Dashboard counts must derive from committed records, not optimistic UI state.
- AI completion may update lead intelligence and dashboard projections, but it may not rewrite the original submission.
- Retries must be idempotent and must not create duplicate leads, analytics events, messages, or charges.

This is not a bypass of the canonical workflow; it is the durability requirement that keeps the workflow from losing leads.

## 6. Complete user journeys

### 6.1 Organizer journey

1. The organizer signs in through an approved identity flow.
2. The organizer creates an organizer organization or selects one they are authorized to manage.
3. The system creates ownership and audit records atomically.
4. The organizer creates an event with name, slug, timezone, schedule, required policy settings, and lifecycle state.
5. The organizer can save a draft, validate readiness, preview public behavior, and publish only when required checks pass.
6. The organizer invites exhibitors individually or through an approved import. Each invitation is event-scoped, traceable, expiring, and resendable without creating duplicate participation.
7. The organizer sees accurate invitation and readiness states: invited, delivered, accepted, booth incomplete, knowledge processing, form incomplete, QR ready, and blocked with reason.
8. Before the event, the organizer resolves blockers without editing exhibitor-owned private content or private lead data.
9. During the event, the organizer sees freshness-labelled aggregate activity, QR scans, form completions, exhibitor readiness, and operational failures.
10. The organizer cannot see attendee-to-exhibitor private answers, notes, or lead intelligence unless a documented policy, consent basis, and permission explicitly permit it.
11. When the event completes, deterministic metrics are reconciled before AI reporting begins.
12. The organizer requests or receives an AI-assisted end-of-event report containing citations, time ranges, data freshness, limitations, and no fabricated metrics.
13. The organizer can export approved reports and archive the event according to retention policy.

Required exception journeys include invalid dates, duplicate slugs, invitation resend/revoke/expiry, wrong-recipient acceptance, exhibitor withdrawal, unready publication, live-service degradation, report regeneration, and event archival/restoration policy.

### 6.2 Exhibitor journey

1. The exhibitor receives an event-specific invitation showing the organizer, event, intended company, expiry, and safe acceptance action.
2. The exhibitor authenticates and accepts the invitation. They join an existing exhibitor organization only with authorization or create/claim one through an approved verification path.
3. Acceptance creates or activates one event participation; repeated acceptance is idempotent.
4. The exhibitor creates the event-scoped booth experience and supplies company, booth, contact, branding, product, and public-description information.
5. The exhibitor uploads supported documents or registers approved website sources.
6. Every source shows validation, scan, extraction, indexing, publication, failure, retry, and deletion status. Unsupported or dangerous content is quarantined and never reaches retrieval.
7. The exhibitor can inspect which sources are active, correct metadata, remove a source, trigger re-indexing, and understand the effect on AI answers.
8. The exhibitor creates a custom lead form from supported field types, required/optional rules, consent text, and conditional logic.
9. The exhibitor previews and submits a real test form before publishing an immutable form version.
10. The exhibitor generates a booth QR credential only after booth, knowledge, and form readiness checks pass.
11. The exhibitor downloads, prints, scans, rotates, disables, and tests the QR without changing the public URL contract unexpectedly.
12. During the event, attendee submissions produce deterministic lead records immediately and AI enrichment asynchronously.
13. The exhibitor dashboard shows new leads, duplicate/returning relationships, consent state, source interaction, form version, intelligence status, and freshness.
14. AI lead intelligence explains its evidence and confidence and never invents firmographic or intent facts.
15. Authorized exhibitor staff can add private notes, manage follow-up state, export permitted data, and correct non-source-of-truth annotations.
16. After the event, the exhibitor retains or deletes data according to contract, consent, policy, and law.

Required exception journeys include expired/revoked invitation, conflicting organization claim, malicious file, failed extraction, partial indexing, website fetch failure, invalid form, QR revocation, offline capture, duplicate submission, AI failure, entitlement exhaustion, staff removal, and deletion request.

### 6.3 Attendee journey

1. The attendee scans a booth QR code on a supported mobile device.
2. The QR resolves quickly to the correct published booth or to a clear safe error when revoked, expired, malformed, rate-limited, or offline.
3. The attendee sees useful public booth information before an unnecessary authentication or lead gate.
4. The attendee may browse approved product/resources and ask grounded questions. AI answers cite booth sources and distinguish missing information from an answer.
5. When the attendee chooses to connect, the current published lead form is displayed with clear identity, purpose, required fields, consent, and privacy information.
6. Existing authenticated profile data may be offered as editable prefill; it is never shared merely because it exists.
7. The attendee submits once. Client and server validation agree, the request is idempotent, and network retry does not create a duplicate lead.
8. The attendee receives an honest confirmation only after durable acceptance. Pending offline submissions are labelled pending until synchronized.
9. The attendee receives useful, evidence-based recommendations or a deterministic alternative when AI is unavailable.
10. The attendee can review saved connections and exercise applicable privacy and consent controls.

The QR journey must meet accessibility, mobile performance, low-bandwidth, error recovery, and privacy standards. It may not redirect to a demo, require organizer knowledge, expose internal IDs, or fake AI results.

## 7. Product principles

1. **Protect the canonical workflow.** Strengthen the organizer-to-report loop; do not create parallel products inside ExAi.
2. **Complete beats broad.** One production-ready end-to-end slice is more valuable than many screens that stop at a button.
3. **Fast is a product feature.** Optimize QR resolution, form load, submission, and live dashboards for event-floor conditions.
4. **Truth before polish.** Never present mock, stale, optimistic, or AI-generated content as live fact.
5. **Deterministic core, AI advantage.** The platform remains usable without AI; AI adds explanation, synthesis, ranking, and assistance.
6. **One source of truth.** Recorded facts have one authoritative owner. Dashboards, reports, search indexes, and AI context are derived.
7. **Consent and ownership are product behavior.** They are visible in journeys, not buried in infrastructure.
8. **Tenant isolation is foundational.** Cross-tenant behavior is an explicit, tested use case, never an accidental query.
9. **Failure is a designed state.** Retries, partial completion, offline behavior, and recovery are part of the feature.
10. **No dead controls.** Every visible action works, is clearly disabled with a truthful reason, or is not shipped.
11. **Accessible by default.** Accessibility is a release gate, including event-floor mobile use.
12. **Operate what we ship.** Every production feature has observability, ownership, support behavior, and rollback.
13. **Prefer the simplest proven architecture.** Reuse existing boundaries and platform capabilities; add abstraction only for a present requirement.

## 8. AI philosophy and requirements

### 8.1 Role of AI

AI may summarize, classify, retrieve, recommend, rank, explain, draft, and identify patterns. AI may not become the sole authority for identity, permission, consent, billing, event state, form acceptance, lead existence, or recorded metrics.

### 8.2 Grounding and provenance

- Retrieval must be scoped by event, tenant, audience, permission, publication state, and source status.
- Exhibitor-supplied content is untrusted input, not system instruction.
- Every factual AI answer or report must retain source references sufficient for review.
- AI output must record feature, prompt version, model/provider, relevant source/version identifiers, generation time, safety result, latency, and cost where applicable.
- If evidence is missing or conflicting, the product must say so.
- AI-generated facts must not be copied into authoritative profile or lead fields without explicit review and provenance.

### 8.3 Safety and prompt-injection resistance

- Uploaded files, websites, form text, attendee content, and retrieved chunks must be treated as untrusted.
- System instructions and authorization context must never be constructed from untrusted content.
- Retrieval and tools must enforce authorization independently of model output.
- The model may not choose its own tenant, event, source visibility, write permissions, or tool scope.
- Inputs and outputs must pass feature-appropriate safety and data-loss-prevention checks.
- Sensitive content must not be sent to a provider unless contract, policy, region, consent, and configuration allow it.

### 8.4 Reliability, cost, and fallback

- Every AI feature has a deterministic fallback or an honest unavailable state.
- Model timeouts and budget exhaustion must never lose a lead or block core event operations.
- Provider calls require bounded retries, circuit breaking, idempotency where supported, and cost metering.
- AI jobs must expose status, retryability, and terminal failure.
- AI provider and model choices are centralized behind the AI boundary; feature code does not import provider SDKs directly.
- AI quality changes require evaluation against versioned golden sets and regression thresholds before release.

### 8.5 Human control

- Users must know when content is AI-generated.
- Material external communication, including follow-up drafts, requires human review unless a separately approved automation policy exists.
- Users can correct or reject AI annotations without changing immutable evidence.
- Organizer reports must separate measured facts, derived metrics, and AI interpretation.

### 8.6 Data use

ExAi customer data, attendee data, uploads, prompts, outputs, and feedback must not be used to train general-purpose models without explicit contractual authorization and informed consent. Provider settings must disable training and unnecessary retention wherever available.

## 9. Security and privacy principles

### 9.1 Identity and authorization

- Authentication is not authorization. Every protected operation checks the acting principal, tenant, event, participation, role, permission, and entitlement as applicable.
- Authorization is server-side and deny-by-default.
- Database row-level security is defense in depth and must be enabled and tested for every tenant-owned table.
- Service credentials never reach browsers, mobile clients, QR payloads, logs, or analytics.
- Sessions, invitations, magic links, API keys, and QR credentials are scoped, expiring or revocable, auditable, and stored securely.
- Public QR credentials use cryptographically strong opaque values and support rotation without exposing entity IDs.

### 9.2 API and application security

- Never bypass the API/domain boundary. Web clients, attendee surfaces, third parties, and scripts do not read or mutate product tables directly.
- Direct Supabase client use is restricted to approved authentication/session operations. Domain data flows through the ExAi API.
- All trust-boundary input is schema-validated; output is contract-validated for critical paths.
- Writes use authorization, idempotency, transactional integrity, and audit where appropriate.
- Apply rate limiting, abuse detection, CSRF protection, safe CORS, secure headers/CSP, SSRF prevention, and output encoding according to the threat model.
- Errors use stable public codes and never expose stack traces, secrets, raw SQL, private identifiers, or cross-tenant existence.

### 9.3 Files and external sources

- Uploads use allowlisted type/size rules, content sniffing, quarantine, malware scanning, safe extraction, and tenant-scoped storage paths.
- A file is not retrievable, indexable, or public until required checks pass.
- Website ingestion prevents SSRF, blocks private/link-local networks, limits redirects and size, and records the fetched URL and time.
- Deleting or revoking a source removes it from future retrieval and schedules derived artifacts for deletion according to policy.

### 9.4 Secrets and supply chain

- Never hardcode secrets, credentials, private URLs, or environment-specific tokens.
- Secrets live in approved secret managers, are least-privilege, rotated, environment-scoped, and never copied to examples.
- Lockfiles are committed; dependency changes are reviewed and scanned.
- CI performs secret, dependency, static-analysis, and container scanning appropriate to release risk.
- Production artifacts are built by CI from an identifiable commit and are not rebuilt manually with untracked changes.

### 9.5 Privacy and compliance

- Collect the minimum data required for a stated purpose.
- Consent must be informed, specific, recorded, versioned, and withdrawable where applicable.
- Retention and deletion are enforceable system behavior, not policy-only promises.
- Logs, traces, analytics, and test fixtures must not contain unnecessary personal data or secrets.
- Access to sensitive data is auditable.
- Data export, correction, deletion, legal hold, and incident response have documented operational paths before enterprise claims are made.

## 10. Data ownership and stewardship

### 10.1 Ownership by domain

- **Organizer:** owns event configuration, event branding, invitations, floor assignments, organizer content, and organizer-level aggregate analytics/reports, subject to contracts and attendee/exhibitor rights.
- **Exhibitor:** owns its organization profile, reusable catalog, uploaded company content, booth content, custom forms, private lead workspace, notes, and permitted lead exports.
- **Attendee:** retains rights in their identity, profile, answers, consent choices, and personal data. Submission grants scoped processing/sharing rights; it is not a transfer of ownership.
- **ExAi:** acts as platform operator and processor/custodian except for limited service metadata and legitimately aggregated/de-identified platform telemetry defined by contract and policy.

### 10.2 Cross-party visibility

- Organizers receive aggregate event analytics by default, not exhibitor-private lead answers or notes.
- Exhibitors receive attendee data only when a valid interaction, purpose, permission, and consent basis exists.
- Attendees see public booth content and their own saved/consented relationships.
- Platform administrators access tenant data only for approved support, security, compliance, or operational purposes, with reason and audit.
- Cross-tenant reads require dedicated, explicitly authorized query paths and tests.

### 10.3 Source-of-truth rules

- Immutable submissions preserve the exact accepted form version, answers, consent, timestamp, source, and idempotency identity.
- Corrections are new versioned facts or annotations; history is not silently overwritten.
- Analytics and search indexes are rebuildable from authoritative records and domain events.
- AI outputs are derivative records and may be regenerated without changing source evidence.
- Exports are snapshots with generation time, scope, and policy classification.

### 10.4 Lifecycle

Every data class must define creation, authoritative owner, visibility, retention, archival, deletion, export, recovery, and derived-data cleanup before production acceptance.

## 11. Cloud architecture principles

### 11.1 System boundaries

ExAi maintains these logical deployable boundaries unless an approved ADR changes them:

- a web/PWA surface for organizer, exhibitor, attendee, admin, and public experiences;
- one authoritative versioned API/domain service for product operations;
- asynchronous workers for ingestion, AI, analytics, notifications, exports, and maintenance;
- PostgreSQL as the transactional source of truth with enforced tenant isolation;
- object storage for untrusted and published files with quarantine separation;
- a durable queue/cache service for jobs, idempotency support, and non-authoritative acceleration;
- centralized observability, audit, and product analytics with data minimization.

### 11.2 Architecture rules

- Each environment has exactly one declared primary topology. Documentation and CI may not advertise multiple equally active production paths.
- Development, test, staging, and production are isolated by credentials, data, network, and deployment controls.
- Managed services are preferred when they reduce operational risk without violating ownership, security, portability, or cost requirements.
- Stateless web/API compute scales horizontally. Stateful truth remains in durable managed stores.
- Event-floor critical paths do not depend synchronously on background AI, email delivery, analytics aggregation, or third-party enrichment.
- Cross-service side effects use transactional outbox/event patterns or equivalent durability; messages are at-least-once and consumers are idempotent.
- Caches and realtime channels are never sources of truth.
- Availability targets, recovery time, recovery point, capacity, rate limits, and degradation behavior are defined and tested for each critical path.
- Infrastructure is reproducible as code or approved platform configuration with reviewable change history.
- Backups are encrypted and restore drills are performed; a backup that has never been restored is not considered proven.
- Services are regionally co-located where practical, and data residency requirements are explicit.
- Vendor-specific integrations stay behind owned boundaries. Portability is required where business risk justifies it, not as speculative abstraction.

### 11.3 Database change rules

- Migrations are forward-only in production and safe for rolling deployment.
- Use expand/migrate/contract for breaking schema changes.
- Migrations are tested against production-like data shape and scale.
- Destructive migrations require a backup/restore plan, data-owner approval, observability, and an explicit rollback or roll-forward strategy.
- Every tenant-owned table carries the required ownership key or has an approved, explicit cross-tenant model; RLS and isolation tests ship in the same change.

## 12. API and integration rules

- REST/OpenAPI remains the canonical public contract unless constitutionally amended.
- The API is versioned; breaking changes require a new version or an approved compatibility plan.
- The generated/typed client is derived from the API contract and used by first-party web code.
- Request and response names use canonical domain language.
- Resource identifiers do not substitute for credentials or authorization.
- POST and retryable writes require idempotency semantics.
- Errors follow a consistent problem-details format with stable machine-readable codes.
- Pagination, filtering, sorting, and timestamps are consistent across resources.
- Webhooks are signed, replay-resistant, retryable, observable, and documented as at-least-once.
- No production UI may depend on an undocumented endpoint or a hardcoded demo identifier.

## 13. Development rules

### 13.1 Before implementation

Every change begins by:

1. reading this constitution;
2. identifying the affected persona and canonical workflow steps;
3. tracing the existing behavior end-to-end across UI, API, domain, data, worker, and deployment boundaries;
4. defining acceptance criteria, failure states, security/data implications, tests, observability, and production rollout;
5. identifying conflicts with existing architecture documents or code;
6. obtaining approval for any constitutional, product-scope, destructive-data, or externally visible contract change.

### 13.2 Scope discipline

- Every feature must strengthen the canonical workflow rather than replace it.
- Build the smallest complete vertical slice that provides real user value.
- Do not add speculative abstractions, duplicate frameworks, parallel domain models, or future-only infrastructure.
- Reuse established code and platform capabilities before adding dependencies.
- Do not mix unrelated refactors with feature delivery.
- Do not remove functionality merely to pass lint, types, tests, builds, or deployment.
- Do not weaken validation, authorization, RLS, accessibility, observability, or tests to make a check green.
- Do not claim completion based on a mock screen, local-only path, seeded-only path, or build success.

### 13.3 Product completeness

- Never ship placeholder buttons, fake counters, fake AI output, hardcoded production records, misleading success states, or `coming soon` controls inside an accepted feature.
- A future feature may be omitted or hidden behind an off-by-default flag. It may not masquerade as working.
- Every visible control has a tested result, a truthful disabled explanation, or is removed from the release surface.
- Every workflow includes loading, empty, validation, permission, dependency-failure, retry, and success behavior.

### 13.4 Repository hygiene

- Preserve unrelated user changes and inspect the working tree before editing.
- Do not commit secrets, generated build output, transient logs, local environment files, or unexplained binaries.
- Documentation must match factual behavior after the change.
- Stale documents that could mislead implementation or operations are defects and must be reconciled.
- Approved ADRs explain significant tradeoffs; they do not override this constitution.

## 14. Coding rules

- TypeScript strict mode remains enabled in every TypeScript package.
- Never disable TypeScript, use `ts-ignore`/`ts-nocheck`, or weaken compiler settings to make code pass.
- Avoid `any`; use validated schemas, `unknown`, precise domain types, and narrow boundary adapters. Any necessary exception must be isolated and justified in review.
- Domain rules live in domain services and database constraints, not only in UI components.
- Controllers and UI components remain thin; repositories own persistence, and provider SDKs stay behind owned adapters.
- Web code never imports database packages or server credentials.
- All external input, environment configuration, job payloads, and untrusted JSON are validated at the boundary.
- Use database constraints for invariants that the database can enforce and application validation for clear user feedback.
- Multi-write business operations are transactional. External side effects occur after commit through a durable outbox or equivalent mechanism.
- Time is stored as UTC instants; event timezone is explicit; display uses the user's/event's stated timezone.
- Money uses integer minor units and explicit currency. Numeric analytics define precision and rounding.
- Public URLs use stable slugs or opaque public tokens, never security-through-obscurity identifiers.
- Logs are structured and correlated by request/job/event identifiers without leaking sensitive data.
- Errors are actionable for users and diagnosable for operators.
- Accessibility uses semantic HTML, keyboard support, focus management, sufficient contrast, labelled controls, and supported assistive technology.
- User-facing text, formatting, and locale-sensitive values follow the localization boundary; production behavior is not coupled to English string comparisons.
- New dependencies require a concrete current need, maintenance/security review, and confirmation that the platform or standard library is insufficient.
- Dead code, unresolved TODOs in active paths, placeholder implementations, and swallowed failures are not production-ready.

## 15. Testing requirements

Testing is risk-based but never optional for changed behavior.

### 15.1 Required test layers

- **Unit tests:** domain rules, validation, state transitions, parsing, and deterministic AI fallbacks.
- **Database/integration tests:** migrations, constraints, transactions, repositories, RLS, cross-tenant denial, idempotency, and outbox behavior against real PostgreSQL.
- **API contract tests:** authentication, authorization, validation, errors, compatibility, request/response schemas, and generated-client agreement.
- **End-to-end tests:** real persona workflows through deployed-like UI, API, database, storage/queue substitutes, and worker behavior.
- **Security tests:** tenant escape attempts, privilege escalation, token misuse, QR abuse, injection, SSRF, malicious files, rate limits, and secret leakage.
- **AI evaluations:** grounding, citation correctness, prompt injection, unsafe output, refusal behavior, quality regression, latency, and cost thresholds.
- **Accessibility tests:** automated checks plus keyboard and screen-reader verification for changed journeys.
- **Performance/resilience tests:** QR resolution, form submission, live dashboard freshness, burst traffic, offline/retry, queue backlog, provider outage, and recovery.
- **Production smoke tests:** health/readiness plus the release's critical workflow in a controlled production-safe form.

### 15.2 Canonical workflow coverage

The release test suite must maintain at least these end-to-end paths:

1. organizer creates organization and event;
2. organizer invites exhibitor;
3. exhibitor accepts, creates booth, uploads a source, and reaches indexed state;
4. exhibitor publishes a lead form and generates/tests a QR credential;
5. attendee scans, views content, submits the form, and receives confirmation;
6. exhibitor receives the deterministic lead and subsequent AI intelligence or fallback;
7. exhibitor and organizer dashboards update with correct visibility boundaries;
8. organizer completes the event and generates an evidence-backed report;
9. cross-tenant and unauthorized attempts fail at API and database layers;
10. AI/provider/queue/network failure does not lose or duplicate the lead.

### 15.3 Test quality rules

- Tests assert behavior, ownership, and observable outcomes, not implementation trivia.
- A passing test built entirely on hardcoded page data does not prove a product workflow.
- Mocks are appropriate at external provider boundaries; they do not replace database, API, authorization, or contract integration tests.
- Every fixed defect receives a regression test at the lowest layer that would have caught the root cause.
- Flaky tests are release defects. They are fixed or quarantined with owner, reason, and deadline; checks are not silently retried until green.
- Coverage percentages are supporting signals. Critical state, permission, money, consent, and security branches require explicit tests regardless of aggregate coverage.

## 16. Deployment and release rules

- Production deployment is mandatory for a release-bound feature to be Done.
- A feature is not complete when it works only locally, in a demo route, in seeded data, or in staging.
- Every merge passes formatting, lint, strict typecheck, unit/integration tests, build, security scans, and applicable E2E/AI/accessibility gates.
- CI builds immutable artifacts from the reviewed commit. The same artifacts progress through environments.
- Staging uses production-like topology and migrations and must pass the affected canonical journey before promotion.
- Production deploys are automated, auditable, least-privilege, and tied to a commit and release record.
- Database migrations run through an approved release sequence and are backward-compatible with the rolling application version.
- Every release defines owner, change summary, migration impact, feature-flag state, monitoring, rollback/roll-forward action, and success/failure thresholds.
- High-risk changes use progressive rollout or an approved maintenance plan.
- Feature flags do not excuse incomplete code. Both enabled and disabled states must be safe, tested, observable, and removable.
- After deployment, run health/readiness checks and the affected production-safe smoke journey, then observe error, latency, saturation, queue, and business signals.
- A failed production verification triggers rollback/roll-forward according to the runbook; it does not become accepted known breakage.
- Manual production changes are emergency-only, logged, peer-reviewed afterward, and reconciled back into source-controlled configuration.
- Backups and rollback claims must be tested. Never promise recovery that has not been exercised.

## 17. Definition of Done

A feature, fix, or workflow is Done only when all applicable conditions are true:

### Product

- The affected persona can complete the intended outcome end-to-end.
- The feature strengthens and does not bypass the canonical workflow.
- Acceptance criteria cover happy path, failure, recovery, permissions, privacy, accessibility, and operational behavior.
- No visible control, metric, AI output, or success state is fake, dead, or misleading.
- Adjacent workflow steps continue to work.

### Architecture and data

- The API/domain boundary is respected; no client bypass exists.
- Ownership, tenant scope, authorization, consent, retention, and audit behavior are explicit.
- State transitions and invariants are enforced at appropriate layers.
- Migrations, backfills, compatibility, and derived-data rebuild behavior are complete.
- Async work is durable, idempotent, observable, and recoverable.

### AI

- AI is grounded, scoped, attributable, evaluated, metered, and safely degraded.
- Deterministic behavior remains available for the core workflow.
- AI status and limitations are truthful to users.

### Quality and security

- Required tests pass in CI, including affected end-to-end and isolation paths.
- Strict TypeScript, lint, build, security, accessibility, and performance gates pass without suppression.
- Threat-model changes are addressed and no unresolved high/critical vulnerability is introduced.
- Logs, metrics, traces, alerts, and runbook actions exist for material failures.

### Release

- Documentation and API contracts match actual behavior.
- Staging verification passes.
- The change is deployed to production through the approved pipeline.
- Production smoke verification and observation pass.
- Rollback or roll-forward is proven and support/ownership is clear.

Documentation-only architecture work is Done when the requested source-of-truth artifact is approved, internally consistent, evidence-based, and introduces no unrequested code or runtime change. Production deployment requirements apply when that documentation is used to ship product behavior.

## 18. Feature acceptance criteria template

Every feature proposal or implementation ticket must answer all of the following:

1. **Persona:** Who uses it and who must not be able to use it?
2. **Outcome:** What real-world result does the user achieve?
3. **Workflow:** Which canonical steps does it strengthen, and what upstream/downstream states does it require?
4. **Entry/exit:** What is true before the feature begins, and what durable state proves completion?
5. **Data:** What is created/read/changed/deleted, who owns it, who can see it, and how long is it retained?
6. **Authorization:** What role, permission, entitlement, consent, and tenant checks apply?
7. **API contract:** What versioned operations, schemas, idempotency, errors, and compatibility guarantees apply?
8. **UI states:** What are the loading, empty, partial, validation, disabled, success, failure, retry, offline, and revoked states?
9. **AI:** Is AI necessary? What evidence, model/prompt version, safety controls, fallback, latency, cost, and evaluation threshold apply?
10. **Security/privacy:** What threats, abuse cases, sensitive fields, file/source risks, and audit requirements apply?
11. **Accessibility:** How does the complete journey work with keyboard, screen reader, zoom, reduced motion, and supported mobile devices?
12. **Reliability/performance:** What SLO, freshness, concurrency, timeout, retry, and recovery behavior applies?
13. **Testing:** Which unit, integration, contract, E2E, security, AI eval, accessibility, and performance tests prove acceptance?
14. **Observability:** Which logs, metrics, traces, domain events, dashboards, and alerts prove health and diagnose failure?
15. **Rollout:** What migration, flag, staging verification, production deployment, smoke test, and rollback/roll-forward plan applies?
16. **Evidence:** What links or artifacts prove every acceptance condition after production deployment?

No feature may be accepted with an unanswered applicable criterion.

## 19. Non-negotiable prohibitions

- Never bypass the API/domain boundary.
- Never hardcode secrets.
- Never disable or weaken TypeScript to pass a build.
- Never ship placeholder buttons, fake AI, fake metrics, or misleading success states.
- Never remove working functionality merely to pass checks.
- Never call a screen, service stub, or local demo an end-to-end feature.
- Never make AI availability a prerequisite for durable lead capture.
- Never expose raw entity IDs as QR credentials or treat IDs as authorization.
- Never allow organizer convenience to erase exhibitor or attendee data ownership.
- Never permit cross-tenant access without an explicit, authorized, tested path.
- Never publish unscanned or unvalidated uploads into retrieval or public delivery.
- Never deploy unreviewed schema destruction or untracked production configuration.
- Never mark a release Done without applicable production deployment and verification.

## 20. Decision test for all future work

Before approving any product or engineering change, ask:

1. Does it help an organizer create and operate the environment, an exhibitor create a knowledgeable measurable booth, or an attendee form a useful intentional connection?
2. Does it preserve the canonical workflow and its data/ownership boundaries?
3. Does it work end-to-end through the API with real durable state?
4. Is it truthful, secure, accessible, observable, recoverable, and deployable?
5. Does the deterministic product remain safe and usable if AI is unavailable?
6. Is this the simplest architecture that fully satisfies the present production requirement?

If any answer is no or unknown, the change is not ready for implementation or acceptance.
