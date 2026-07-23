# NestJS Entrypoint Audit

**Date:** 2026-07-22
**Status:** CLOSED
**Investigation:** COMPLETED
**Canonical Document:** Yes - Future deployment work should reference this document.

---

## Executive Summary

A side-effect import (`import '@nestjs/core';`) was validated as a working workaround for Vercel's NestJS runtime detection.

**Deployment URL:** https://ex-ai-api.vercel.app
**Latest:** https://ex-ai-2emi9wxb5-ex-ai.vercel.app

**Validation Results (2026-07-22):**
- ✅ Vercel detects NestJS runtime via `framework: "nestjs"`
- ✅ Lambda function created: `λ index (2.32MB) [iad1]`
- ✅ Deployment status: Ready
- ⚠️ Runtime error on missing env vars (expected - separate issue)
- ✅ No changes to local development

---

## Workaround Status

| Approach | Status | Date Validated |
|----------|--------|----------------|
| Side-effect `import '@nestjs/core';` | **VALIDATED** | 2026-07-22 |
| Standard `app.listen()` bootstrap | Deferred | - |
| `api/` directory pattern | Not pursued | - |

**The side-effect import is NOT the long-term solution.** It is a temporary workaround that allows deployment while the bootstrap architecture is stabilized separately.

**Long-term target:** Refactor `main.ts` to use standard NestJS bootstrap pattern when deployment architecture is fully understood.

---

## 1. How a Standard NestJS Entrypoint Looks

The official Vercel NestJS example (`vercel/vercel/examples/nestjs`) uses this `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

**Key characteristics:**
1. **Direct `@nestjs/core` import** - `NestFactory` is imported from `@nestjs/core`, not from a local module
2. **Standard `app.listen()` pattern** - Server starts by calling `app.listen()` at the module level (not inside conditionals)
3. **No custom handler** - No `exports.default = handler` pattern
4. **Zero vercel.json** - Framework detection handles everything

---

## 2. How Our `main.ts` Differs

### Current `apps/api/src/main.ts`:

```typescript
import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
import { NestFactory } from "@nestjs/core";        // <-- Line 3
import { createApiApplication } from "./application";  // <-- NOT @nestjs/core

let applicationPromise: ReturnType<typeof createApiApplication> | undefined;

async function bootstrap(): Promise<void> {
  const app = await createApiApplication();          // <-- Indirect call
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("API_PORT must be a valid TCP port.");
  await app.listen(port, "0.0.0.0");
}

async function getApplication() {
  applicationPromise ??= createApiApplication();
  return applicationPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApplication();
  const instance = app.getHttpAdapter().getInstance();
  await instance.ready();
  instance.server.emit("request", req, res);
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  bootstrap();                                       // <-- Conditional call
}
```

### Differences from Standard Pattern

| Aspect | Standard | Ours |
|--------|----------|------|
| `@nestjs/core` import location | Direct in main | Only via `./application` (indirect) |
| `NestFactory` usage | Direct call | Delegated to `createApiApplication()` |
| Server startup | Unconditional `app.listen()` | Conditional `bootstrap()` |
| Vercel integration | None | `exports.default = handler` |
| Entrypoint detection signal | Direct import OR `app.listen()` at module level | Hidden behind function call + indirect import |

---

## 3. Does `./application` Hide the `@nestjs/core` Import?

**No, but the issue is different.**

The import IS direct in source (line 3 of our main.ts):
```typescript
import { NestFactory } from "@nestjs/core";
```

However, **`NestFactory` is imported but never used in `main.ts`**. It's only used in `application.ts`. TypeScript/TSCandles remove unused imports during compilation.

**Our compiled `main.js`:**
```javascript
exports.default = handler;
require("reflect-metadata");
const application_1 = require("./application");
// ... no @nestjs/core import
```

**But Vercel scans SOURCE files**, not compiled output. So the source `main.ts` DOES have the direct import. Yet Vercel still fails to detect it.

**Possible reasons:**
1. Vercel's NestJS detector looks for `@nestjs/core` to be **actually used**, not just imported
2. The `exports.default = handler` pattern confuses the detection (looks like a Vercel Function, not a NestJS server)
3. The conditional `bootstrap()` means `app.listen()` is not guaranteed to be called

**The error:** `No entrypoint found which imports nestjs` confirms Vercel is NOT finding the direct `@nestjs/core` import it expects, even though one exists on line 3.

This suggests Vercel's detection may have a bug or limitation with our specific structure, OR it requires `app.listen()` to be called directly (not through an intermediate function).

---

## 4. Whether a Small Refactor Naturally Satisfies Detection

### Option A: Standard NestJS Bootstrap (Minimal)

Refactor `main.ts` to use the official pattern:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

**Pros:**
- Matches official pattern exactly
- No side-effect imports
- No framework detection workarounds

**Cons:**
- Duplicates logic in `application.ts`
- `application.ts` currently owns the FastifyAdapter setup
- More code changes

### Option B: Add `src/server.ts` (Minimal)

Create a new file `src/server.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const app = await NestFactory.create(AppModule, new FastifyAdapter());
app.listen(3000);
```

**Pros:**
- Separate file doesn't touch existing code
- Directly satisfies Vercel's `server.ts` detection pattern

**Cons:**
- Duplicates NestFactory usage
- Need to coordinate with existing `application.ts`

### Option C: Reorder Imports in `main.ts`

Put `@nestjs/core` import first and ensure NestFactory is imported **and used** directly:

```typescript
import { NestFactory } from '@nestjs/core';  // Must be direct
import { createApiApplication } from './application';

