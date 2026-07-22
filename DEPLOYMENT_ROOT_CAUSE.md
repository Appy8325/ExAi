# Deployment Root Cause Analysis

Date: 2026-07-22
Project: ex-ai-api

---

## Observed Behavior

Deployment fails with error: `Command "npm install" exited with 1`
Error details: `npm error Unsupported URL Type "workspace:": workspace:*`

Despite setting `framework: null` and `builds` array in `apps/api/vercel.json`, Vercel:
1. Ignores the custom `installCommand` in vercel.json
2. Runs default `npm install` instead
3. Fails because npm doesn't understand pnpm workspace protocol (`workspace:*`)

---

## Evidence

### 1. Two vercel.json files exist

```
C:\Project\ExAi\vercel.json                          (root - web project)
C:\Project\ExAi\apps\api\vercel.json                (API project)
```

### 2. Project Dashboard Settings

```
Framework Preset:     NestJS
Root Directory:       apps/api
Build Command:       cd ../.. && pnpm --filter api... build
Output Directory:     dist
Install Command:     cd ../.. && pnpm install --frozen-lockfile
```

### 3. apps/api/vercel.json (current)

```json
{
  "framework": null,
  "project": "api",
  "installCommand": "cd ../.. && corepack pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && corepack pnpm --filter api... build",
  "outputDirectory": "dist",
  "builds": [
    { "src": "dist/main.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "main.js" }
  ]
}
```

### 4. Deployment Log

```
WARNING! Due to `builds` existing in your configuration file,
the Build and Development Settings defined in your Project Settings
will not apply. Learn More: https://vercel.link/unused-build-settings

Installing dependencies...
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
npm error A complete log of this run can be found in: /vercel/.npm/_logs/...
Error: Command "npm install" exited with 1
```

---

## Root Cause

### Primary Issue: `builds` array changes Vercel's behavior

When a `builds` array is present in vercel.json, Vercel enters a legacy build mode that:

1. **Ignores `installCommand`**: Vercel uses its own default install mechanism (`npm install`) instead of the custom `installCommand`
2. **Uses npm, not pnpm**: The default install is `npm install`, which fails on pnpm workspace protocol
3. **Ignores Framework Preset from vercel.json**: The `framework: null` and project settings are effectively bypassed in favor of the `builds` configuration

### Secondary Issue: pnpm workspace protocol incompatibility

The monorepo uses `workspace:*` protocol in package.json for workspace dependencies. This protocol is:
- Supported by pnpm
- NOT supported by npm

When Vercel runs `npm install` (because of the `builds` array), npm fails on the `workspace:*` dependency URLs.

---

## Why `framework: null` Doesn't Help

With `builds` array present, the `framework` field in vercel.json is largely irrelevant. The `builds` array puts Vercel into "custom build" mode where:

- Vercel uses `@vercel/node` builder for the specified `src`
- Vercel's default behavior (npm-based) takes over for the install phase
- The `installCommand` is silently ignored in this mode

The NestJS preset detection error from earlier ("No entrypoint found which imports nestjs") was a DIFFERENT issue that occurred when using the NestJS framework preset without the `builds` array.

---

## Configuration Interaction Matrix

| Configuration | Project Settings | vercel.json (root) | vercel.json (apps/api) | Result |
|---------------|------------------|-------------------|------------------------|--------|
| Framework Preset | NestJS | N/A | `null` | `builds` takes precedence, `null` ignored |
| Build Command | `cd ../.. && pnpm...` | N/A | `cd ../.. && corepack pnpm...` | `builds` takes precedence, both ignored |
| Install Command | `cd ../.. && pnpm install...` | N/A | `cd ../.. && corepack pnpm install...` | **Ignored**, Vercel uses `npm install` |
| Output Directory | `dist` | N/A | `dist` | `builds` takes precedence |

---

## Confidence Level

**HIGH (90%+)** - The evidence is clear from the deployment logs:

1. The warning "Due to `builds` existing in your configuration file" explicitly confirms `builds` is being used
2. The error "Command 'npm install' exited" shows Vercel is running npm, not our pnpm command
3. The npm failure on `workspace:*` is a known incompatibility

---

## Recommended Fix

### Option A: Remove `builds` array (Recommended)

Keep only essential settings in vercel.json, without `builds`:

```json
{
  "framework": null,
  "project": "api",
  "installCommand": "cd ../.. && corepack pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && corepack pnpm --filter api... build",
  "outputDirectory": "dist"
}
```

This allows:
- Project settings to be used (Framework Preset = NestJS handles serverless detection)
- Custom installCommand to be honored
- Vercel's NestJS preset to handle routing

**AND** update Project Dashboard:
- Set Framework Preset to "Other" (to avoid NestJS preset auto-detection issues)
- Set Install Command to `cd ../.. && pnpm install --frozen-lockfile`
- Set Build Command to `cd ../.. && pnpm --filter api... build`
- Set Output Directory to `dist`

### Option B: Use Vercel Monorepo Configuration Properly

Vercel has special handling for monorepos. Consider:
1. Using `vercel.json` at root with proper workspace configuration
2. Setting up `.npmrc` to handle workspace protocol
3. Or using the `vc build` approach

### Option C: Use Package Manager Override

In vercel.json, use `packageManager` field to force pnpm:

```json
{
  "framework": null,
  "packageManager": "pnpm@9.15.0",
  "installCommand": "corepack pnpm install --frozen-lockfile",
  ...
}
```

---

## Verification Steps

After fixing, the deployment log should show:
- `Running "install" command: cd ../.. && corepack pnpm install --frozen-lockfile`
- No "WARNING! Due to `builds`" message
- Successful npm/pnpm install phase
- NestJS app building successfully

---

## Files Referenced

- `C:\Project\ExAi\vercel.json` (root - web project config)
- `C:\Project\ExAi\apps\api\vercel.json` (API project - currently problematic)
- Project Dashboard: ex-ai-api settings

---

## Next Action

Remove the `builds` array from `apps/api/vercel.json` and test deployment. If that doesn't work, also change Project Settings Framework Preset to "Other" and ensure installCommand uses pnpm explicitly.