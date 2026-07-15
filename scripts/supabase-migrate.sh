#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# ExAi (Concourse) — Supabase Migration Runner
# =============================================================================
# Usage:
#   ./scripts/supabase-migrate.sh              # Uses local Supabase
#   ./scripts/supabase-migrate.sh production   # Runs on Supabase Cloud
#
# Prerequisites (production):
#   1. supabase link --project-ref <ref>
#   2. API_DATABASE_URL env var set
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

ENVIRONMENT="${1:-local}"

echo "===== ExAi Supabase Migration ($ENVIRONMENT) ====="

if [ "$ENVIRONMENT" = "production" ]; then
  echo "Linking to Supabase Cloud project..."
  if [ -z "${API_DATABASE_URL:-}" ]; then
    echo "ERROR: API_DATABASE_URL is not set."
    echo "Set it to your Supabase Cloud Postgres connection string."
    exit 1
  fi

  # Run Drizzle migrations directly against the production database
  echo "Running Drizzle migrations..."
  pnpm build --filter @concourse/database...
  API_DATABASE_URL="$API_DATABASE_URL" pnpm db:migrate

  echo "Migrations complete. Verifying..."
  API_DATABASE_URL="$API_DATABASE_URL" pnpm db:seed

else
  echo "Using local Supabase (supabase start)..."
  if ! supabase status &>/dev/null; then
    echo "Starting local Supabase..."
    pnpm supabase:start
  fi

  echo "Running Drizzle migrations locally..."
  pnpm build --filter @concourse/database...
  pnpm db:migrate

  echo "Running seed data..."
  pnpm db:seed
fi

echo "===== Migrations complete ====="
