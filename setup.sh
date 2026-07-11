#!/usr/bin/env bash
#
# setup.sh — fresh macOS developer machine setup for ExAi.
#
# Installs the tooling docs/PROJECT_STATE.md §8/§9 lists as required:
# Homebrew, Git, Node.js 22 (per .nvmrc / package.json engines.node),
# pnpm 9.15.0 (per package.json packageManager), Docker Desktop,
# Supabase CLI, and the VS Code extensions already recommended in
# .vscode/extensions.json.
#
# This script only installs tooling. It does not run `pnpm install`,
# start any service, or touch application code/config — see
# docs/PROJECT_STATE.md §9 for the setup steps that come after this.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh

set -euo pipefail

NODE_VERSION="22"
PNPM_VERSION="9.15.0"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\n\033[1;33m!!\033[0m %s\n' "$1"; }

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "setup.sh is written for macOS only. Aborting." >&2
  exit 1
fi

# ── 1. Homebrew ──────────────────────────────────────────────────────

log "Checking for Homebrew..."
if ! command -v brew >/dev/null 2>&1; then
  log "Homebrew not found — installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Apple Silicon Homebrew installs to /opt/homebrew, not /usr/local;
  # put it on PATH for the rest of this script and future shells.
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    if [[ -f "${HOME}/.zprofile" ]] && ! grep -q "brew shellenv" "${HOME}/.zprofile" 2>/dev/null; then
      echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "${HOME}/.zprofile"
    fi
  fi
else
  log "Homebrew already installed ($(brew --version | head -1))."
fi

brew update

# ── 2. Git ────────────────────────────────────────────────────────────

log "Checking for Git..."
if ! command -v git >/dev/null 2>&1; then
  log "Installing Git..."
  brew install git
else
  log "Git already installed ($(git --version))."
fi

# ── 3. Node.js LTS (pinned to the major version .nvmrc requires) ────

log "Checking for Node.js ${NODE_VERSION}..."
if command -v node >/dev/null 2>&1 && [[ "$(node -v)" == v${NODE_VERSION}.* ]]; then
  log "Node.js ${NODE_VERSION}.x already installed ($(node -v))."
else
  log "Installing Node.js ${NODE_VERSION} via Homebrew (node@${NODE_VERSION})..."
  brew install node@${NODE_VERSION}
  brew link --overwrite --force node@${NODE_VERSION}
fi

# ── 4. pnpm (pinned to the version package.json's packageManager field expects) ─

log "Checking for pnpm ${PNPM_VERSION}..."
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@${PNPM_VERSION} --activate
elif command -v pnpm >/dev/null 2>&1; then
  log "corepack unavailable; pnpm already present ($(pnpm --version)). Verify it matches ${PNPM_VERSION}."
else
  log "corepack unavailable; installing pnpm ${PNPM_VERSION} via Homebrew..."
  brew install pnpm
fi

# ── 5. Docker Desktop ─────────────────────────────────────────────────

log "Checking for Docker..."
if command -v docker >/dev/null 2>&1; then
  log "Docker already installed ($(docker --version))."
else
  log "Attempting Docker Desktop install via Homebrew Cask..."
  if brew install --cask docker; then
    warn "Docker Desktop installed. Open it once from /Applications to finish setup and accept its license — the CLI stays unavailable until the app has launched at least once."
  else
    warn "Automated Docker Desktop install failed or requires interactive confirmation."
    cat <<'EOF'

  Manual installation required:
    1. Visit https://www.docker.com/products/docker-desktop/
    2. Download Docker Desktop for Mac (choose Apple Silicon or Intel
       as appropriate for this machine).
    3. Open the downloaded .dmg and drag Docker to Applications.
    4. Launch Docker Desktop from /Applications and complete its
       first-run setup.
    5. Re-run this script, or verify manually with: docker --version

EOF
  fi
fi

# ── 6. Supabase CLI ───────────────────────────────────────────────────

log "Checking for Supabase CLI..."
if command -v supabase >/dev/null 2>&1; then
  log "Supabase CLI already installed ($(supabase --version))."
else
  log "Installing Supabase CLI via Homebrew..."
  brew install supabase/tap/supabase
fi

# ── 7. VS Code extensions (per .vscode/extensions.json) ──────────────

log "Checking for VS Code CLI (code)..."
if command -v code >/dev/null 2>&1; then
  log "Installing recommended VS Code extensions..."
  code --install-extension esbenp.prettier-vscode
  code --install-extension dbaeumer.vscode-eslint
  code --install-extension bradlc.vscode-tailwindcss
  code --install-extension prisma.prisma
  code --install-extension orta.vscode-jest
  code --install-extension ms-playwright.playwright
  code --install-extension editorconfig.editorconfig
else
  warn "VS Code 'code' CLI not found on PATH — skipping extension install."
  cat <<'EOF'

  To install VS Code and its shell command:
    1. Visit https://code.visualstudio.com/ and install VS Code
       (or: brew install --cask visual-studio-code)
    2. In VS Code: Cmd+Shift+P -> "Shell Command: Install 'code'
       command in PATH"
    3. Re-run this script, or install the recommended extensions
       manually from .vscode/extensions.json.

EOF
fi

# ── Summary ────────────────────────────────────────────────────────────

log "Tooling setup complete. Versions installed:"
command -v git >/dev/null 2>&1 && git --version || true
command -v node >/dev/null 2>&1 && node --version || true
command -v pnpm >/dev/null 2>&1 && pnpm --version || true
command -v docker >/dev/null 2>&1 && docker --version || echo "docker: not yet available (see instructions above)"
command -v supabase >/dev/null 2>&1 && supabase --version || true

cat <<'EOF'

Next steps (see docs/PROJECT_STATE.md §9 for the full sequence):
  1. cp .env.example .env.local.reference   # reference only; do not commit
     then populate apps/web/.env.local, apps/api/.env, apps/worker/.env
  2. pnpm install
  3. docker compose up -d      # Redis
  4. supabase start            # Postgres+pgvector, Auth, Storage, Realtime, Studio
  5. pnpm --filter database migrate

EOF
