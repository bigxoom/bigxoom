#!/usr/bin/env bash
set -e
mkdir -p backups
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="backups/fatima_erp_${STAMP}.sql.gz"
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-fatima}" "${POSTGRES_DB:-fatima_erp}" | gzip > "$FILE"
echo "Backup written to $FILE"

# Optional encrypted cloud sync — only runs if enabled in .env and internet is available
if [ "$CLOUD_BACKUP_ENABLED" = "true" ] && [ -n "$CLOUD_BACKUP_ENDPOINT" ]; then
  echo "Uploading encrypted backup to cloud endpoint..."
  gpg --batch --yes --passphrase "$CLOUD_BACKUP_KEY" -c "$FILE" 2>/dev/null || echo "gpg not available, skipping encryption step"
  curl -s -X POST -F "file=@${FILE}.gpg" "$CLOUD_BACKUP_ENDPOINT" || echo "Cloud upload failed (internet may be down) — local backup is still safe."
fi
