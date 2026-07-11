# `ecs-worker` module

Future purpose: the ECS Fargate service and task definition for `apps/worker` (Node 22 + BullMQ 5), per [docs/00-foundation.md](../../../docs/00-foundation.md) §6. No ALB target group (not internet-facing) but the same secret-injection and `WORKER_*`-prefixed environment variable pattern as `ecs-api`, per [docs/37-monorepo-and-folder-structure.md](../../../docs/37-monorepo-and-folder-structure.md) §10.

Depends on the `network` and `iam` modules for its VPC placement and execution/task roles.

Not built out yet — this is Milestone 0 tooling scaffolding only. Real resource blocks land when the infra workstream begins in earnest.
