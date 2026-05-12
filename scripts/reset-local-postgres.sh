#!/usr/bin/env bash
# Recreate the local bangsawali PostgreSQL database (all data removed).
# Matches backend/src/main/resources/application.yml by default.
#
# Usage:
#   export PGPASSWORD='your-postgres-password'   # required unless using peer auth
#   ./scripts/reset-local-postgres.sh
#
# Optional overrides: PGHOST PGPORT BANGSAWALI_DB_NAME BANGSAWALI_DB_USER

set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
DB_NAME="${BANGSAWALI_DB_NAME:-bangsawali}"
DB_USER="${BANGSAWALI_DB_USER:-bikashhujdar}"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install PostgreSQL client tools." >&2
  exit 1
fi

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "Set PGPASSWORD to the PostgreSQL password for user ${DB_USER} (see application.yml)." >&2
  exit 1
fi

echo "Terminating connections to ${DB_NAME} (if any)…"
psql -h "$PGHOST" -p "$PGPORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 <<EOF
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
EOF

echo "Dropping database ${DB_NAME}…"
psql -h "$PGHOST" -p "$PGPORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";"

echo "Creating database ${DB_NAME}…"
psql -h "$PGHOST" -p "$PGPORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\";"

echo "Done. Start the backend (cd backend && mvn spring-boot:run). Hibernate will recreate tables; DataSeeder will refill catalog and default users."
