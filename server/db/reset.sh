#!/usr/bin/env bash
# =============================================================================
# server/db/reset.sh
# Recrea ambas bases y siembra datos. Requiere credenciales con permiso para
# CREATE DATABASE (root o similar) y los .sql en este mismo directorio.
# Uso: bash server/db/reset.sh
# =============================================================================
set -euo pipefail

: "${DB_ROOT_USER:=root}"
: "${DB_ROOT_PASS:=}"
: "${DB_HOST:=127.0.0.1}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "→ Aplicando schema.app.sql"
mysql -h "$DB_HOST" -u "$DB_ROOT_USER" ${DB_ROOT_PASS:+-p"$DB_ROOT_PASS"} < "$DIR/schema.app.sql"

echo "→ Aplicando schema.sandbox.sql"
mysql -h "$DB_HOST" -u "$DB_ROOT_USER" ${DB_ROOT_PASS:+-p"$DB_ROOT_PASS"} < "$DIR/schema.sandbox.sql"

echo "→ Sembrando queryquest_app"
mysql -h "$DB_HOST" -u "$DB_ROOT_USER" ${DB_ROOT_PASS:+-p"$DB_ROOT_PASS"} queryquest_app < "$DIR/seed.app.sql"

echo "→ Sembrando queryquest_sandbox"
mysql -h "$DB_HOST" -u "$DB_ROOT_USER" ${DB_ROOT_PASS:+-p"$DB_ROOT_PASS"} queryquest_sandbox < "$DIR/seed.sandbox.sql"

echo "✔ Bases recreadas y sembradas."