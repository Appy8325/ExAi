# `ecs-api` module

Future purpose: the ECS Fargate service, task definition, ALB target group, and autoscaling policy for `apps/api` (NestJS 11 on Fastify), per [docs/00-foundation.md](../../../docs/00-foundation.md) §6. Reads secrets from AWS Secrets Manager / SSM Parameter Store per [docs/43-security-architecture.md](../../../docs/43-security-architecture.md) and injects `API_*`-prefixed environment variables per [docs/37-monorepo-and-folder-structure.md](../../../docs/37-monorepo-and-folder-structure.md) §10.

Depends on the `network` and `iam` modules for its VPC placement and execution/task roles.

Not built out yet — this is Milestone 0 tooling scaffolding only. Real resource blocks land when the infra workstream begins in earnest.
