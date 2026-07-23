# Database Readiness Audit

**Date:** 2026-07-23
**Author:** EPIC 3 Investigation + RC-1 Verification
**Classification:** Configuration (Infrastructure)
**Priority:** Critical — production blocker
**Status:** VERIFIED ✅

---

## Current State (2026-07-23 late, verified via live endpoint testing)

| Endpoint | Result |
|----------|--------|
| `GET /healthz` (API) | ✅ 200 `{"status":"ok"}` |
| `GET /readyz` (API) | ✅ 200 `{"status":"ok"}` |
| `GET /healthz` (Web) | ✅ 200 `{"status":"ok"}` |
| `GET /readyz` (Web) | ✅ 200 `{"status":"ok"}` |

**Conclusion: Supabase project is active, `API_DATABASE_URL` is correctly configured with Supavisor format, and database connectivity is working.**

---

## Investigation Summary

| Check | Result |
|-------|--------|
| `API_DATABASE_URL` updated to Supavisor hostname | ✅ Done |
| Redeployed `ex-ai-api` | ✅ `https://ex-ai-api.vercel.app` |
| `GET /healthz` | ✅ **200** `{"status":"ok"}` |
| `GET /readyz` | ✅ **200** `{"status":"ok"}` |

**Fix applied:**
```
postgresql://postgres.qrqmgvtonhzyhqihmovv:Apoorv%408325@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Changed:**
- Hostname: `db.qrqmgvtonhzyhqihmovv.supabase.co` → `aws-0-ap-northeast-1.pooler.supabase.com`
- Username: `postgres` → `postgres.qrqmgvtonhzyhqihmovv` (Supavisor tenant ID)
- Port: `6543` (unchanged)
- Password: `Apoorv@8325` → `Apoorv%408325` (URL-encoded `@`)

---

## Summary

`/readyz` returns `503 Database unavailable` because `API_DATABASE_URL` uses the **Dedicated Pooler (PgBouncer)** hostname `db.qrqmgvtonhzyhqihmovv.supabase.co:6543`, which is an **IPv6-only** endpoint. Vercel Lambda functions are **IPv4-only** and cannot reach IPv6-only destinations. The Supabase project is active and the database is functional — the issue is exclusively a network reachability problem caused by a mismatched connection string format.

---

## Root Cause

**IPv6-only database endpoint incompatible with Vercel Lambda's IPv4-only network**

The `API_DATABASE_URL` environment variable on the `ex-ai-api` Vercel project uses the **Dedicated Pooler (PgBouncer)** hostname format:

```
postgresql://postgres:<PASSWORD>@db.qrqmgvtonhzyhqihmovv.supabase.co:6543/postgres?pgbouncer=true
```

This format has two problems for a free-tier Supabase project deployed on Vercel:

1. **PgBouncer Dedicated Pooler is a paid-tier feature.** On free tier, the `db.<ref>.supabase.co` hostname routes to an IPv6-only endpoint with no IPv4 address.

2. **Vercel Lambda's network stack is IPv4-only.** The Lambda cannot resolve or connect to AAAA (IPv6) records.

Evidence from DNS queries run from local machine:
```
> Resolve-DnsName "db.qrqmgvtonhzyhqihmovv.supabase.co" -Type AAAA
Name: db.qrqmgvtonhzyhqihmovv.supabase.co
Type: AAAA
IPAddress: 2406:da14:18fe:3101:8986:e1ee:ff4c:36e3   ← IPv6 only, no A record

