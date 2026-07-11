# `evals/retrieval`

Golden-set eval fixtures for the retrieval/RAG layer, per [docs/22-rag-architecture.md](../../docs/22-rag-architecture.md) §9.

- **Content type:** 150 labeled queries against the knowledge-base chunks seeded by the fixture event (`kb_sources`/`kb_documents`/`kb_chunks`), each with an expected relevant-chunk id set, used to grade retrieval precision/recall (embedding + rerank quality) independent of generation quality.
- **Fixture count:** 150 labeled queries.
- **File:** `golden.jsonl` -- one JSON object per line, one line per labeled query.

Not populated yet -- this is Milestone 0 tooling scaffolding (`golden.jsonl` is present but empty). Real fixtures are authored when the retrieval/RAG feature milestone begins.
