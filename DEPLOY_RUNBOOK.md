# ExAi (Concourse) — One-Shot Deployment Runbook

**Prerequisites:** You have authenticated locally with the GitHub CLI (`gh
auth login`), Supabase CLI (`supabase login`), AWS CLI (`aws configure` or
`aws sso login --profile production`), and Vercel CLI (`vercel login`).

Every command below should be copy-pasted into your terminal. Read the
`ⓘ NOTE` callouts — they tell you to replace placeholders with real values
from your dashboard.

---

## Step 0 — Verify prerequisites

```bash
# Confirm toolchain
node --version   # >= 22
pnpm --version   # 9.15.x (corepack enable && corepack prepare pnpm@9.15.0 --activate)
gh --version     # GitHub CLI
supabase --version
aws --version
vercel --version

# Confirm AWS identity
aws sts get-caller-identity
```

---

## Step 1 — GitHub repository

### 1a. Create a new repo

```bash
# Replace GH_ORG with your GitHub org/user name.
gh repo create GH_ORG/concourse --public --push --source=. --remote=origin

# If the repo already exists remotely:
#   git remote add origin git@github.com:GH_ORG/concourse.git
#   git push -u origin master
```

### 1b. Create develop branch and protect master

```bash
git checkout -b develop
git push -u origin develop
```

Then in GitHub UI → Settings → Branches → Add rule for `master`:
- Require a pull request before merging
- Require approvals (≥ 1)
- Require status checks to pass before merging
- Require branches to be up to date before merging

### 1c. Add CI/CD GitHub Secrets

| Secret | Value source |
|---|---|
| `AWS_ROLE_ARN` | AWS IAM → Roles → the GitHub OIDC role ARN |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | `vercel whoami --verbose` (organization ID) |
| `VERCEL_PROJECT_ID` | After Step 6 below, from Vercel Dashboard → Project → Settings |

```bash
gh secret set AWS_ROLE_ARN    --repo GH_ORG/concourse --body '<arn>'
gh secret set VERCEL_TOKEN    --repo GH_ORG/concourse --body '<token>'
gh secret set VERCEL_ORG_ID   --repo GH_ORG/concourse --body '<org_id>'
gh secret set VERCEL_PROJECT_ID --repo GH_ORG/concourse --body '<project_id>'
```

### 1d. Add CI/CD GitHub Variables

```bash
# Replace with real Supabase values AFTER Step 2 is complete.
gh variable set NEXT_PUBLIC_SUPABASE_URL            --repo GH_ORG/concourse --body 'https://<ref>.supabase.co'
gh variable set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY --repo GH_ORG/concourse --body '<anon-key>'
gh variable set NEXT_PUBLIC_API_BASE_URL             --repo GH_ORG/concourse --body 'https://api.exai.app'
```

---

## Step 2 — Supabase Cloud

### 2a. Create Supabase project

