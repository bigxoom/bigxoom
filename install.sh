#!/usr/bin/env bash
set -e

echo "=== CENTRE PASTORAL NOTRE DAME DE FATIMA — ERP Installation ==="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker is not installed or not in PATH"
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "ERROR: Docker Compose is not installed"
  exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "NOTE: .env created with default passwords. CHANGE THEM before deployment:"
  echo "  - POSTGRES_PASSWORD"
  echo "  - JWT_SECRET"
  echo ""
fi

# Kill existing containers on ports if they exist
echo "Checking for existing services..."
docker compose down 2>/dev/null || true
sleep 1

echo "Building containers (this may take a few minutes)..."
docker compose build --no-cache

echo "Starting database and cache..."
docker compose up -d db redis

echo "Waiting for database to be ready..."
for i in {1..30}; do
  if docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
    echo "Database is ready!"
    break
  fi
  echo -n "."
  sleep 2
done

if ! docker compose exec -T db pg_isready -U "${POSTGRES_USER:-fatima}" &> /dev/null; then
  echo ""
  echo "ERROR: Database failed to start"
  docker compose logs db
  exit 1
fi

echo ""
echo "Running database migrations..."
if ! docker compose run --rm backend npx prisma migrate deploy; then
  echo "ERROR: Database migration failed"
  docker compose logs backend
  exit 1
fi

echo "Seeding demo data (90 rooms, demo users, menu, inventory)..."
if ! docker compose run --rm backend npx ts-node prisma/seed.ts; then
  echo "ERROR: Seed data failed to load"
  docker compose logs backend
  exit 1
fi

echo "Starting all services..."
docker compose up -d

echo "Waiting for services to start..."
sleep 5

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Services running:"
docker compose ps
echo ""
echo "Access the system:"
echo "  Local:  http://localhost"
echo "  Remote: http://<SERVER-IP>"
echo ""
echo "Demo Credentials:"
echo "  Username: admin"
echo "  Password: Fatima@2026"
echo ""
echo "⚠️  SECURITY: Change all demo passwords before going live"
echo ""
echo "Useful commands:"
echo "  ./start.sh              - Start all services"
echo "  ./stop.sh               - Stop all services"
echo "  ./health-check.sh       - Check system health"
echo "  ./backup.sh             - Backup database"
echo ""
