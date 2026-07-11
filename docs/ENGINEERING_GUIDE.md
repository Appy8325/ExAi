# Engineering Guide — ExAi

This document explains how any engineer — human or AI agent — should approach this repository once implementation begins. It assumes the blueprint in `/docs` (00–46, frozen as v1.0 per [BLUEPRINT_V1.md](BLUEPRINT_V1.md)) is the complete, binding architecture. This guide does not re-describe that architecture; it describes how to *work* against it.

Read this together with [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md) (the permanent, non-negotiable rules) and [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) (what to build, in what order). This guide explains the *how* and *why*; those two documents are the *what* and *when*.

---

## 1. How every future AI agent should approach this repository

1. **The blueprint is not a suggestion.** Every table name, route, entity, role string, entitlement key, and API convention in `/docs` is a decision that has already been made and reconciled against every other document (see the pre-freeze consistency review recorded in [00-foundation.md](00-foundation.md) §14, Amendments A1–A4). An agent's job is to *implement* the blueprint, not to redesign it in the course of implementing it.
2. **When the blueprint is silent or ambiguous on something genuinely new**, do not invent a parallel convention. Stop, state the ambiguity, and propose the smallest possible decision that resolves it — following the exact discipline `00-foundation.md` §14 already established (a short, dated, reasoned Amendments Log entry), not a silent workaround.
3. **When the blueprint appears to contradict itself**, do not pick a side arbitrarily. Check `00-foundation.md` first (it always wins per its own §1 status line); if the ambiguity survives that, treat it as a bug in the documentation and flag it rather than building around it.
4. **An agent should always know which document it is implementing against** before writing code, and should cite it (in the PR description or commit body, not necessarily in-code comments) — see Read Order below.
5. **An agent should never regenerate architecture documents while implementing.** If implementation reveals the architecture is wrong (not just incomplete), that is a rare, explicitly-flagged event — see [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), "Never regenerate architecture."

## 2. Read order for documentation

Do not read all 47 documents cover-to-cover before starting. Read in the order the task actually needs, always starting from the top of this list:

1. **[00-foundation.md](00-foundation.md)** — always, every time, no exceptions. It is the single source of truth for names, entities, roles, tiers, and conventions everything else assumes.
2. **[BLUEPRINT_V1.md](BLUEPRINT_V1.md)** — the one-page orientation: stack, modules, roles, AI summary, current versions.
3. **[IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)** — find the milestone you're building, read its Goal/Dependencies/Deliverables/Definition of Done.
4. **The specific numbered document(s) that milestone's deliverables map to** (each phase in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) names them explicitly).
5. **Only then**, any document those documents cross-reference for a detail you actually need (e.g., building the lead pipeline sends you to [16-database-schema.md](16-database-schema.md) for columns, [09-functional-requirements.md](09-functional-requirements.md) for the exact state machine, [28-permission-model.md](28-permission-model.md) for who can transition it).
6. **[README.md](README.md)** is the map if you get lost — it lists every document with a one-line scope description, grouped thematically.

Never start writing code from a document more than two link-hops away from the milestone you're on without first confirming (via [00-foundation.md](00-foundation.md) §13's registry) that you're reading the right owner for that concern.

## 3. Implementation philosophy

- **The blueprint is the design; the code is the proof.** Nothing in `/docs` is aspirational — every entity, route, and state machine was written to be built exactly as specified. Deviating "for convenience" during implementation reintroduces the exact inconsistency the pre-freeze review spent significant effort removing.
- **One source of truth, twice over.** The blueprint already enforces this principle at the design level ([00-foundation.md](00-foundation.md) §1, Principle 3). Engineering must enforce it at the code level: a fact lives in one table, one service, one component — never copied.
- **Deterministic first, AI as an additive layer.** Every AI feature has a working deterministic fallback per [21-ai-architecture.md](21-ai-architecture.md) §3/§8.3. Build and ship the deterministic path before or alongside the AI path — never make a feature depend on AI succeeding to be minimally usable.
- **Offline and tenancy are foundations, not features.** [17-offline-sync-architecture.md](17-offline-sync-architecture.md) and the RLS tenancy model in [00-foundation.md](00-foundation.md) §8 are cross-cutting from Milestone 0 onward — do not defer them to "later" on any surface the blueprint marks offline-critical or tenant-scoped.
- **Small, reviewable, milestone-scoped changes.** One milestone (or one deliverable within it) is one unit of work. See "How to implement milestones" below.

## 4. Definition of Done

A deliverable is Done when **all** of the following are true — this is the baseline definition every milestone's own Definition of Done in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) extends, never relaxes:

