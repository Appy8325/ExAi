# Root module: staging environment -- implemented when Milestone 0's infra work begins in earnest;
# see docs/43-security-architecture.md and docs/00-foundation.md §6 for the target shape.
#
# This environment will eventually compose:
#   - module.network      (../../modules/network)
#   - module.ecs_api       (../../modules/ecs-api)
#   - module.ecs_worker     (../../modules/ecs-worker)
#   - module.elasticache      (../../modules/elasticache)
#   - module.iam                (../../modules/iam)
#
# module.rds and module.s3_cloudfront are NOT listed above -- per docs/00-foundation.md §14
# Amendment A5, Supabase now hosts managed Postgres and file storage. See
# infra/modules/rds/README.md and infra/modules/s3-cloudfront/README.md.

terraform {
}