> Resolve-DnsName "db.qrqmgvtonhzyhqihmovv.supabase.co" -Type A
# Returns SOA record for supabase.co — NO A record exists
```

This is confirmed by Supabase's own documentation (2026-07-23):

> **Shared pooler (Supavisor):** IPv4-only on every tier
> **Dedicated pooler (PgBouncer):** paid tier, IPv6 (free tier) or IPv4 (with IPv4 add-on)

---

## Evidence Chain

### 1. Vercel Lambda Error

The Lambda function returns:
```
getaddrinfo ENOTFOUND db.qrqmgvtonhzyhqihmovv.supabase.co
```

This is a **DNS resolution failure** — the hostname resolves to an IPv6 address only, which Vercel's DNS cannot route to.

### 2. Supabase Project Is Active

The Supabase project `qrqmgvtonhzyhqihmovv` is **not paused** — it responds to REST API calls:
```
GET https://qrqmgvtonhzyhqihmovv.supabase.co/rest/v1/
→ 401 Unauthorized (validates the host is up; auth failure is expected without a key)
```

The database itself is fully operational.

### 3. Lambda Health vs Readiness

| Endpoint | Response | Meaning |
|----------|----------|---------|
| `GET /healthz` | 200 `{"status":"ok"}` | NestJS app initializes; `HealthController` has no DB dependency |
| `GET /readyz` | 503 `{"message":"Database is unavailable."}` | `SELECT 1` triggers actual connection; fails on IPv6-only host |

This proves:
- `API_DATABASE_URL` IS set (module loads without throwing)
- `postgres-js` is attempting connection to the IPv6-only hostname
- The database is reachable — the network path is broken

### 4. Connection String Format Analysis

| Document | Connection String Format | Hostname |
|----------|-------------------------|----------|
| `DATABASE_READINESS_AUDIT.md` (old, 2026-07-22) | `db.<ref>.supabase.co:6543` | Dedicated PgBouncer (IPv6-only free tier) |
| `FINAL_HACKATHON_REPORT.md` | `aws-0-ap-northeast-1.pooler.supabase.com:6543` | **Supavisor** (IPv4) ✅ |
| `DEPLOYMENT_SUCCESS_REPORT.md` | `db.<ref>.supabase.co:6543` | Dedicated PgBouncer (IPv6-only free tier) ❌ |

The `FINAL_HACKATHON_REPORT.md` correctly identified the Supavisor format as the working connection string for serverless (Vercel), but the environment variable on Vercel was apparently never updated to use it.

### 5. Database Client Configuration

**File:** `packages/database/src/client.ts`

```ts
const connectionString = process.env.API_DATABASE_URL ?? process.env.WORKER_DATABASE_URL;

const queryClient = postgres(connectionString, {
  max: 10,
  prepare: false,  // Correct: Supabase/pgBouncer don't support prepared statements
});
```

No SSL is explicitly configured. Supavisor handles SSL termination at the pooler level, so this is correct for port 6543.

The connection is **lazy** — `postgres-js` does not attempt TCP connection until the first query is executed. This is why:
- The module loads without error (no immediate TCP connection)
- `/healthz` succeeds (no DB query)
- `/readyz` fails only when `SELECT 1` is executed

### 6. Network Path Verification

From local machine:
```
> Test-NetConnection "aws-0-ap-northeast-1.pooler.supabase.com" -Port 6543

ComputerName     : aws-0-ap-northeast-1.pooler.supabase.com
RemoteAddress    : 35.79.125.133 (AWS ELB, IPv4)
TcpTestSucceeded : True   ← Supavisor IS reachable
```

```
> Test-NetConnection "db.qrqmgvtonhzyhqihmovv.supabase.co" -Port 6543

ComputerName     : db.qrqmgvtonhzyhqihmovv.supabase.co
RemoteAddress    : 2406:da14:18fe:3101:8986:e1ee:ff4c:36e3 (IPv6)
TcpTestSucceeded : True   ← Resolves and connects from local (IPv6-capable machine)
```

The `db.<ref>.supabase.co` hostname works from a local machine (dual-stack), but Vercel Lambda is IPv4-only and cannot route to IPv6 addresses.

---

## Classification

| Category | Value | Rationale |
|----------|-------|-----------|
| **Root Cause** | IPv6-only network destination | PgBouncer dedicated pooler hostname is IPv6-only on free tier |
| **Configuration** | **Primary** | `API_DATABASE_URL` must use Supavisor hostname, not `db.<ref>.supabase.co` |
| **Infrastructure** | Secondary | Supabase free tier's IPv6-only constraint; Supavisor is the designed solution |
| **Networking** | Tertiary | Vercel Lambda is IPv4-only; this is expected Supabase behavior for serverless |
| **Application Code** | No issue | `client.ts`, `HealthController`, and all DB queries are correct |

---

## Recommended Fix

### Update `API_DATABASE_URL` on Vercel

Replace the current value with the **Supavisor transaction-mode connection string** (IPv4-only):

**Current (broken):**
```
postgresql://postgres:<PASSWORD>@db.qrqmgvtonhzyhqihmovv.supabase.co:6543/postgres?pgbouncer=true
```

**Correct (Supavisor):**
```
postgresql://postgres.qrqmgvtonhzyhqihmovv:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Key differences:
1. Hostname: `db.qrqmgvtonhzyhqihmovv.supabase.co` → `aws-0-ap-northeast-1.pooler.supabase.com`
2. Username: `postgres` → `postgres.qrqmgvtonhzyhqihmovv` (Supavisor tenant ID)
3. Password encoding: Special characters like `@` must be URL-encoded (e.g., `Apoorv@8325` → `Apoorv%408325`)
4. No `?pgbouncer=true` query param (Supavisor is always in transaction mode)

