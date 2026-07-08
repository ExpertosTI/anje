#!/usr/bin/env bash
# Primer despliegue ANJE en Renace — ejecutar EN EL VPS como root
# Uso: curl -fsSL ... | bash   o   ./first-deploy.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ExpertosTI/anje.git}"
PROJECT_DIR="${PROJECT_DIR:-/opt/anje}"
DOMAIN="${DOMAIN:-anje.renace.tech}"

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*" >&2; }

cyan "══════════════════════════════════════════════"
cyan "  ANJE — PRIMER DESPLIEGUE"
cyan "══════════════════════════════════════════════"

if [ ! -d "$PROJECT_DIR" ]; then
  cyan "── Clonando repo ──────────────────────────────"
  git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"
git fetch origin main 2>/dev/null && git reset --hard origin/main 2>/dev/null || true

chmod +x deploy.sh scripts/*.sh 2>/dev/null || true

cyan "── Seed (env + DB) ────────────────────────────"
./scripts/seed.sh

cyan "── Deploy ─────────────────────────────────────"
./deploy.sh

green "✅ Primer despliegue completo: https://${DOMAIN}"
