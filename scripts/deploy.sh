#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# ExAi (Concourse) — [LEGACY] AWS Deployment Orchestrator
# =============================================================================
# Use this script ONLY for the AWS / ECS Fargate enterprise path. The
# recommended Phase-5 stack is Vercel + Supabase Cloud + Railway/Render
# (see DEPLOYMENT.md). For that stack use DEPLOY_RUNBOOK.md instead.
#
# Usage (legacy AWS only):
#   ./scripts/deploy.sh all            # Deploy everything (API + Worker + Web)
#   ./scripts/deploy.sh api            # Deploy API only
#   ./scripts/deploy.sh worker         # Deploy Worker only
#   ./scripts/deploy.sh web            # Deploy Web to Vercel
#   ./scripts/deploy.sh infra          # Provision/update Terraform infra
#   ./scripts/deploy.sh migrate        # Run database migrations
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

require_aws_profile() {
  if ! aws sts get-caller-identity &>/dev/null; then
    error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
  fi
}

require_env() {
  local var_name="$1"
  if [ -z "${!var_name:-}" ]; then
    error "$var_name is not set. Export it or add to .env.production"
    exit 1
  fi
}

deploy_infra() {
  info "Deploying Terraform infrastructure..."
  cd "$PROJECT_ROOT/infra/environments/production"
  terraform init
  terraform apply -auto-approve
  cd "$PROJECT_ROOT"
  info "Infrastructure deployed successfully."
}

deploy_api() {
  info "Deploying API..."
  require_aws_profile

  local ecr_repo="${ECR_REPO:-concourse-api}"
  local tag="${CIRCLE_SHA1:-$(git rev-parse HEAD)}"
  local ecr_registry="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION:-us-east-1}.amazonaws.com"

  aws ecr get-login-password --region "${AWS_REGION:-us-east-1}" | \
    docker login --username AWS --password-stdin "$ecr_registry"

  info "Building API image..."
  docker build -t "$ecr_repo:$tag" \
    -t "$ecr_repo:latest" \
    -f "$PROJECT_ROOT/apps/api/Dockerfile" "$PROJECT_ROOT"

  info "Pushing API image..."
  docker tag "$ecr_repo:$tag" "$ecr_registry/$ecr_repo:$tag"
  docker tag "$ecr_repo:latest" "$ecr_registry/$ecr_repo:latest"
  docker push "$ecr_registry/$ecr_repo:$tag"
  docker push "$ecr_registry/$ecr_repo:latest"

  info "Updating ECS service..."
  aws ecs update-service \
    --cluster "concourse-production" \
    --service "concourse-production-api" \
    --force-new-deployment \
    --region "${AWS_REGION:-us-east-1}"

  info "API deployed successfully. Waiting for service stability..."
  aws ecs wait services-stable \
    --cluster "concourse-production" \
    --services "concourse-production-api" \
    --region "${AWS_REGION:-us-east-1}"
  info "API is stable."
}

deploy_worker() {
  info "Deploying Worker..."
  require_aws_profile

  local ecr_repo="${ECR_REPO:-concourse-worker}"
  local tag="${CIRCLE_SHA1:-$(git rev-parse HEAD)}"
  local ecr_registry="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION:-us-east-1}.amazonaws.com"

  aws ecr get-login-password --region "${AWS_REGION:-us-east-1}" | \
    docker login --username AWS --password-stdin "$ecr_registry"

  info "Building Worker image..."
  docker build -t "$ecr_repo:$tag" \
    -t "$ecr_repo:latest" \
    -f "$PROJECT_ROOT/apps/worker/Dockerfile" "$PROJECT_ROOT"

  info "Pushing Worker image..."
  docker tag "$ecr_repo:$tag" "$ecr_registry/$ecr_repo:$tag"
  docker tag "$ecr_repo:latest" "$ecr_registry/$ecr_repo:latest"
  docker push "$ecr_registry/$ecr_repo:$tag"
  docker push "$ecr_registry/$ecr_repo:latest"

  info "Updating ECS service..."
  aws ecs update-service \
    --cluster "concourse-production" \
    --service "concourse-production-worker" \
    --force-new-deployment \
    --region "${AWS_REGION:-us-east-1}"

  aws ecs wait services-stable \
    --cluster "concourse-production" \
    --services "concourse-production-worker" \
    --region "${AWS_REGION:-us-east-1}"
  info "Worker is stable."
}

deploy_web() {
  info "Deploying Web to Vercel..."
  require_env "VERCEL_TOKEN"
  require_env "VERCEL_ORG_ID"
  require_env "VERCEL_PROJECT_ID"

  cd "$PROJECT_ROOT/apps/web"
  npx vercel deploy --prod \
    --token "$VERCEL_TOKEN" \
    -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
    -e NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
  cd "$PROJECT_ROOT"
  info "Web deployed successfully."
}

run_migrations() {
  info "Running database migrations..."
  require_env "API_DATABASE_URL"
  cd "$PROJECT_ROOT"
  pnpm install --frozen-lockfile
  pnpm build --filter @concourse/database...
  pnpm db:migrate
  info "Migrations complete."
}

seed_database() {
  info "Seeding database..."
  require_env "API_DATABASE_URL"
  cd "$PROJECT_ROOT"
  pnpm build --filter @concourse/database...
  pnpm db:seed
  info "Seed complete."
}

case "${1:-help}" in
  all)
    deploy_infra
    run_migrations
    deploy_api &
    deploy_worker &
    wait
    deploy_web
    info "All services deployed."
    ;;
  infra)
    deploy_infra
    ;;
  api)
    deploy_api
    ;;
  worker)
    deploy_worker
    ;;
  web)
    deploy_web
    ;;
  migrate)
    run_migrations
    ;;
  seed)
    seed_database
    ;;
  help|*)
    echo "Usage: $0 {all|api|worker|web|infra|migrate|seed}"
    exit 0
    ;;
esac
