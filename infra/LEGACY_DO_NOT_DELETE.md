# LEGACY — DO NOT DELETE WITHOUT EXPLICIT SIGN-OFF

This directory contains the production-targeted AWS infrastructure
(Terraform: VPC, ECS Fargate for api + worker, ALB, ElastiCache Redis
7.1, IAM, CloudWatch log groups, Route53 alias record; S3 + DynamoDB
backend in `environments/production`).

## Status

During Phase 5 the deployment strategy switched to
**Vercel + Supabase Cloud + Railway/Render**. The Terraform stack
under `infra/` is preserved **intact** for a future AWS / enterprise
deployment but is **not** the recommended path. Do not run
`terraform apply` against this directory unless the deployment
engineer has explicitly authorised an AWS deployment.

## How to know it's safe to apply

Apply this Terraform only when each of these is true AND you have
explicit sign-off from the deployment engineer:

- A customer requires AWS data residency.
- Railway/Render tier limits have been exceeded.
- SOC2 / IAM constraints require an AWS account boundary.
- A maintenance/flywheel plan exists for downstream AWS services
  (Route53 zones, ACM certificate renewal, Secrets Manager rotation).

Otherwise: use the runbook at `../DEPLOY_RUNBOOK.md`.

## Where this is documented

| File | Purpose |
|---|---|
| `../infra/README.md` | Top-level legacy marker |
| `../DEPLOYMENT.md` §8 | Architecture overview mentions this as a future path |
| `../DEPLOY_RUNBOOK.md` Step 8 | Re-legitimising legacy workflows requires explicit sign-off |
| `../ops/README.md` §"When to escalate back to AWS / Terraform" | CA-ES marks the switch-back criteria |

If you are about to delete or fork this directory, please also update
`infra/README.md` and add a migration note in `DEPLOYMENT.md`.
