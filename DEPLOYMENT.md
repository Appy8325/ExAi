# ExAi (Concourse) — Deployment Guide

## Architecture Overview

```
                    ┌──────────────────────────────────────────────────┐
                    │                     Vercel                       │
                    │           apps/web (Next.js 15)                  │
                    │           https://exai.app                       │
                    └──────────────────────┬───────────────────────────┘
                                           │
                      NEXT_PUBLIC_API_BASE_URL
                                           │
                    ┌──────────────────────▼───────────────────────────┐
                    │              AWS ECS Fargate                     │
                    │  apps/api (NestJS 11 / Fastify 5)                │
                    │  https://api.exai.app                            │
                    │                                                  │
                    │  apps/worker (Node 22 / BullMQ 5)                │
                    └──────┬──────────────────────────┬────────────────┘
                           │                          │
                    ┌──────▼──────────┐     ┌─────────▼──────────┐
                    │   Supabase      │     │  AWS ElastiCache   │
                    │   Cloud         │     │  Redis 7           │
                    │   Postgres 15   │     │  (BullMQ queues)   │
                    │   + pgvector    │     └────────────────────┘
                    │   Auth          │
                    │   Storage       │
                    │   Realtime      │
                    └─────────────────┘
```

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | >= 22.0.0 | `nvm install 22` or `fnm install 22` |
| pnpm | 9.15.0 | `corepack enable && corepack prepare pnpm@9.15.0 --activate` |
| Docker Desktop | Latest | For local Redis + Supabase CLI |
| Terraform | >= 1.6 | `tfenv install 1.6.0` or direct install |
| Supabase CLI | Latest | `npm install -g supabase` |
| AWS CLI | Latest | `pip install awscli` or `brew install awscli` |
| Vercel CLI | Latest | `npm install -g vercel` |

## 1. GitHub Repository Setup

### Create Repository

```bash
# Create a new repository on GitHub (exai-org/concourse)
# Then push the existing code:
git remote add origin git@github.com:exai-org/concourse.git
git push -u origin master

# Create development branch
git checkout -b develop
git push -u origin develop

# Protect main/master in GitHub UI:
# Settings → Branches → Add rule
# - Require pull request reviews (1)
# - Require status checks (CI must pass)
# - Require branches up to date
```

### Configure GitHub Secrets

| Secret | Description | Source |
|---|---|---|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC GitHub Actions | AWS IAM |
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | `vercel whoami --verbose` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Dashboard → Project → Settings |

### Configure GitHub Variables

| Variable | Description | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Supabase Dashboard |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.exai.app` | After API deploy |

## 2. Supabase Cloud

### Create Project

1. Sign in to [supabase.com](https://supabase.com)
2. Create a new organization (e.g., "ExAi")
3. Create project "exai-production"
   - Choose region closest to your users (e.g., `us-east-1`)
   - Set strong database password (store in password manager)
4. Wait for provisioning (~2 minutes)

### Configure Project

```bash
# Link local repo to Supabase Cloud project
supabase link --project-ref <project-ref-from-dashboard>

# Push project configuration (auth settings, storage, etc.)
supabase push

# Run database migrations
API_DATABASE_URL="postgresql://postgres:password@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate

# Seed initial data
API_DATABASE_URL="postgresql://postgres:password@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:seed
```

### Supabase Dashboard Configuration

| Setting | Value | Path |
|---|---|---|
| Auth → Site URL | `https://exai.app` | Auth → Settings |
| Auth → Redirect URLs | `https://exai.app/auth/callback` | Auth → Settings |
| JWT Expiry | `3600` (1 hour) | Auth → Settings |
| Storage → File Size Limit | `50 MiB` | Storage → Settings |
| API → JWT Secret | Copy for `API_SUPABASE_JWT_SECRET` | Settings → API |

### Service & Anon Keys

From Supabase Dashboard → Settings → API:

| Key | Used In | Purpose |
|---|---|---|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL`, `API_SUPABASE_URL` | API endpoint |
| `anon public` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client-side auth |
| `service_role` | `API_SUPABASE_SERVICE_ROLE_KEY` | Server-side admin |
| `JWT Secret` | `API_SUPABASE_JWT_SECRET` | Token verification |

## 3. Environment Variables

### Web (Vercel)

Set in Vercel Dashboard → Project → Environment Variables:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...` (anon key) |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.exai.app` |

### API (AWS Secrets Manager)

Store each secret in AWS Secrets Manager:

```bash
for secret in \
  API_DATABASE_URL \
  API_SUPABASE_URL \
  API_SUPABASE_SERVICE_ROLE_KEY \
  API_SUPABASE_JWT_SECRET \
  API_CORS_ORIGIN \
  API_PUBLIC_WEB_ORIGIN \
  ANTHROPIC_API_KEY \
  VOYAGE_API_KEY \
  POSTHOG_API_KEY; do
  aws secretsmanager create-secret \
    --name "concourse/production/${secret}" \
    --secret-string "${!secret}"
done
```

### Worker (AWS Secrets Manager)

```bash
for secret in \
  WORKER_DATABASE_URL \
  WORKER_REDIS_URL \
  ANTHROPIC_API_KEY \
  VOYAGE_API_KEY \
  POSTHOG_API_KEY; do
  aws secretsmanager create-secret \
    --name "concourse/production/${secret}" \
    --secret-string "${!secret}"
done
```

## 4. Deploy API

### Terraform (Infrastructure)

```bash
cd infra/environments/production

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

