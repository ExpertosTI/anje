#!/usr/bin/env bash
# Genera .env automáticamente para ANJEYLEADERS
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"
API_ENV="${ROOT}/api/.env"
CRED_FILE="${CRED_FILE:-/root/.anje-credentials.txt}"
GEMINI_LOCAL="${ROOT}/api/.gemini.local"

# shellcheck disable=SC1091
source "$ROOT/scripts/lib-insforge.sh"
# shellcheck disable=SC1091
source "$ROOT/scripts/seed.defaults.sh"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
warn()  { printf '\033[33m%s\033[0m\n' "$*" >&2; }

cyan "── seed-env: ANJE ─────────────────────────────"

touch "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true
normalize_env_file "$ENV_FILE"

upsert_env "ADMIN_PIN" "$SEED_ADMIN_PIN" "$ENV_FILE"
upsert_env "PUBLIC_ADMIN_PIN" "$SEED_ADMIN_PIN" "$ENV_FILE"
upsert_env "PUBLIC_BUILD_ID" "$(date +%Y%m%d%H%M)" "$ENV_FILE"

# DB (VPS: insforge_postgres en RenaceNet)
if is_vps_with_docker; then
  upsert_env "DB_HOST" "insforge_postgres" "$ENV_FILE"
  pg="$(resolve_pg_container)"
  if [ -n "$pg" ]; then
    creds="$(discover_pg_credentials "$pg" 2>/dev/null || true)"
    if [ -n "$creds" ]; then
      upsert_env "DB_USER" "${creds%%|*}" "$ENV_FILE"
      upsert_env "DB_NAME" "${creds#*|}" "$ENV_FILE"
    fi
    pg_pass=""
    for key in POSTGRES_PASSWORD PGPASSWORD POSTGRES_PASS; do
      pg_pass="$(docker_env "$pg" "$key")"
      [ -n "$pg_pass" ] && break
    done
    if [ -n "$pg_pass" ]; then
      upsert_env "DB_PASS" "$pg_pass" "$ENV_FILE"
    elif [ -f "$CRED_FILE" ]; then
      pg_pass="$(grep '^DB_PASS=' "$CRED_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true)"
      [ -n "$pg_pass" ] && upsert_env "DB_PASS" "$pg_pass" "$ENV_FILE"
    fi
  fi
  green "   PostgreSQL Renace detectado"
else
  upsert_env "DB_HOST" "localhost" "$ENV_FILE"
  upsert_env "DB_USER" "postgres" "$ENV_FILE"
  upsert_env "DB_NAME" "insforge" "$ENV_FILE"
fi
upsert_env "DB_PORT" "5432" "$ENV_FILE"

# Gemini — clave SOLO desde .gemini.local o credenciales VPS (nunca en git)
GEMINI_KEY=""
if [ -f "$GEMINI_LOCAL" ]; then
  GEMINI_KEY="$(tr -d '\r\n' < "$GEMINI_LOCAL")"
elif [ -f "$CRED_FILE" ]; then
  GEMINI_KEY="$(grep '^GEMINI_API_KEY=' "$CRED_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true)"
fi
if [ -n "$GEMINI_KEY" ]; then
  upsert_env "GEMINI_API_KEY" "$GEMINI_KEY" "$ENV_FILE"
  upsert_env "GEMINI_MODEL" "${SEED_GEMINI_MODEL:-gemini-2.5-flash}" "$ENV_FILE"
  green "   Gemini: configurado (${#GEMINI_KEY} chars)"
else
  warn "   Gemini: sin clave — guía offline"
fi

# api/.env para desarrollo local NestJS
touch "$API_ENV"
chmod 600 "$API_ENV" 2>/dev/null || true
grep -v '^GEMINI_API_KEY=' "$API_ENV" 2>/dev/null > "${API_ENV}.tmp" || true
mv "${API_ENV}.tmp" "$API_ENV" 2>/dev/null || true
if [ -n "$GEMINI_KEY" ]; then
  echo "GEMINI_API_KEY=$GEMINI_KEY" >> "$API_ENV"
  echo "GEMINI_MODEL=${SEED_GEMINI_MODEL:-gemini-2.5-flash}" >> "$API_ENV"
fi

green "✅ .env generado"
green "   Admin PIN: $SEED_ADMIN_PIN"
green "   ANJE Guide: $([ -n "$GEMINI_KEY" ] && echo 'Gemini IA' || echo 'modo offline')"
green "   https://anje.renace.tech"
