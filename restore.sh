#!/usr/bin/env bash
set -e
if [ -z "$1" ]; then
  echo "Usage: ./restore.sh backups/fatima_erp_YYYYMMDD_HHMMSS.sql.gz"
  exit 1
fi
echo "WARNING: this will overwrite the current database. Press Ctrl+C to cancel, Enter to continue."
read _
gunzip -c "$1" | docker compose exec -T db psql -U "${POSTGRES_USER:-fatima}" "${POSTGRES_DB:-fatima_erp}"
echo "Restore complete."