This provisions:
- VPC with public/private subnets across 3 AZs
- NAT Gateways, Internet Gateway, Route Tables
- Application Load Balancer with HTTPS listener
- ECS Cluster with Fargate capacity providers
- ElastiCache Redis cluster
- CloudWatch log groups
- Route53 DNS record for `api.exai.app`

### Build & Deploy Container

```bash
# Using the deployment orchestrator
./scripts/deploy.sh api

# Or manually:
docker build -t concourse-api -f apps/api/Dockerfile .
docker tag concourse-api:latest <ecr-repo>:<tag>
docker push <ecr-repo>:<tag>
aws ecs update-service --cluster concourse-production --service concourse-production-api --force-new-deployment
```

### Verify API

```bash
curl https://api.exai.app/healthz
# Expected: HTTP 200 (or API-defined health response)
```

## 5. Deploy Worker

```bash
# Using the deployment orchestrator
./scripts/deploy.sh worker

# Or manually:
docker build -t concourse-worker -f apps/worker/Dockerfile .
docker tag concourse-worker:latest <ecr-repo>:<tag>
docker push <ecr-repo>:<tag>
aws ecs update-service --cluster concourse-production --service concourse-production-worker --force-new-deployment
```

Verify via CloudWatch Logs:
```bash
aws logs tail /ecs/concourse-production-worker --follow
```

## 6. Deploy Web to Vercel

### One-Time Setup

```bash
# Login to Vercel
vercel login

# Link project
cd apps/web
vercel link --yes
vercel env pull .env.production.local
```

### Deploy

```bash
# Using the deployment orchestrator
./scripts/deploy.sh web

# Or via Vercel CLI:
cd apps/web
vercel deploy --prod \
  -e NEXT_PUBLIC_SUPABASE_URL=<value> \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<value> \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.exai.app

# Or via GitHub Actions (push to main triggers deploy-web.yml)
```

### Configure Custom Domain in Vercel

```bash
vercel domains add exai.app
vercel domains add www.exai.app
```

Update DNS: Add the CNAME/ALIAS records provided by Vercel to your DNS provider.

## 7. Verify Production

Run the verification suite:

```bash
./scripts/verify-production.sh \
  https://api.exai.app \
  https://exai.app
```

### Manual Verification Checklist

- [ ] `https://exai.app` loads without errors
- [ ] `https://api.exai.app/healthz` returns 200
- [ ] Supabase Auth: Sign up / Sign in works end-to-end
- [ ] API <-> Supabase connection functional (DB queries succeed)
- [ ] Worker processes jobs (check CloudWatch logs)
- [ ] Redis connection works (check worker logs)
- [ ] Session persistence across page refresh
- [ ] Protected routes redirect to auth when unauthenticated
- [ ] SSL/TLS certificates valid (no browser warnings)
- [ ] CORS allows web origin
- [ ] Environment variables correctly injected

### Monitoring & Alerting

| Service | Dashboard |
|---|---|
| AWS ECS (API) | CloudWatch → Dashboards → concourse-production |
| AWS ECS (Worker) | CloudWatch → Logs → /ecs/concourse-production-worker |
| AWS ElastiCache | CloudWatch → ElastiCache → concourse-production-redis |
| Vercel (Web) | Vercel Dashboard → Analytics |
| Supabase | Supabase Dashboard → Reports |
| Errors | Sentry dashboard (configured per docs) |

## 8. Rollback

### API / Worker (ECS)

```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --task-definition concourse-production-api:<previous-revision> \
  --force-new-deployment
```

### Web (Vercel)

```bash
# Rollback to previous deployment
cd apps/web
vercel rollback
```

### Database

```bash
# Drizzle migrations are reversible if down methods are implemented.
# To roll back the last migration:
pnpm db:migrate:down  # if down method exists
# Or restore from Supabase backup:
# Supabase Dashboard → Database → Backups → Restore
```

## 9. CI/CD Pipeline

### Workflows

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Push to any branch, PR to main | Lint, typecheck, test, build Docker |
| `deploy-api.yml` | Push to main (API changes) | Build Docker, push to ECR, update ECS |
| `deploy-worker.yml` | Push to main (Worker changes) | Build Docker, push to ECR, update ECS |
| `deploy-web.yml` | Push to main (Web changes) | Build, deploy to Vercel |

### Deployment Strategy

- **API**: Rolling update on ECS Fargate (200% max, 100% min health)
- **Worker**: Replacement deployment (100% max, 0% min — stateless)
- **Web**: Vercel instant rollover

## 10. Secrets Management

| Secret Store | What's Stored | Access Control |
|---|---|---|
| AWS Secrets Manager | `API_DATABASE_URL`, `API_SUPABASE_SERVICE_ROLE_KEY`, `API_SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `POSTHOG_API_KEY` | ECS task IAM role |
| GitHub Secrets | `AWS_ROLE_ARN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Actions |
| Vercel Environment | `NEXT_PUBLIC_*` vars | Vercel Dashboard |
| Supabase Dashboard | `JWT_SECRET`, `Service Role Key` | Supabase Dashboard |

## 11. Related Documents

| Document | Location |
|---|---|
| Architecture Blueprint | `docs/BLUEPRINT_V1.md` |
| Engineering Guide | `docs/ENGINEERING_GUIDE.md` |
| Environment Variables | `.env.production.example` |
| Dockerfiles | `apps/api/Dockerfile`, `apps/worker/Dockerfile` |
| Terraform | `infra/environments/production/` |
| CI/CD | `.github/workflows/` |
| Deployment Scripts | `scripts/deploy.sh`, `scripts/verify-production.sh` |
| Vercel Config | `apps/web/vercel.json` |
| Supabase Config | `supabase/production-config.toml` |
