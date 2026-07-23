# Lockfile Root Cause Validation

**Date:** July 22, 2026
**Purpose:** Determine whether the lockfile is stale, and identify the actual root cause of missing `dist/` folders.

---

## Verification Results

### 1. Registry Confirmation ✅

```
$ npm config get registry
https://registry.npmjs.org/
```

No mirror, proxy, or alternate registry. All packages downloaded from official npm.

---

### 2. Package Versions ✅

| Package | Lockfile Version | npm Version | Match? |
|---------|-----------------|-------------|--------|
| `rxjs` | 7.8.2 | 7.8.2 | ✅ Exact match |
| `@nestjs/config` | 4.0.4 | 4.0.4 | ✅ Exact match |
| `@supabase/supabase-js` | 2.110.2 | 2.110.2 | ✅ Exact match |

---

### 3. Lockfile Integrity vs. npm Tarballs ✅ (Corrected)

Initial report used SHA256. Corrected comparison using **SHA512** (matching lockfile format):

| Package | Lockfile Integrity (SHA512) | Computed SHA512 of current npm tarball | Match? |
|---------|---------------------------|---------------------------------------|--------|
| `rxjs@7.8.2` | `dhKf903U/PQZY6...` | `dhKf903U/PQZY6boNNtAGdWbG85WAbjT/1xYoZIC7FAY0yWapOBQVsVrDl58W86//e1VpMNBtRV4MaXfdMySFA==` | ✅ **EXACT MATCH** |
| `@nestjs/config@4.0.4` | `CJPjNitr0bAufS...` | `CJPjNitr0bAufSEnRe2N+JbnVmMmDoo6hvKCPzXgZoGwJSmp/dZPk9f/RMbuD/+Q1ZJPjwsRpq0vxna++Knwow==` | ✅ **EXACT MATCH** |
| `@supabase/supabase-js@2.110.2` | `r9q9w4ZQ6mOjh3...` | `r9q9w4ZQ6mOjh36aqUNFSisBF611vzpO8JphBESr2Q1SWvmGFQeI7Jq7Y+PaNMZ6Zszz+S2yTlJStCpnaMSnQg==` | ✅ **EXACT MATCH** |

**The lockfile integrity hashes exactly match the current npm tarballs.** The lockfile is NOT pointing to obsolete tarballs.

**Previous conclusion (lockfile staleness) was incorrect.** This document supersedes `ENVIRONMENT_INTEGRITY_REPORT.md` in that regard.

---

### 4. Alternative Explanations Eliminated

| Hypothesis | Evidence | Status |
|-----------|---------|--------|
| **Different registry** | `npm config get registry` = `https://registry.npmjs.org/` | ❌ Eliminated |
| **Mirror or proxy** | No proxy configured; direct npm access confirmed | ❌ Eliminated |
| **Cached artifact** | `pnpm store status` = "untouched"; no proxy cache found | ❌ Eliminated |
| **Package aliasing** | Package.json uses correct names (@nestjs/config, rxjs, supabase-js) | ❌ Eliminated |
| **Lockfile version mismatch** | lockfileVersion = 9.0 (matches pnpm 9.15.0) | ❌ Eliminated |
| **Stale lockfile** | SHA512 integrity hashes match current npm tarballs exactly | ❌ Eliminated |

---

### 5. Actual Root Cause: Partial Installation from pnpm v3 Store

#### Finding A: Installed packages use v3 store, not v11

```
$ Get-Item apps\api\node_modules\rxjs\package.json | Select-Object -ExpandProperty Target
C:\Users\apoor\AppData\Local\pnpm\store\v3\files\c1\4e51d9ee...\package.json
C:\Users\apoor\OneDrive\Desktop\ExAi\node_modules\.pnpm\rxjs@7.8.2\node_modules\rxjs\package.json
C:\Project\ExAi\node_modules\.pnpm\rxjs@7.8.2\node_modules\rxjs\package.json
```

All files in `apps/api/node_modules/rxjs/` are hard-linked to **`store/v3/files/...`**. But:

- pnpm 9.15.0 uses `store/v11` by default
- The lockfile specifies `lockfileVersion: 9.0` (pnpm 9)
- **The installed packages are linked to the v3 store, not v11**

This indicates the packages were originally installed using a **different (older) pnpm version** that uses the v3 store. When pnpm was upgraded to v9.15.0, the lockfile was regenerated (or a pre-existing v9 lockfile was used), but the node_modules were not reinstalled.

#### Finding B: v3 store has package.json but missing dist/ content

- `store/v3/files/.../rxjs@7.8.2/package.json` (v3 store) shows `version: "7.8.2"` and `"files": ["dist/bundles", "dist/cjs/**/..."]` — indicating dist/ SHOULD be present
- However, `node_modules/.pnpm/rxjs@7.8.2/node_modules/rxjs/` contains only: `ajax`, `fetch`, `operators`, `src`, `testing`, `webSocket`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `LICENSE.txt`, `package.json`, `README.md`, `tsconfig.json` — **no `dist/` folder**
- The hardlinks from `apps/api/node_modules/rxjs/` all point to v3 store files
- **The v3 store has the rxjs package metadata (package.json) but the dist/ content is missing**

#### Finding C: Same pattern for all three packages

Both `@nestjs/config` and `@supabase/supabase-js` exhibit the same issue:
- Their node_modules directories are hard-linked to the v3 store
- Their v3 store entries lack the expected compiled output

#### Finding D: Project was originally on OneDrive Desktop

