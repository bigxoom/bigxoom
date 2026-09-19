#!/usr/bin/env bash
# Read-only diagnostics. Does not change anything — see repair.sh for fixes.
set -u
cd "$(dirname "$0")"

PASS=0
WARN=0
FAIL=0
pass() { echo "  OK   $1"; PASS=$((PASS+1)); }
warn() { echo "  WARN $1"; WARN=$((WARN+1)); }
fail() { echo "  FAIL $1"; FAIL=$((FAIL+1)); }

echo "=== FATIMA ERP Doctor ==="
echo ""

echo "Environment:"
if ! command -v docker &> /dev/null; then
  fail "docker is not installed or not in PATH"
else
  pass "docker installed ($(docker --version | cut -d, -f1))"
fi
if ! docker compose version &> /dev/null; then
  fail "docker compose plugin not available"
else
  pass "docker compose available"
fi

if [ ! -f .env ]; then
  fail ".env is missing — run ./install.sh or: cp .env.example .env"
else
  pass ".env exists"
  if grep -q "change_this_strong_password" .env 2>/dev/null; then
    warn "POSTGRES_PASSWORD is still the default placeholder — change it before going live"
  fi
  if grep -q "change_this_to_a_long_random_string" .env 2>/dev/null; then
    warn "JWT_SECRET is still the default placeholder — change it before going live"
  fi
fi
echo ""

echo "Containers:"
for svc in db redis backend frontend proxy; do
  STATE=$(docker compose ps --status running --services 2>/dev/null | grep -x "$svc" || true)
  if [ -n "$STATE" ]; then
    pass "$svc is running"
  else
    EXISTS=$(docker compose ps -a --services 2>/dev/null | grep -x "$svc" || true)
    if [ -n "$EXISTS" ]; then
      fail "$svc exists but is not running — check: ./logs.sh $svc"
    else
      warn "$svc has not been created yet — run ./install.sh or ./start.sh"
    fi
  fi
done
echo ""

echo "Database:"
if docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
  pass "PostgreSQL accepting connections"
  MIGSTATUS=$(docker compose exec -T backend npx prisma migrate status 2>&1 || true)
  if echo "$MIGSTATUS" | grep -qi "up to date"; then
    pass "Prisma migrations up to date"
  elif echo "$MIGSTATUS" | grep -qi "have not yet been applied\|failed"; then
    fail "Pending or failed migrations — run: docker compose run --rm backend npx prisma migrate deploy"
  else
    warn "Could not determine migration status (is the backend container running?)"
  fi
else
  fail "PostgreSQL is not reachable"
fi
echo ""

echo "Ports (host):"
for p in 80 4000 3000 5432; do
  if command -v ss &> /dev/null; then
    LISTENER=$(ss -tlnp 2>/dev/null | grep -c ":$p ") || true
  else
    LISTENER=$(netstat -tln 2>/dev/null | grep -c ":$p ") || true
  fi
  if [ "${LISTENER:-0}" -gt 0 ]; then
    pass "port $p is listening"
  else
    warn "port $p has nothing listening (expected once services are up)"
  fi
done
echo ""

echo "Disk:"
AVAIL_KB=$(df -P / | awk 'NR==2 {print $4}')
AVAIL_GB=$((AVAIL_KB / 1024 / 1024))
if [ "$AVAIL_GB" -lt 2 ]; then
  fail "less than 2GB free disk space (${AVAIL_GB}GB) — backups and DB growth will fail"
else
  pass "${AVAIL_GB}GB free disk space"
fi
echo ""

echo "Backups:"
LATEST_BACKUP=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  pass "latest backup: $(basename "$LATEST_BACKUP")"
else
  warn "no backups yet — run ./backup.sh"
fi
echo ""

echo "=== Summary: $PASS OK, $WARN warning(s), $FAIL failure(s) ==="
if [ "$FAIL" -gt 0 ]; then
  echo "Run ./repair.sh to attempt automatic fixes, or ./logs.sh <service> to investigate."
  exit 1
fi
