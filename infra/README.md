# infra/ — Legacy AWS Enterprise Deployment

> **Status (Phase 5+):** ⚠️ **DEPRECATED for default deployments.**
> The recommended stack is **Vercel + Supabase Cloud + Railway/Render**.
> See [`DEPLOYMENT.md`](../DEPLOYMENT.md) and [`DEPLOY_RUNBOOK.md`](../DEPLOY_RUNBOOK.md).

This directory is preserved **intact** for a possible future AWS / ECS /
Terraform based enterprise tier. **Do not delete or modify without
explicit approval from the deployment engineer.** All Terraform modules
under `modules/` are functional; the production composition in
`environments/production/main.tf` provisions:

- VPC (10.0.0.0/16), 6 subnets across 3 AZs
- 3 NAT Gateways, Internet Gateway, Route Tables
- Application Load Balancer with HTTPS listener
- ECS Cluster (Fargate + Fargate Spot)
- Two ECS services: API (CPU 512 / 1024 MB / 2 tasks), Worker (256 / 512 / 1 task)
- ElastiCache Redis 7.1 (cache.t4g.micro)
- IAM roles + task execution policies
- CloudWatch log groups
- Route53 A alias record for `api.exai.app` → ALB

## Layout

```
infra/
  environments/
    production/         # Terraform root for the AWS production environment
  modules/
    network/            # VPC + subnets + NAT + SGs + ALB SG
    ecs-api/            # ECS cluster, ALB, target group, listener, API service, task def
    ecs-worker/         # Worker ECS service + task def (reuses cluster)
    elasticache/        # Redis 7.1 in private subnets
    iam/                # ECS task execution + task roles (Secrets Manager read)
    rds/                # placeholder (Supabase owns Postgres)
    s3-cloudfront/     # placeholder (Supabase owns Storage + CDN)
```

## State backend

The production state lives in S3:

- bucket: `concourse-terraform-state`
- key:    `production/terraform.tfstate`
- lock:   DynamoDB table `concourse-terraform-locks`

Create both manually before the first `terraform apply`.

## When to use

Only use this when:

- An enterprise customer requires AWS residency.
- You need IAM/SOC2 compliance controlled at the AWS account level.
- You need an ELB / ALB / VPC-isolated network boundary.

For the startup launch and Hackathon tier, use Railway + Render + Vercel
instead — see `../DEPLOYMENT.md`.

## Related legacy workflows

- `.github/workflows/deploy-api.yml` — legacy, marked `[LEGACY]`. Pushes
  the API image to ECR and updates `concourse-production-api` service.
- `.github/workflows/deploy-worker.yml` — legacy, marked `[LEGACY]`.
  Pushes the Worker image to ECR and updates `concourse-production-worker`.

Both rely on the `AWS_ROLE_ARN` GitHub secret. They remain functional
should an enterprise deployment be revived.

## Triggering an AWS deploy (legacy)

```bash
cd infra/environments/production
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Then trigger the legacy workflows by either
# - pushing to master / changes under apps/api/** or apps/worker/**
# - or running ./scripts/deploy.sh api | worker
```
