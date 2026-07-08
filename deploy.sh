#!/usr/bin/env bash
# ANJEYLEADERS — Despliegue producción (NestJS + React)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ExpertosTI/anje.git}"
PROJECT_DIR="${PROJECT_DIR:-/opt/anje}"
STACK_NAME="${STACK_NAME:-anje}"
DOMAIN="${DOMAIN:-anje.renace.tech}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*" >&2; }
warn()  { printf "\033[33m%s\033[0m\n" "$*" >&2; }

wait_http_ok() {
  local url="$1" tries="${2:-24}" i
  for i in $(seq 1 "$tries"); do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    warn "   esperando… ($i/$tries)"
    sleep 5
  done
  return 1
}

cyan "══════════════════════════════════════════════"
cyan "  ANJE — NestJS + React · $DOMAIN"
cyan "══════════════════════════════════════════════"

cyan "── 1. Repo ────────────────────────────────────"
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch origin "$DEPLOY_BRANCH"
  git reset --hard "origin/$DEPLOY_BRANCH"
else
  git clone -b "$DEPLOY_BRANCH" "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

cyan "── 2. Seed env + DB ───────────────────────────"
bash scripts/seed-env.sh
bash scripts/seed-db.sh || warn "Schema omitido"

cyan "── 3. Build imágenes ──────────────────────────"
docker build -t anje-api:latest ./api
docker build -t anje-web:latest ./web

cyan "── 4. Stack deploy ────────────────────────────"
set -a
[ -f .env ] && source .env
[ -f /root/.anje-credentials.txt ] && source /root/.anje-credentials.txt
set +a
docker stack deploy -c docker-compose.yml "$STACK_NAME"

cyan "── 5. Health ──────────────────────────────────"
wait_http_ok "https://${DOMAIN}/healthz" || { red "Health check falló"; exit 1; }
wait_http_ok "https://${DOMAIN}/api/health" || warn "API health pendiente"

green "✅ https://${DOMAIN}"
green "   Admin:    https://${DOMAIN}/admin"
green "   Vendedor: https://${DOMAIN}/vendedor"
