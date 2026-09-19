#!/usr/bin/env bash
# Tail logs for one service or all of them.
# Usage: ./logs.sh [service] [-n LINES]
#   ./logs.sh              -> follow all services
#   ./logs.sh backend      -> follow just the backend
#   ./logs.sh backend -n 200  -> last 200 lines, then follow
set -e

SERVICE=""
TAIL="100"

while [ $# -gt 0 ]; do
  case "$1" in
    -n) TAIL="$2"; shift 2 ;;
    *) SERVICE="$1"; shift ;;
  esac
done

if [ -n "$SERVICE" ]; then
  docker compose logs -f --tail="$TAIL" "$SERVICE"
else
  docker compose logs -f --tail="$TAIL"
fi
