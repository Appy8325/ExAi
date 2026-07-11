# `evals/security`

Adversarial/injection eval fixtures for the AI guardrail suite, per [docs/21-ai-architecture.md](../../docs/21-ai-architecture.md) §7.6.

- **Content type:** a set of prompt-injection attack queries (`injection.jsonl`) plus at least 30 attack documents (deliberately injection-laden knowledge-base content, e.g. a poisoned exhibitor product PDF referenced by the fixture event's `kb_documents`, per [docs/42-testing-strategy.md](../../docs/42-testing-strategy.md) §6.1) used to grade the `AiGuardrailService`'s detection/refusal behavior.
- **Fixture count:** `injection.jsonl` (one JSON object per line, one line per attack query) plus >= 30 attack documents.
- **Naming note:** this folder uses `injection.jsonl` rather than `golden.jsonl` -- matching the exact filename [docs/37-monorepo-and-folder-structure.md](../../docs/37-monorepo-and-folder-structure.md) §7.2 and [docs/21-ai-architecture.md](../../docs/21-ai-architecture.md) §7.6 both specify for this folder, since "golden" framing doesn't fit an adversarial/attack fixture set.

Not populated yet -- this is Milestone 0 tooling scaffolding (`injection.jsonl` is present but empty, and no attack documents exist yet). Real attack queries and documents are authored when the AI guardrail feature milestone begins.
