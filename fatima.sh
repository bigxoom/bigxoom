#!/usr/bin/env bash
# Single entry point for day-to-day operation. Thin wrapper around the
# other scripts — no logic lives here that isn't already in one of them.
set -e
cd "$(dirname "$0")"

usage() {
  echo "Usage: ./fatima.sh <command>"
  echo ""
  echo "  start      Start all services            (start.sh)"
  echo "  stop       Stop all services              (stop.sh)"
  echo "  restart    Restart all services           (restart.sh)"
  echo "  status     Show container + service health (health-check.sh)"
  echo "  logs       Tail logs, e.g. ./fatima.sh logs backend (logs.sh)"
  echo "  backup     Back up the database           (backup.sh)"
  echo "  restore    Restore a backup                (restore.sh)"
  echo "  doctor     Diagnose common problems         (doctor.sh)"
  echo "  repair     Attempt to fix common problems   (repair.sh)"
  echo "  install    Full first-time installation     (install.sh)"
  echo ""
}

case "${1:-}" in
  start) ./start.sh ;;
  stop) ./stop.sh ;;
  restart) ./restart.sh ;;
  status|health) ./health-check.sh ;;
  logs) shift; ./logs.sh "$@" ;;
  backup) ./backup.sh ;;
  restore) shift; ./restore.sh "$@" ;;
  doctor) ./doctor.sh ;;
  repair) ./repair.sh ;;
  install) ./install.sh ;;
  *) usage; exit 1 ;;
esac
