#!/usr/bin/env bash
# Aplica schema ANJE en Insforge/PostgreSQL
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_SCHEMA="${ROOT}/insforge/schema.sql"
SQL_SEED="${ROOT}/insforge/seed.sql"

# shellcheck disable=SC1091
source "$ROOT/scripts/lib-insforge.sh"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
warn()  { printf '\033[33m%s\033[0m\n' "$*" >&2; }
red()   { printf '\033[31m%s\033[0m\n' "$*" >&2; }

run_sql() {
  local file="$1"
  docker exec -i "$container" psql -U "$user" -d "$db" < "$file"
}

cyan "── seed-db: tablas ANJE ───────────────────────"

if ! is_vps_with_docker; then
  warn "⚠️  Sin Docker — schema se aplicará en el VPS con deploy"
  exit 0
fi

container="$(resolve_pg_container "${POSTGRES_CONTAINER:-}")"
if [ -z "$container" ]; then
  warn "⚠️  Base de datos no encontrada — omitiendo schema"
  exit 0
fi

if ! container_has_psql "$container"; then
  red "❌ Contenedor sin psql: $container"
  exit 1
fi

if ! creds="$(discover_pg_credentials "$container")"; then
  red "❌ No se pudieron detectar credenciales PostgreSQL."
  exit 1
fi

user="${creds%%|*}"
db="${creds#*|}"

cyan "   Contenedor: $container · DB: $user@$db"

run_sql "$SQL_SCHEMA"
green "   schema.sql aplicado"

if [ -f "$SQL_SEED" ]; then
  run_sql "$SQL_SEED"
  green "   seed.sql aplicado"
fi

restart_postgrest
green "✅ Base de datos ANJE lista"
