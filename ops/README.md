# ExAi (Concourse) — Day-2 Operations

For after the recommended deploy (Vercel + Supabase + Railway/Render) is up.
For legacy AWS / ECS / Terraform operations, see the AWS cloud console
directly — no AWS ops documentation is maintained for this stack.

---

## Logs

### Web (Vercel)

```bash
cd apps/web
vercel logs exai.app --since 30m      # last 30 minutes
# Vercel Dashboard → Analytics → Logs (with live tail)
```

### API & Worker (Railway)

```bash
railway logs --service api
railway logs --service worker
railway logs --service api --since 30m
# Or open the project on https://railway.app → service → Logs
```

### API & Worker (Render)

- Render Dashboard → Service → Logs tab.
- Live tail is in the same view.

### Supabase

- Dashboard → Database → Health (query performance, replication, history).
- Dashboard → Logs → Postgres / Auth / Realtime / API.
- Dashboard → Reports.

---

## Rollback

### Web (Vercel)

```bash
cd apps/web
vercel rollback       # last promotion
# Or: Vercel Dashboard → Deployments → ⋯ → Promote to Production
```

### API + Worker (Railway)

```bash
railway rollback --service api
railway rollback --service worker

# Or: railway.app → service → Deployments → ⋯ → Roll back to this deploy
```

### API + Worker (Render)

- Dashboard → Service → Deploys → choose a previous deploy → **Roll back**.

### Database (Supabase)

```bash
# Drizzle down migration (only if down() method exists in SQL file):
API_DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate:down
```

Most safety-critical: use Supabase **Point-in-Time Recovery** (Dashboard →
Database → Backups → Restore).

---

## Maintenance

### Run Drizzle migrations

```bash
API_DATABASE_URL="postgresql://postgres:<PWD>@db.<ref>.supabase.co:6543/postgres?pgbouncer=true" \
  pnpm db:migrate
```

Then restart the API service (Railway/Render will pick up the DB change
automatically; if you want a fresh deploy, push a no-op commit or click
**Redeploy** in the dashboard).

### Supabase project configuration push

```bash
supabase link --project-ref <ref>
supabase push
```

### Force service recycling (stable deploys)

Railway and Render roll new containers on every push. To trigger a
fresh deploy without code changes:

- Railway: service → **Deploy** tab → **Restart**, or trigger
  `railway up` again.
- Render: service → **Manual Deploy** → **Clear build cache & deploy**.
- Vercel: push an empty commit, or project → Deployments → Redeploy.

### Secrets rotation

1. Rotate the secret inside the upstream service (e.g. Anthropic, Voyage,
   Supabase Dashboard → API → JWT Secret).
2. Update the env var on **each** consumer:
   - API service (Railway/Render): Dashboard → Variables → save.
   - Worker service: same.
   - Vercel Web: `vercel env rm NAME production && vercel env add NAME production`.
3. Restart the relevant service.

### Custom domain DNS

`exai.app` (Vercel) and `api.exai.app` (Railway/Render) — DNS records
live with your registrar. CNAME TTL = 5–15 min; ALIAS / A only where
CNAME is unsupported at the apex.

---

## Health checks (manual)

```bash
# API
curl -v https://api.exai.app/healthz
curl -v https://api.exai.app/readyz

# Web
curl -v https://exai.app

# CORS preflight
curl -v -X OPTIONS \
  -H "Origin: https://exai.app" \
  -H "Access-Control-Request-Method: GET" \
  https://api.exai.app/healthz
```

For automated verification:

```bash
bash scripts/verify-production.sh https://api.exai.app https://exai.app
```

---

## DNS & TLS

```bash
# DNS
dig +short api.exai.app
dig +short exai.app
dig +short www.exai.app

# TLS
echo | openssl s_client -connect api.exai.app:443 -servername api.exai.app \
  2>/dev/null | openssl x509 -noout -dates -subject
```

TLS certs are managed by:
- Vercel (Web, automatic via domain attach)
- Railway (API, managed via `railway domain` + automatic on dedicated
  load balancing, or your own CNAME)
- Render (API, managed via custom domain feature)
- Supabase (DB, `*.supabase.co` certificates)

---

## Scaling knobs

| Knob | How |
|---|---|
| API service replicas (Railway) | Service → Settings → **Replicas** (manual scale) |
| API service memory/CPU (Railway) | Service → Settings → **Resources** → change `API_PORT`-friendly sizes |
| Redis (Railway) | Add-on → upgrade tier |
| Worker concurrency | Worker code not yet wired for horizontal scale (one process); run multiple Worker services if needed |
| Web (Vercel) | Auto-scales by request volume; any pricing plan change is in Project → Settings |

---

## Backup & restore

### Database (Supabase)

- **PITR** (point-in-time recovery) is enabled by default for projects
  on the Pro plan and above.
- **Daily backups** can be enabled for free-tier projects.

Restore path: Dashboard → Database → Backups → Restore (Pick any of:
selective table / logical backup from scheduled snapshot).

### Application state

All mutable application state lives in Postgres + Supabase Storage +
Postgres-stored Secrets. There is no other persistent layer to back up
on a per-deployable basis.

---

## When to escalate back to AWS / Terraform

The full enterprise pipeline (`infra/`, `terraform`, ECS Fargate,
ElastiCache Redis, ALB, Route53 alias, ACM, Secrets Manager IAM)
remains on disk under `infra/` and `.github/workflows/deploy-*.yml`
(legacy). You should switch back to it when:

- A customer requires AWS region / residency compliance.
- You exceed Railway/Render free-tier limits and need dedicated
  hardware.
- An SOC2 audit requires AWS account-level controls.

Read `infra/README.md` before any terraform work. The recommended path
in `DEPLOYMENT.md` is **not** an AWS migration; AWS is one option
among several at this point.

---

## Related documents

| Document | Location |
|---|---|
| Step-by-step deployment | `DEPLOY_RUNBOOK.md` |
| Architecture overview | `DEPLOYMENT.md` |
| Production verification | `scripts/verify-production.sh` |
| Health endpoint | `apps/api/src/modules/health/health.controller.ts` |
| Worker bootstrap | `apps/worker/src/main.ts` |
