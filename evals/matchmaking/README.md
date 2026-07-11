# `evals/matchmaking`

Golden-set eval fixtures for the matchmaking/scoring engine, per [docs/21-ai-architecture.md](../../docs/21-ai-architecture.md) §5 and [docs/24-matchmaking-and-scoring.md](../../docs/24-matchmaking-and-scoring.md) §9.

- **Content type:** 100 labeled attendee/exhibitor (or attendee/session) pairs with a human-labeled relevance/match judgment, used to validate the weighted scoring formula against a held-out ground truth and catch weight-tuning regressions.
- **Fixture count:** 100 labeled pairs.
- **File:** `golden.jsonl` -- one JSON object per line, one line per labeled pair.

Not populated yet -- this is Milestone 0 tooling scaffolding (`golden.jsonl` is present but empty). Real labeled pairs are authored when the matchmaking feature milestone begins.
