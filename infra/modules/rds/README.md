# `rds` module

**Superseded by Supabase** ([docs/00-foundation.md](../../../docs/00-foundation.md) §14 Amendment A5) -- confirm removal or a narrower fallback role in a follow-up architecture review before building this out.

Originally specified in [docs/37-monorepo-and-folder-structure.md](../../../docs/37-monorepo-and-folder-structure.md) §7.1 as the RDS Multi-AZ Postgres module. Supabase now hosts the managed Postgres + pgvector database (see [docs/00-foundation.md](../../../docs/00-foundation.md) §14 Amendment A5), so this module is very likely unnecessary. It is kept as an empty placeholder folder only for structural consistency with the folder-structure doc, and is not being built out in this Milestone 0 tooling session.

A follow-up architecture pass should decide whether to delete this module entirely or repurpose it for a narrower fallback role (e.g., a disaster-recovery replica outside Supabase), rather than leaving it unaddressed.