Go to [supabase.com](https://supabase.com), create org ("ExAi"), create
project "exai-production" in `us-east-1` (or region closest to the AWS
production region). Set a strong database password.

Wait for provisioning (~2 minutes). Copy:

| From Dashboard → Settings → API | Saved as |
|---|---|
| Project URL (`https://<ref>.supabase.co`) | `SUPABASE_REF` |
| `anon public` key | `SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |
| JWT Secret (Advanced) | `SUPABASE_JWT_SECRET` |

### 2b. Link repo to Supabase project

```bash
supabase link --project-ref <ref>
```

### 2c. Push production configuration

```bash
# This applies supabase/production-config.toml:
#   auth.site_url = https://exai.app
#   auth.redirect_urls = https://exai.app/auth/callback
#   jwt_expiry = 3600
#   storage.file_size_limit = 50MiB
#   pooler enabled, realtime enabled
supabase push
```

### 2d. Generate database password

```bash
# In Supabase Dashboard → Database → Database Settings → Connection String
# Copy the "Session Mode" (port 6543) connection string.
# Insert the password you set in 2a.

API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true"
echo "API_DATABASE_URL=$API_DATABASE_URL"   # copy for .env.production later
```

### 2e. Run migrations

```bash
API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate
```

### 2f. Verify migrations

```bash
API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm --filter @concourse/database test
```

### 2g. Seed initial data

```bash
API_DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:seed
```

---

## Step 3 — Configure environment variables

Create a local `.env.production` file from the template at `.env.production.example`
(populate with real secrets):

```bash
# Fill every value below with real secrets from your password manager.
# ─────────────────────────────────────────────────────────────────────
# Clean copy of .env.production.example with placeholders filled.
# DO NOT commit this file.
```

**Required secrets checklist:**

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API (Project URL) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API (anon public) |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.exai.app` |
| `API_DATABASE_URL` | Supabase Dashboard → Database → Connection String (Session/pooler, port 6543) |
| `API_SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL |
| `API_SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (service_role) |
| `API_SUPABASE_JWT_SECRET` | Supabase Dashboard → Settings → API (JWT Secret, Advanced) |
| `API_CORS_ORIGIN` | `https://exai.app` |
| `API_PUBLIC_WEB_ORIGIN` | `https://exai.app` |
| `API_PORT` | `3001` |
| `WORKER_DATABASE_URL` | Same as API_DATABASE_URL |
| `WORKER_REDIS_URL` | After Step 4 infra deploy: `terraform output redis_endpoint` |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `VOYAGE_API_KEY` | VoyageAI Dashboard |
| `POSTHOG_API_KEY` | PostHog Dashboard → Project Settings |
| `POSTHOG_HOST` | `https://app.posthog.com` |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM |
| `VAPID_PUBLIC_KEY` | Web push server keypair |
| `VAPID_PRIVATE_KEY` | Web push server keypair |
| `VAPID_SUBJECT` | `mailto:ops@exai.app` |

---

## Step 4 — Deploy API (AWS ECS Fargate)

### 4a. Provision infrastructure with Terraform

First, create the Terraform state bucket and lock table (one-time):

```bash
aws s3api create-bucket \
  --bucket concourse-terraform-state \
  --region us-east-1

aws dynamodb create-table \
  --table-name concourse-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Request an ACM certificate in us-east-1 for `api.exai.app` (or your domain):

```bash
aws acm request-certificate \
  --domain-name api.exai.app \
  --validation-method DNS \
  --region us-east-1

# Copy the certificate ARN — you'll paste it below.
```

Create `infra/environments/production/terraform.tfvars` from the example:

```bash
cp infra/environments/production/terraform.tfvars.example infra/environments/production/terraform.tfvars
```

Edit `terraform.tfvars` and set:
- `domain_name = "api.exai.app"`
- `certificate_arn = "arn:aws:acm:us-east-1:<ACCOUNT_ID>:certificate/<CERT_ID>"`

Then provision:

```bash
cd infra/environments/production

terraform init
terraform plan -out=tfplan
# Review the plan — it will create:
#   VPC (10.0.0.0/16), 6 subnets across 3 AZs
#   3 NAT Gateways, Internet Gateway, Route Tables
#   Application Load Balancer + HTTPS listener
#   ECS Cluster (FARGATE + FARGATE_SPOT)
#   API task definition (512 CPU / 1024 MB, 2 tasks)
#   Worker task definition (256 CPU / 512 MB, 1 task)
#   ElastiCache Redis 7.1 (cache.t4g.micro)
#   CloudWatch log groups
#   Route53 A alias for api.exai.app → ALB

terraform apply tfplan
cd -
```

### 4b. Record Redis endpoint

```bash
cd infra/environments/production
terraform output redis_endpoint   # e.g. redis://<cache-node>.cache.amazonaws.com:6379
cd -

# Save as WORKER_REDIS_URL
echo "redis://<ENDPOINT>:6379"
```

### 4c. Store secrets in AWS Secrets Manager

```bash
# Ensure the .env.production file is sourced before running these.
# Source your .env.production file:
#   set -a; . .env.production; set +a   (bash/zsh)
# Or export each variable manually.

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
    --secret-string "${!secret}" \
    --region us-east-1
done

for secret in \
  WORKER_DATABASE_URL \
  WORKER_REDIS_URL \
  ANTHROPIC_API_KEY \
  VOYAGE_API_KEY \
  POSTHOG_API_KEY; do
  aws secretsmanager create-secret \
    --name "concourse/production/${secret}" \
    --secret-string "${!secret}" \
    --region us-east-1
done
```

### 4d. Build, push, and deploy the API container

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_API="concourse-api"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

# Create ECR repo (one-time)
aws ecr create-repository --repository-name "$ECR_REPO_API" --region us-east-1

# Docker login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Build
TAG=$(git rev-parse HEAD)
docker build -t "$ECR_REPO_API:$TAG" \
  -t "$ECR_REPO_API:latest" \
  -f apps/api/Dockerfile .

# Push
docker tag "$ECR_REPO_API:$TAG" "$ECR_REGISTRY/$ECR_REPO_API:$TAG"
docker tag "$ECR_REPO_API:latest" "$ECR_REGISTRY/$ECR_REPO_API:latest"
docker push "$ECR_REGISTRY/$ECR_REPO_API:$TAG"
docker push "$ECR_REGISTRY/$ECR_REPO_API:latest"

# Deploy ECS service
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --force-new-deployment \
  --region us-east-1

# Wait for stability
aws ecs wait services-stable \
  --cluster concourse-production \
  --services concourse-production-api \
  --region us-east-1
```

### 4e. Verify API

```bash
# Direct ALB test (may need to resolve DNS first if propagation isn't done)
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names concourse-production-api-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region us-east-1)

curl -v "http://${ALB_DNS}/healthz"

# Via domain (may need DNS propagation time)
curl -v https://api.exai.app/healthz
# Expected: HTTP 200 { status: "ok" }
```

---

## Step 5 — Deploy Worker (AWS ECS Fargate)

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_WORKER="concourse-worker"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

# Create ECR repo (one-time)
aws ecr create-repository --repository-name "$ECR_REPO_WORKER" --region us-east-1

# Docker login (if not already logged in)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Build
TAG=$(git rev-parse HEAD)
docker build -t "$ECR_REPO_WORKER:$TAG" \
  -t "$ECR_REPO_WORKER:latest" \
  -f apps/worker/Dockerfile .

# Push
docker tag "$ECR_REPO_WORKER:$TAG" "$ECR_REGISTRY/$ECR_REPO_WORKER:$TAG"
docker tag "$ECR_REPO_WORKER:latest" "$ECR_REGISTRY/$ECR_REPO_WORKER:latest"
docker push "$ECR_REGISTRY/$ECR_REPO_WORKER:$TAG"
docker push "$ECR_REGISTRY/$ECR_REPO_WORKER:latest"

# Deploy ECS service
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-worker \
  --force-new-deployment \
  --region us-east-1

# Wait for stability
aws ecs wait services-stable \
  --cluster concourse-production \
  --services concourse-production-worker \
  --region us-east-1
```

### Verify Worker

```bash
aws logs tail /ecs/concourse-production-worker --since 5m
# Expect: "[worker] starting — Milestone ..." log line
```

---

## Step 6 — Deploy Web to Vercel

### 6a. One-time Vercel project setup

```bash
cd apps/web

# Link to Vercel (creates project if new)
vercel link --yes

# Capture project ID
vercel project ls
# VERCEL_PROJECT_ID=<id-from-above>  — store in password manager

cd -
```

### 6b. Set Vercel environment variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `<anon-key>` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.exai.app` |

Or via CLI:

```bash
# After vercel link --yes succeeded
cd apps/web

npx vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://<ref>.supabase.co
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# Paste: <anon-key>
npx vercel env add NEXT_PUBLIC_API_BASE_URL
# Paste: https://api.exai.app

cd -
```

### 6c. Deploy

```bash
cd apps/web

vercel deploy --prod \
  -e NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<anon-key>" \
  -e NEXT_PUBLIC_API_BASE_URL="https://api.exai.app"

cd -
```

> **ⓘ NOTE for CI/CD:** The GitHub secret `VERCEL_PROJECT_ID` must be set
> AFTER the first manual deploy creates the project. Then push to `main`
> triggers `.github/workflows/deploy-web.yml`.

### 6d. Configure custom domain

```bash
cd apps/web
vercel domains add exai.app
# Follow instructions to add DNS records (CNAME/ALIAS) at your DNS registrar.
cd -
```

---

## Step 7 — Verify production

Run the automated verification script:

```bash
# bash required (sh isn't enough — uses array syntax)
bash scripts/verify-production.sh https://api.exai.app https://exai.app

# Expected output:
#   API Health: ✓
#   CORS preflight: ✓
#   Web Availability: ✓
#   HSTS header: ✓ (may fail until Vercel/Next.js config adds HSTS)
#   DNS resolution: ✓ ✓
#   TLS: ✓
```

### Manual checklist

Run through each item and tick when confirmed:

```text
☐ https://exai.app loads without JavaScript errors (browser console)
☐ https://api.exai.app/healthz returns HTTP 200 { status: "ok" }
☐ https://api.exai.app/readyz returns HTTP 200 { status: "ok" }
☐ CORS: curl -X OPTIONS -H "Origin: https://exai.app" <api>/healthz → 200/204
☐ Supabase Auth (magic-link) sign-up / sign-in flow works end-to-end
☐ Browser completes sign-in → redirects back to /auth/callback → session cookie set
☐ Protected routes redirect to login when unauthenticated
☐ Session persists across page refresh
☐ API ↔ Supabase connection: health endpoint doesn't 500
☐ Worker logging visible in CloudWatch
☐ Redis connection (check worker logs for Redis errors)
☐ SSL/TLS: no browser warnings, padlock is green
☐ DNS: api.exai.app and exai.app both resolve
```

---

## Step 8 — CI/CD pipeline (activate)

Once Steps 1-7 are verified and stable, the CI/CD workflows in
`.github/workflows/` auto-deploy on push to `main`:

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Push to any branch, PR to main | Lint, typecheck, test, build Docker |
| `deploy-api.yml` | Push to main (api/packages changes) | Build Docker, push ECR, update ECS |
| `deploy-worker.yml` | Push to main (worker/packages changes) | Build Docker, push ECR, update ECS |
| `deploy-web.yml` | Push to main (web/packages changes) | Build, deploy to Vercel |

To enable GitHub OIDC for AWS (`AWS_ROLE_ARN`):

1. AWS IAM → Identity providers → Add GitHub (`token.actions.githubusercontent.com`)
2. Create IAM role with trust policy for `repo:GH_ORG/concourse:ref:refs/heads/main`
3. Attach policies: `AmazonEC2ContainerRegistryPowerUser`, `ecs:UpdateService`, `ecs:DescribeServices`, `ecs:DescribeTaskDefinition`
4. Set `AWS_ROLE_ARN` as GitHub Secret (Step 1c)

---

## Post-deploy monitoring

| Service | Dashboard |
|---|---|
| API ECS | CloudWatch → ECS → concourse-production → concourse-production-api |
| Worker ECS | CloudWatch → Logs → /ecs/concourse-production-worker |
| ElastiCache | CloudWatch → ElastiCache → concourse-production-redis |
| Web | Vercel Dashboard → Analytics |
| Database | Supabase Dashboard → Reports |

---

## Rollback quick-ref

```bash
# API: previous task-def revision
aws ecs update-service --cluster concourse-production --service concourse-production-api \
  --task-definition concourse-production-api:<PREV_REVISION> --force-new-deployment

# Web: instant rollback
cd apps/web && vercel rollback

# Database: Supabase Dashboard → Database → Backups → Restore
```

---

## Related documents

| Document | Location |
|---|---|
| Architecture blueprint | `docs/BLUEPRINT_V1.md` |
| Engineering guide | `docs/ENGINEERING_GUIDE.md` |
| Day-2 ops runbook | `ops/README.md` |
| Environment variables template | `.env.production.example` |
| Terraform root module | `infra/environments/production/main.tf` |
| CI/CD workflows | `.github/workflows/` |
| Deployment orchestrator script | `scripts/deploy.sh` |
| Production verification | `scripts/verify-production.sh` |
| Supabase production config | `supabase/production-config.toml` |