1. It implements the relevant blueprint document(s) exactly — entity names, route shapes, status enums, permission strings, and error codes match `/docs` verbatim.
2. It has automated tests at the level [42-testing-strategy.md](42-testing-strategy.md) requires for that kind of code (unit for logic, integration for cross-service behavior, contract tests for API surfaces, RLS isolation tests for anything tenant-scoped).
3. It passes CI: typecheck, lint, tests, and the specific merge gates [42-testing-strategy.md](42-testing-strategy.md) §14 lists (accessibility, contract breaking-change detection, etc., where applicable to the surface touched).
4. Documentation is updated if behavior changed from what `/docs` describes (see [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), "Always update documentation if implementation changes behavior").
5. It does not silently expand scope beyond the milestone's stated deliverables.
6. A human (or the requesting agent) can verify it against the milestone's Definition of Done in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) without needing to read the implementation to understand what it's supposed to do — the blueprint already told them.

## 5. Coding standards

These extend, and must never contradict, the conventions already locked in [00-foundation.md](00-foundation.md) §6/§11 and [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md):

- **TypeScript** everywhere; `camelCase` values/functions, `PascalCase` types/components, no `I`-prefixed interfaces.
- **Files:** `kebab-case.ts(x)`; React components `PascalCase.tsx` inside `kebab-case` feature folders.
- **Database:** `snake_case`, plural table names, `*_id` foreign keys, `created_at`/`updated_at` on every table, UUIDv7 primary keys — per [16-database-schema.md](16-database-schema.md).
- **API:** plural kebab-case routes, cursor pagination, `application/problem+json` errors with codes from [41-error-code-registry.md](41-error-code-registry.md) — clients branch on `code`, never on `detail` text.
- **Validation:** one Zod schema per resource in `packages/shared`, feeding API validation, OpenAPI generation, and client types simultaneously — never three hand-written copies.
- **Components:** built per [40-ui-component-library.md](40-ui-component-library.md)'s conventions, styled only via semantic design tokens from [39-design-system.md](39-design-system.md) — never a raw hex value or an unmapped Tailwind primitive.
- **No dead code, no commented-out code, no speculative abstraction.** If the blueprint doesn't call for it yet, don't build it yet (see [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), "Never create technical debt").

## 6. Git workflow

- **Trunk-based development**, per [00-foundation.md](00-foundation.md) §11: branches named `feat|fix|chore/<scope>-<description>`, Conventional Commits for every commit message.
- **One milestone deliverable per branch/PR** wherever the deliverable is independently reviewable; do not bundle unrelated deliverables into one PR to save review overhead.
- **PR descriptions must cite the blueprint document(s) implemented** (e.g., "Implements 16-database-schema.md §3 identity tables + 19-authentication-strategy.md §4 signup flow") so a reviewer can check the code against the spec directly.
- **Never rebase or force-push over another engineer's or agent's in-progress branch.** Never `--no-verify`, never bypass a CI gate to land faster.
- **Suggested commit messages are provided per milestone** in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) — use them as the base commit (or PR title) for that milestone's integration commit; individual implementation commits within a milestone can be more granular.

## 7. Testing expectations

Full detail: [42-testing-strategy.md](42-testing-strategy.md). The expectations that matter operationally:

- **Every new table gets an RLS isolation test** before it ships — this is a release gate, not a nice-to-have, per principle P5 ([01-product-vision.md](01-product-vision.md) §6).
- **Every new API operation gets a contract test** against the generated OpenAPI schema.
- **Every AI feature ships with its eval suite passing** per [21-ai-architecture.md](21-ai-architecture.md) §5's gates (citation validity, injection-suite pass rate, groundedness score) before it is enabled by default.
- **Every offline-critical flow** (per [17-offline-sync-architecture.md](17-offline-sync-architecture.md)) is tested with connectivity actually simulated as absent, not merely mocked at the network-call level.
- **Accessibility gates** (per [39-design-system.md](39-design-system.md) §12 and [42-testing-strategy.md](42-testing-strategy.md) §11) block merge on any critical/serious violation.

## 8. Rules for modifying architecture

Architecture modification is rare and deliberate, not a normal part of implementation work. See [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md), "Never regenerate architecture," for the permanent rule. The process when a genuine architecture change is unavoidable:

1. Identify the exact locked document and section that needs to change, and why the change is not achievable within the existing design.
2. Write the change as a new, dated entry in [00-foundation.md](00-foundation.md) §14 (Amendments Log) — following the exact style of A1–A4 — stating what changed and why.
3. Make the *minimal* corresponding edit to the specific document(s) affected. Do not regenerate a document wholesale; edit the specific section.
4. Never make an architecture change and an implementation change in the same commit — land the amendment first, reviewed on its own, then implement against it.

## 9. How to implement milestones

