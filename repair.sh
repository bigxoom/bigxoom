#!/usr/bin/env bash
# Attempts to fix the common, safe-to-automate problems doctor.sh finds.
# Never touches data destructively (no DB reset/drop) without an explicit
# --force-rebuild flag, and even that only rebuilds images, not the database.
set -e
cd "$(dirname "$0")"

FORCE_REBUILD=false
for arg in "$@"; do
  [ "$arg" = "--force-rebuild" ] && FORCE_REBUILD=true
done

echo "=== FATIMA ERP Repair ==="
echo ""

if [ ! -f .env ]; then
  echo "-> .env missing: creating from .env.example"
  cp .env.example .env
  echo "   NOTE: default passwords in use — edit .env before going live."
fi

mkdir -p backups
if [ ! -w backups ]; then
  echo "-> backups/ is not writable, fixing permissions"
  chmod u+w backups
fi

echo "-> Ensuring containers exist and are running"
docker compose up -d

echo "-> Waiting for database..."
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
    break
  fi
  sleep 2
done

if ! docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
  echo "-> Database still not reachable after waiting. Logs:"
  docker compose logs --tail=30 db
  exit 1
fi

echo "-> Applying any pending migrations"
docker compose run --rm backend npx prisma migrate deploy || {
  echo "   Migration failed — see backend logs: ./logs.sh backend"
  exit 1
}

echo "-> Restarting any container that isn't healthy"
for svc in backend frontend proxy; do
  RUNNING=$(docker compose ps --status running --services 2>/dev/null | grep -x "$svc" || true)
  if [ -z "$RUNNING" ]; then
    echo "   restarting $svc"
    docker compose up -d "$svc"
  fi
done

if [ "$FORCE_REBUILD" = true ]; then
  echo "-> --force-rebuild given: rebuilding all images from source"
  docker compose build --no-cache
  docker compose up -d
fi

echo ""
echo "Done. Run ./doctor.sh to confirm, or ./health-check.sh for a live status check."
