# `evals/lead-intelligence`

Golden-set eval fixtures for Lead Intelligence, per [docs/21-ai-architecture.md](../../docs/21-ai-architecture.md) §5.

- **Content type:** 100 lead fixtures (drawn from the seeded fixture event's `leads` records spanning every pipeline status) with expected AI-generated summary/scoring output, used to grade the lead-intelligence feature's classification and summarization quality.
- **Fixture count:** 100 lead fixtures.
- **File:** `golden.jsonl` -- one JSON object per line, one line per lead fixture.

Not populated yet -- this is Milestone 0 tooling scaffolding (`golden.jsonl` is present but empty). Real fixtures are authored when the Lead Intelligence feature milestone begins.
