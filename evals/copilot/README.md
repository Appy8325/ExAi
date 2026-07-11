# `evals/copilot`

Golden-set eval fixtures for Expo Copilot, per [docs/21-ai-architecture.md](../../docs/21-ai-architecture.md) §5.

- **Content type:** 200 grounded-answer queries against the seeded fixture event ("TechExpo 2027", per [docs/42-testing-strategy.md](../../docs/42-testing-strategy.md) §6), each with an expected citation/`evidence_id` set for the groundedness and citation-validity graders (doc 21 §5, §7.6).
- **Fixture count:** 200 queries.
- **File:** `golden.jsonl` -- one JSON object per line, one line per query.

Not populated yet -- this is Milestone 0 tooling scaffolding (`golden.jsonl` is present but empty). Real fixtures referencing fixed fixture-event ids are authored when the Expo Copilot feature milestone begins.
