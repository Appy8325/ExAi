# Implementation Rules — ExAi

These are permanent engineering rules for this repository, binding on every engineer and every AI agent, for the entire lifetime of the project — not just Milestone 0. They implement the philosophy in [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) as short, checkable, non-negotiable statements. When a rule and a convenience conflict, the rule wins; if a rule seems to be actively blocking a genuinely necessary change, that is an architecture-amendment event (see [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) §8), not a reason to quietly break the rule.

---

## Never

1. **Never regenerate architecture.** The blueprint in `/docs` (00–46) is frozen as v1.0. Do not rewrite a document wholesale to "improve" it during implementation. A genuine correction is a small, dated Amendments Log entry ([00-foundation.md](00-foundation.md) §14) plus a minimal, targeted edit to the specific section affected — never a document-level regeneration.
2. **Never duplicate business logic.** A rule, calculation, or state transition lives in exactly one place (per [01-product-vision.md](01-product-vision.md) §6, Principle 3 — "one source of truth"). If two surfaces need the same logic (e.g., entitlement resolution, lead-pipeline validation), it is one shared service or one shared Zod schema, called from both — never reimplemented twice with the risk of drifting apart.
3. **Never create technical debt.** No commented-out code, no "TODO: fix later" left unresolved past the PR that introduced it, no speculative abstraction built for a hypothetical future need, no silently-skipped test. If something must be deferred, it is written down in [44-future-expansion-plan.md](44-future-expansion-plan.md) with a revisit criterion, following that document's own established discipline — not left as debt in the codebase.
4. **Never violate folder structure.** The monorepo layout, package boundaries, and dependency-graph rules in [37-monorepo-and-folder-structure.md](37-monorepo-and-folder-structure.md) are enforced, not advisory — e.g., only `packages/ai` may import a model-provider SDK; `apps/web` never calls the API directly, only through `packages/api-client`. A lint rule failing on this is correct behavior, not a false positive to suppress.
5. **Never hardcode secrets.** No API key, credential, or signing secret in source, in a config file committed to the repo, in a log line, or in a test fixture that resembles a real value. Secrets are injected per [43-security-architecture.md](43-security-architecture.md) §5 and scoped to the exact module the blueprint names as their owner.
6. **Never skip Row-Level Security.** No tenant-owned table ships without an RLS policy and a passing isolation test, per [00-foundation.md](00-foundation.md) §8 and [42-testing-strategy.md](42-testing-strategy.md). Application-level scoping is a second layer, never a substitute for RLS.
7. **Never invent a name.** No new entity, route, permission string, entitlement key, error code, queue, or domain event name that isn't already in the blueprint or explicitly added to it via an Amendments Log entry first. If you need something the blueprint doesn't name, that is an amendment, not a local decision.
8. **Never merge past a failing gate.** No `--no-verify`, no skipped CI check, no merged PR with a failing accessibility, contract-compatibility, or eval-regression gate, per [42-testing-strategy.md](42-testing-strategy.md) §14.
9. **Never ship an AI feature without its deterministic fallback working first.** Per [21-ai-architecture.md](21-ai-architecture.md), every AI feature must degrade to a working non-AI experience — build and verify that path before or alongside the AI path, never after.
10. **Never expose data across a tenant boundary except through an explicitly modeled read path.** The cross-tenant read-path registry in [28-permission-model.md](28-permission-model.md) is exhaustive by design — if a read path isn't listed there, it doesn't exist; add it to the registry (an amendment) before building it, don't build it and document it after the fact.

## Always

11. **Always build one milestone at a time.** Follow the order in [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md); do not pull work forward from a later milestone because it's convenient to do now.
12. **Always create reusable components deliberately, not preemptively.** Abstract a component or service into a shared package only once it is genuinely needed in a second place, per [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) §10 — and always name it per [15-component-inventory.md](15-component-inventory.md) or [16-database-schema.md](16-database-schema.md) if the blueprint already named it.
13. **Always update documentation if implementation changes behavior.** If a milestone's implementation reveals the blueprint was ambiguous or slightly wrong in a way that changes observable behavior, the corresponding numbered document gets a targeted fix and (if it reflects a real decision change, not just a typo) an Amendments Log entry — in the same PR as the code change, not "later."
14. **Always write the RLS isolation test in the same PR that creates the table.** Not the same milestone, sprint, or a follow-up ticket — the same PR.
15. **Always cite the blueprint document(s) a PR implements**, in the PR description, so review can check code against spec directly.
16. **Always stop after the assigned milestone.** Complete every deliverable's Definition of Done, then stop — do not continue into the next milestone in the same work session without being explicitly asked to.
17. **Always resolve ambiguity by checking [00-foundation.md](00-foundation.md) first**, then treating a surviving contradiction as a documentation bug to flag, never as a coin flip to make silently.
18. **Always branch/commit per [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) §6's Git workflow** — trunk-based, Conventional Commits, `feat|fix|chore/<scope>-<description>` branch names.
19. **Always treat a performance or security budget in [10-non-functional-requirements.md](10-non-functional-requirements.md) / [43-security-architecture.md](43-security-architecture.md) as a release gate**, verified in CI, not a target measured only after shipping.
20. **Always leave the repository in a state where the next engineer or agent can pick up work using only [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md)'s read order** — no undocumented tribal knowledge, no context that exists only in a chat transcript.

---

## Related Documents

- [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) — the reasoning and process these rules enforce
- [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) — where these rules apply, milestone by milestone
- [BLUEPRINT_V1.md](BLUEPRINT_V1.md) — frozen-state summary
- [00-foundation.md](00-foundation.md) §14 — the Amendments Log discipline referenced throughout