// Use NestFactory directly at module level to satisfy detection
// The app.listen call happens inside createApiApplication
const app = await NestFactory.create(AppModule, new FastifyAdapter());
app.listen(process.env.PORT ?? 3000);
```

**Pros:**
- Minimal change if possible
- Keeps existing structure

**Cons:**
- Still duplicates NestFactory usage
- May not work if detection needs `app.listen()` at top level

---

## 5. Side-Effect Import: Workaround or Officially Supported?

### The Side-Effect Import Approach

```typescript
import '@nestjs/core';  // Vercel detection - do not remove
import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApiApplication } from "./application";

// ... rest unchanged
```

### Is This Officially Supported?

**No clear documentation exists either way.**

**Evidence for it being legitimate:**
1. Vercel's detector uses regex `(?:from|require|import)\s*["\']@nestjs/core["\']` which matches `import '@nestjs/core'` (side-effect import)
2. Side-effect imports are valid ES module syntax
3. Many build tools and frameworks use this pattern for detection

**Evidence for it being a workaround:**
1. No official Vercel documentation recommends this
2. The official NestJS example doesn't need it
3. Vercel's own framework detection was designed around the standard `app.listen()` pattern, not side-effect imports
4. It introduces semantic confusion (importing for side effects, not symbols)

### Conclusion on Side-Effect Import

**It is a pragmatic workaround, not an architectural solution.**

It works because:
- Vercel's regex matches `import '@nestjs/core'`
- Satisfies detection without code restructure
- No functional change to runtime behavior

**But it should be documented as a workaround** because:
- It's not the pattern the detection was designed for
- Future Vercel changes could break this
- It creates a non-obvious dependency on Vercel's specific detection regex

---

## 6. Root Cause Summary

### Primary Root Cause

**Vercel's NestJS framework detection does NOT recognize our entrypoint as a NestJS application** due to two structural issues:

1. **`@nestjs/core` is imported but not used in `main.ts`**
   - We import `NestFactory` on line 3 but only use it via `createApiApplication()` from `./application`
   - TypeScript tree-shaking removes the unused import from compiled output
   - Vercel's detector, even if scanning source, appears to require `NestFactory` to be **used** in the entrypoint

2. **`app.listen()` is not called at module level**
   - The standard detection also accepts `app.listen()` as a signal
   - Our `app.listen()` is inside `bootstrap()` which is only called conditionally (`if (!process.env.VERCEL)`)
   - At deploy time, `bootstrap()` is never called, so the detection finds no server-starting code

### Secondary Issue

**Our dual-mode design (local vs Vercel) works against framework detection:**
- Local: `bootstrap()` is called → `app.listen()` starts server
- Vercel: `exports.default = handler` → Custom handler function, no `app.listen()`

This pattern is valid for serverless but conflicts with Vercel's framework detection expectations.

---

## 7. Classification: Root Cause vs Fix vs Workaround

| Approach | Classification | Description |
|----------|---------------|-------------|
| Standard NestJS bootstrap (`app.listen()` at module level) | **Root Cause Fix** | Restructure to match detection expectations |
| Create `src/server.ts` with `server.listen()` | **Root Cause Fix** | Use detection's built-in pattern |
| `import '@nestjs/core';` (side-effect import) | **Workaround** | Pragmatic but not architecturally clean |
| `framework: null` + `builds` array | **Rejected Alternative** | Fails on `workspace:*` protocol |

---

## 8. Recommended Minimal Fix

### Option 1: Structural Correctness (Preferred)

Refactor `main.ts` to follow standard NestJS pattern:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  await app.listen(process.env.API_PORT ?? 3001);
}

bootstrap();
```

**Why this works:**
- Direct `@nestjs/core` import is **used**, not just present
- `app.listen()` is called at module level
- Matches exactly what detection expects

**Cost:**
- Moves FastifyAdapter setup from `application.ts` to `main.ts`
- Duplicates module creation logic

### Option 2: Create `src/server.ts` (Alternative)

Create new `src/server.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const app = await NestFactory.create(AppModule, new FastifyAdapter());
app.listen(process.env.API_PORT ?? 3001);
```

**Why this works:**
- Vercel detects `server.ts` with `server.listen()` as a valid NestJS entrypoint
- Doesn't change existing `main.ts` structure

**Cost:**
- Need to configure Vercel to use `server.ts` as entrypoint
- Still duplicates NestFactory usage

### Option 3: Side-Effect Import (Workaround)

Add to `main.ts`:

```typescript
import '@nestjs/core';  // Vercel detection - do not remove
```

**Why this works:**
- Matches Vercel's regex for direct `@nestjs/core` import
- Pragmatic, minimal change

**Cost:**
- Not an architecturally clean solution
- Relies on detection regex behavior
- Could break if Vercel changes detection

---

## 9. Decision Recommendation

**Choose Option 1 (Standard NestJS Bootstrap)** for structural correctness.

**If time Pressured, use Option 3 (Side-Effect Import)** as a documented workaround with clear comments explaining why.

**Do NOT use `framework: null` + `builds`** because it breaks pnpm workspace support.

---

## 10. Remaining Blockers

After fixing the detection issue, the following still need resolution:

1. **Missing Environment Variables:**
   - `API_SUPABASE_SERVICE_ROLE_KEY`
   - `API_SUPABASE_JWT_SECRET`

2. **`createApiApplication()` ownership:**
   - Refactoring `main.ts` requires deciding whether `application.ts` still serves a purpose
   - If `main.ts` directly uses `NestFactory.create()`, what happens to the `createApiApplication()` abstraction?

3. **Vercel-specific handler:**
   - If we use standard bootstrap, how does the Vercel Function get created?
   - Does `app.listen()` work on Vercel, or do we still need a custom handler?