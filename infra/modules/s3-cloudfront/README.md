# `s3-cloudfront` module

**Superseded by Supabase** ([docs/00-foundation.md](../../../docs/00-foundation.md) §14 Amendment A5) -- confirm removal or a narrower fallback role in a follow-up architecture review before building this out.

Originally specified in [docs/37-monorepo-and-folder-structure.md](../../../docs/37-monorepo-and-folder-structure.md) §7.1 as the S3 + CloudFront object storage/CDN module. Supabase now hosts file storage (see [docs/00-foundation.md](../../../docs/00-foundation.md) §14 Amendment A5), so this module is very likely unnecessary. It is kept as an empty placeholder folder only for structural consistency with the folder-structure doc, and is not being built out in this Milestone 0 tooling session.

A follow-up architecture pass should decide whether to delete this module entirely or repurpose it for a narrower fallback role (e.g., a CDN in front of Supabase Storage for cache-control tuning), rather than leaving it unaddressed.