### Steps to Apply

1. **Get the current password** from Supabase dashboard: `Settings → Database → Connection string → Transaction mode`

2. **Update the Vercel environment variable:**
   ```bash
   vercel env update API_DATABASE_URL production --project ex-ai-api --value "postgresql://postgres.qrqmgvtonhzyhqihmovv:<URL-ENCODED-PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
   ```

   Or via Vercel dashboard: `Project → Settings → Environment Variables → API_DATABASE_URL`

3. **Redeploy** to pick up the new environment variable:
   ```bash
   vercel deploy --prod --yes --project ex-ai-api
   ```

4. **Verify:**
   ```bash
   curl https://ex-ai-api.vercel.app/readyz
   # Expected: {"status":"ok"}
   ```

---

## Secondary Observations

### Also Update MIGRATION_DATABASE_URL

If `MIGRATION_DATABASE_URL` uses the same `db.<ref>.supabase.co` format, it should also be updated to use the Supavisor direct connection string for migrations:

```
postgresql://postgres.qrqmgvtonhzyhqihmovv:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

Note: For migrations, consider using the **direct connection** (port 5432) which bypasses the pooler. However, direct connection is also IPv6-only on free tier. The Supavisor session mode (port 5432) would work for migrations from IPv4-only environments.

### Connection Pool Sizing

With `max: 10` and Vercel's serverless model (many concurrent Lambda instances, each with its own pool), total active connections to Supabase could be `10 × N instances`. Supabase free tier has a limited connection pool. Monitor via Supabase dashboard after the fix.

### Project Reference Variant

Earlier documents (e.g., `DEPLOYMENT_SUCCESS_REPORT.md`) reference `qrqmqvtonhzyyhqhimovv` (different letter in "mgv"). The correct project reference is `qrqmgvtonhzyhqihmovv` as confirmed by:
- The Supabase REST API responding at `qrqmgvtonhzyhqihmovv.supabase.co`
- DNS resolution confirming `db.qrqmgvtonhzyhqihmovv.supabase.co`

### Previous Audit (2026-07-22) Misdiagnosis

The `DATABASE_READINESS_AUDIT.md` from 2026-07-22 concluded the Supabase project was **paused**. This was incorrect — the project was and is active. The real cause was the IPv6-only hostname incompatibility with Vercel Lambda's IPv4-only network.

### RC-1 Report Correction

The `RC1_RELEASE_REPORT.md` initially stated `/readyz` returned 503 because "Supabase project is paused." This was also incorrect. The Supabase project was never paused. The root cause is correctly documented in this file. The RC-1 report has been updated to reflect the actual finding.

---

## Conclusion

**Root cause: Configuration — `API_DATABASE_URL` uses an IPv6-only hostname (`db.qrqmgvtonhzyhqihmovv.supabase.co`) that is incompatible with Vercel Lambda's IPv4-only network.**

**Category: Configuration (specifically, connection string format)**

**Status: CLOSED** — Fix verified and applied.

The application code is correct. The Supabase project is active. The fix was to update `API_DATABASE_URL` to use the **Supavisor transaction-mode connection string** (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) which is IPv4-only and designed for serverless environments. No code changes were required.

Both `/healthz` and `/readyz` now return `200 {"status":"ok"}`.