Per [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md): **always build one milestone at a time**, in the order [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) specifies, and **always stop after the assigned milestone** — do not pull forward work from a later milestone because it seems convenient, even if it looks small.

1. Read the milestone's Goal, Dependencies, Deliverables, and Definition of Done in full before writing anything.
2. Confirm every dependency is actually met (the prior milestone's Definition of Done was satisfied) — do not start a milestone on the assumption a dependency is "probably fine."
3. Work deliverable by deliverable within the milestone; each deliverable should be independently reviewable and testable.
4. When every deliverable meets the milestone's Definition of Done, stop. Do not begin the next milestone in the same work session unless explicitly asked to continue — this mirrors the same discipline this blueprint's own authoring process used (batches, verified before proceeding).
5. If a milestone's scope turns out to be wrong-sized (too large, a dependency was missed) during implementation, say so explicitly rather than silently absorbing the correction into the current milestone's work.

## 10. Rules for creating reusable components

- **A component becomes "reusable" only after it is needed in a second place** — per [01-product-vision.md](01-product-vision.md) §6 Principle 3 and [40-ui-component-library.md](40-ui-component-library.md), do not pre-abstract a component for a hypothetical future second use.
- **Every reusable UI component lives in `packages/ui`** and is named exactly as [15-component-inventory.md](15-component-inventory.md) specifies — do not invent a new name for a component that inventory already names.
- **Every reusable component ships with the states [13-application-layout.md](13-application-layout.md)'s taxonomy requires** for its context (loading, empty, error, offline, populated) — a component missing an applicable state is not done.
- **Every reusable component consumes semantic design tokens only** ([39-design-system.md](39-design-system.md)), never a primitive or a raw value, and passes the accessibility gates in [42-testing-strategy.md](42-testing-strategy.md) before merge.
- **Backend "components" (shared services, connectors) follow the same rule**: the CRM connector interface in [35-integrations-and-connectors.md](35-integrations-and-connectors.md) and the AI service ports in [21-ai-architecture.md](21-ai-architecture.md) §1 are the reference shape for a properly reusable backend abstraction — a single injectable interface with one implementation per concrete case, never a special-cased branch inside a caller.

## 11. Performance expectations

Full detail: [10-non-functional-requirements.md](10-non-functional-requirements.md). Headline budgets that gate release, not aspirations:

- Floor-critical interactions (badge scan → lead captured, Copilot first token, floor plan pan): sub-second perceived latency; any spinner visible longer than 300ms is a defect, not a styling choice.
- Expo Copilot: first token ≤ 1.5s p95, complete answer ≤ 8s p95.
- API: cursor-paginated list endpoints, no `COUNT(*)` on large tenant tables in the request path.
- Scan-ingestion endpoints (`booth-visits`, `leads`) must never throttle a busy booth — this is an explicit, higher rate-limit tier, not an oversight.
- Every performance budget in [10-non-functional-requirements.md](10-non-functional-requirements.md) is a release gate for the surface it applies to, verified in the same CI pipeline as functional tests, not measured only in production after the fact.

## 12. Security expectations

Full detail: [43-security-architecture.md](43-security-architecture.md), [19-authentication-strategy.md](19-authentication-strategy.md), [20-session-strategy.md](20-session-strategy.md), [28-permission-model.md](28-permission-model.md), [38-data-retention-privacy-compliance.md](38-data-retention-privacy-compliance.md). Non-negotiable baseline:

- Row-Level Security is mandatory on every tenant-owned table, verified by an isolation test, from the first migration that creates it — never retrofitted.
- Every privileged action (role change, entitlement override, impersonation session, webhook secret rotation) writes to `audit_logs` synchronously, per [29-audit-logging-architecture.md](29-audit-logging-architecture.md) — never as a best-effort side effect that can silently fail.
- Secrets are never committed, never logged, never read outside the module the blueprint scopes them to (e.g., only `AiModule` reads Anthropic/Voyage keys, per [21-ai-architecture.md](21-ai-architecture.md) §1's enforced import restriction).
- Consent gates (`consent_ai_personalization`, `consent_discoverable`, lead capture-time contact-sharing scope) are checked in the code path before any data crosses a tenant boundary — never assumed true by default.
- Every dependency change goes through the supply-chain checks [43-security-architecture.md](43-security-architecture.md) §8 specifies before merge.

---

## Related Documents

- [BLUEPRINT_V1.md](BLUEPRINT_V1.md) — frozen-state summary
- [IMPLEMENTATION_RULES.md](IMPLEMENTATION_RULES.md) — permanent engineering rules
- [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) — milestone-by-milestone build plan
- [00-foundation.md](00-foundation.md) — canonical decision record every rule above ultimately traces back to