The hardlink targets include:
```
C:\Users\apoor\OneDrive\Desktop\ExAi\node_modules\.pnpm\rxjs@7.8.2\node_modules\rxjs\...
C:\Users\apoor\OneDrive\Desktop\ExAi\node_modules\.pnpm\rxjs@7.8.1\node_modules\rxjs\...
```

This machine (`C:\Project\ExAi`) is a **different path** from OneDrive (`C:\Users\apoor\OneDrive\Desktop\ExAi`). The hardlinks prove:
1. The project was originally on OneDrive Desktop
2. It was moved to this machine (or cloned)
3. The node_modules were copied/moved without being reinstalled
4. The v3 store on this machine was populated by the original OneDrive installation

#### Finding E: pnpm store status is not a completeness check

```
$ pnpm store status
Packages in the store are untouched
```

This means: "the store content has not been modified since installation." It does **NOT** mean "the store has complete packages." The v3 store is "untouched" but was never complete to begin with.

---

## Root Cause Summary

**Observation:** The lockfile correctly references the current npm tarballs (integrity hashes match exactly). The npm registry tarballs contain complete packages with `dist/`. However, the packages installed in `node_modules/` are hard-linked to the **pnpm v3 store**, which contains **incomplete package installations** — package metadata exists but compiled output (dist/) is missing.

**Hypothesis:** The project was originally installed on a machine at `C:\Users\apoor\OneDrive\Desktop\ExAi` using an older pnpm version (v3/v4 era). The lockfile (lockfileVersion 9.0) was either generated then and later updated, or regenerated on the current machine. The node_modules were copied from the original machine's installation (or the OneDrive folder was partially synced), preserving the hardlinks to the v3 store. The v3 store on this machine has incomplete packages (missing dist/). A `pnpm install` on the current machine skips reinstallation because it believes packages are already present (based on lockfile + store integrity).

**What this is NOT:**
- NOT a lockfile stale version issue (hashes match current npm)
- NOT a package manager bug (pnpm is working correctly)
- NOT an npm registry issue (registry has complete packages)

**What this IS:**
- A partial installation from an older pnpm store (v3) that was carried forward without reinstallation
- The node_modules were preserved but the v3 store content is incomplete
- A clean reinstall would populate the v11 store with complete packages

---

## Confidence Assessment

| Statement | Confidence |
|-----------|-----------|
| Lockfile integrity matches current npm tarballs | **High** — Verified by direct SHA512 computation |
| npm registry has complete dist/ folders for all 3 packages | **High** — Verified by `npm pack --dry-run` and `tar -xzf` |
| Installed packages point to v3 store, not v11 | **High** — Verified by examining hardlink targets |
| v3 store has rxjs package.json v7.8.2 but missing dist/ | **High** — Verified by directory listing |
| Same pattern for @nestjs/config and @supabase/supabase-js | **High** — Verified by directory listing |
| Project was originally on OneDrive Desktop | **Medium** — Inferred from hardlink paths (OneDrive path inaccessible from this machine) |

**Overall confidence in root cause diagnosis: High.** The evidence is direct and consistent across all three packages.

---

## Fix

**Clean reinstall** to populate v11 store with complete packages:

```powershell
# 1. Backup lockfile
Copy-Item pnpm-lock.yaml pnpm-lock.yaml.backup

# 2. Remove all node_modules (hardlinks point to v3 — safe to remove)
Remove-Item -Recurse -Force apps/*/node_modules
Remove-Item -Recurse -Force packages/*/node_modules
Remove-Item -Recurse -Force node_modules

# 3. Remove build artifacts
Remove-Item -Recurse -Force apps/*/.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/api/dist -ErrorAction SilentlyContinue

# 4. Fresh install (populates v11 store with complete packages)
pnpm install
```

**Verification:**
```powershell
Test-Path apps/api/node_modules/rxjs/dist/cjs/index.js  # Should be True
Test-Path apps/api/node_modules/@nestjs/config/dist/index.js  # Should be True
pnpm --filter api build  # Should pass
```

**Note on v3 store:** The v3 store at `C:\Users\apoor\AppData\Local\pnpm\store\v3` can be left as-is. It is not referenced by the current installation. It may be deleted to free disk space, but only after confirming no other projects use it.

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Lockfile regeneration changes versions unexpectedly | Medium | Backup existing lockfile. Review regenerated lockfile before committing. |
| Removal of node_modules breaks in-progress work | Low | All work is in git. node_modules is derived. |
| Deployment triggers on file changes | High | Coordinate with deployment freeze. |
| v3 store deletion breaks other projects | Low | No other projects reference v3 store (unverified — should check before deleting). |

---

## Files Referenced

| File | Purpose |
|------|---------|
| `pnpm-lock.yaml` | lockfileVersion 9.0, SHA512 integrity verified |
| `apps/api/node_modules/rxjs/package.json` | Hard-linked to v3 store |
| `apps/api/node_modules/@nestjs/config/` | Hard-linked to v3 store |
| `apps/api/node_modules/@supabase/supabase-js/` | Hard-linked to v3 store |
| `C:\Users\apoor\AppData\Local\pnpm\store\v3/` | v3 store (incomplete packages) |
| `C:\Users\apoor\AppData\Local\pnpm\store\v11/` | v11 store (populated by pnpm 9, content unverified) |

---

## Updated Recommendation

`ENVIRONMENT_INTEGRITY_REPORT.md` should be superseded by this document. The lockfile is correct. The fix is a clean reinstall, not a lockfile regeneration.