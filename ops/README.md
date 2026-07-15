# ExAi (Concourse) — Operations Runbook

Day-2 procedures for a running production deployment.

Status pages and dashboards to keep open during on-call shifts are listed in
`DEPLOYMENT.md` §7. This document adds the repair / investigation / ad-hoc
workflows.

---

## Logs

### API (ECS)

```bash
# Tail live logs
aws logs tail /ecs/concourse-production-api --follow

# Last 30 minutes
aws logs tail /ecs/concourse-production-api --since 30m

# With filter
aws logs tail /ecs/concourse-production-api --filter-pattern "ERROR"
```

### Worker (ECS)

```bash
aws logs tail /ecs/concourse-production-worker --follow
aws logs tail /ecs/concourse-production-worker --since 30m
```

### Vercel (Web)

```bash
# Vercel CLI
vercel logs exai.app --since 30m

# Vercel Dashboard → Analytics → Logs (with live tail)
```

### Supabase

- Dashboard → Database → Health
- Dashboard → Reports → Query Performance + Realtime

---

## Rollback

### API / Worker

```bash
# Find previous task-def revision
aws ecs describe-task-definition \
  --task-definition concourse-production-api \
  --query "taskDefinition.revision"

# Rollback API to previous revision (<REVISION_NUMBER>)
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --task-definition concourse-production-api:<PREVIOUS_REVISION> \
  --force-new-deployment \
  --region us-east-1
```

Repeat for `concourse-production-worker` replacing service + task-def names.

### Web (Vercel)

```bash
cd apps/web
vercel rollback
```

### Database (Supabase)

```bash
# Drizzle down migration (when down methods exist)
API_DATABASE_URL="<supabase-connection-string>" pnpm db:migrate:down

# Supabase backup restore
#   Dashboard → Database → Backups → Restore (pick point-in-time)
```

---

## Maintenance

### Supabase project configuration push

```bash
supabase link --project-ref <project-ref>
supabase push   # applies supabase/production-config.toml
```

### Run Drizzle migrations in production

```bash
# Set connection string and run
API_DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate
```

### Force ECS task recycling

```bash
# Cycle all API tasks (rolling)
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --force-new-deployment \
  --region us-east-1

# Cycle all worker tasks
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-worker \
  --force-new-deployment \
  --region us-east-1
```

### Secrets rotation

Rotate secrets in AWS Secrets Manager, then force new deployments:

```bash
aws secretsmanager update-secret \
  --secret-id "concourse/production/<VAR_NAME>" \
  --secret-string "<NEW_VALUE>"

# Then cycle the service(s) that consume the secret
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --force-new-deployment \
  --region us-east-1
```

---

## Health checks (manual)

```bash
# API
curl -v https://api.exai.app/healthz

# Web
curl -v https://exai.app

# CORS preflight
curl -v -X OPTIONS \
  -H "Origin: https://exai.app" \
  -H "Access-Control-Request-Method: GET" \
  https://api.exai.app/healthz
```

---

## DNS & TLS

```bash
# Check DNS
dig +short api.exai.app
dig +short exai.app

# Verify TLS
echo | openssl s_client -connect api.exai.app:443 -servername api.exai.app 2>/dev/null | openssl x509 -noout -dates
```

---

## ECS Service Scaling

Both services use Fargate launch type with default capacities:

| Service | Default Count | Default CPU | Default Memory |
|---|---|---|---|
| concourse-production-api | 2 | 512 | 1024 |
| concourse-production-worker | 1 | 256 | 512 |

To scale:

```bash
aws ecs update-service \
  --cluster concourse-production \
  --service concourse-production-api \
  --desired-count <N> \
  --region us-east-1
```

---

## CloudWatch Dashboards

| Dashboard | Path |
|---|---|
| ECS API | CloudWatch → ECS → concourse-production → concourse-production-api |
| ECS Worker | CloudWatch → ECS → concourse-production → concourse-production-worker |
| ElastiCache | CloudWatch → ElastiCache → concourse-production-redis |
| ALB | CloudWatch → Metrics → ApplicationELB → concourse-production-api-alb |

---

## Related documents

| Document | Location |
|---|---|
| One-shot deployment runbook | `DEPLOY_RUNBOOK.md` |
| Architecture overview with component map | `DEPLOYMENT.md` |
| Post-deploy verification | `scripts/verify-production.sh` |
| API health endpoint | `apps/api/src/modules/health/health.controller.ts` |