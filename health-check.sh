#!/usr/bin/env bash

echo "=== FATIMA ERP Health Check ==="
echo ""
echo "Container Status:"
docker compose ps
echo ""

echo "Service Checks:"
echo ""

# Database
echo -n "PostgreSQL: "
if docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
  echo "✓ Ready"
else
  echo "✗ Not ready"
fi

# Redis
echo -n "Redis: "
if docker compose exec -T redis redis-cli ping &> /dev/null; then
  echo "✓ Ready"
else
  echo "✗ Not ready"
fi

# Backend
echo -n "Backend API: "
if curl -sf http://localhost/api/auth/login -o /dev/null -w "" -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null; then
  echo "✓ Responding"
else
  echo "✗ Unreachable"
fi

# Frontend
echo -n "Frontend: "
if curl -sf http://localhost/ -o /dev/null 2>/dev/null; then
  echo "✓ Responding"
else
  echo "✗ Unreachable"
fi

# Proxy
echo -n "Proxy (Caddy): "
if curl -sf http://localhost/ -o /dev/null -I 2>/dev/null; then
  echo "✓ Responding"
else
  echo "✗ Unreachable"
fi

echo ""
echo "System Resources:"
echo "Disk:"
df -h / | awk 'NR==2 {printf "  Used: %s / %s (%.0f%%)\n", $3, $2, ($3/$2)*100}'
echo "Memory:"
free -h | awk 'NR==2 {printf "  Used: %s / %s\n", $3, $2}'
echo ""

echo "Recent Logs:"
echo "Backend (last 5 lines):"
docker compose logs --tail=5 backend | grep -v "Starting" | tail -3 || echo "  (no logs)"
echo ""

echo "Backup Status:"
LATEST_BACKUP=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  echo "  Latest: $(basename $LATEST_BACKUP)"
  echo "  Size: $(du -h $LATEST_BACKUP | awk '{print $1}')"
else
  echo "  No backups yet (run: ./backup.sh)"
fi
echo ""
