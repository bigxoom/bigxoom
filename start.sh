#!/usr/bin/env bash
set -e

if ! docker compose up -d; then
  echo "ERROR: Failed to start services"
  exit 1
fi

echo ""
echo "=== FATIMA ERP Starting ==="
echo ""
echo "Waiting for services..."
sleep 3

# Quick check
if docker compose exec -T backend ping -c 1 127.0.0.1 &> /dev/null; then
  echo "✓ Backend is running"
else
  echo "⚠ Backend is starting (may take a moment)"
fi

echo ""
echo "Services:"
docker compose ps --no-trunc
echo ""
echo "Access at: http://localhost"
echo "          http://<SERVER-IP>"
echo ""
