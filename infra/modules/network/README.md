# `network` module

Future purpose: the shared VPC/networking layer for Concourse's AWS footprint — VPC, public/private subnets across availability zones, NAT gateways, route tables, and security groups consumed by the `ecs-api`, `ecs-worker`, and `elasticache` modules.

Per [docs/00-foundation.md](../../../docs/00-foundation.md) §6 and [docs/37-monorepo-and-folder-structure.md](../../../docs/37-monorepo-and-folder-structure.md) §7.1, this module is composed into both `infra/environments/staging` and `infra/environments/production` as a shared child module.

Not built out yet — this is Milestone 0 tooling scaffolding only. Real resource blocks land when the infra workstream begins in earnest.
