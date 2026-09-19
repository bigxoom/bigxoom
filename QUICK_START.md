# FATIMA ERP — Quick Start Guide

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Ubuntu Server 22.04 LTS (recommended)
- 2GB RAM minimum, 4GB recommended
- 10GB free disk space

## Installation (Automated)

```bash
# 1. Extract the archive
tar -xzf fatima-erp.tar.gz
cd fatima-erp

# 2. Run the installation script
./install.sh

# The script will:
# - Check Docker installation
# - Create .env from template
# - Build containers
# - Start database and cache
# - Run database migrations
# - Seed demo data (90 rooms, demo users, menus, inventory)
# - Start all services (backend, frontend, proxy)

# 3. Verify installation
./health-check.sh
```

## Access the System

- **Local**: `http://localhost`
- **Remote**: `http://<server-ip>`

## Demo Credentials

```
Username: admin
Password: Fatima@2026
```

⚠️ **SECURITY**: Change all demo passwords before going live.

## Operational Scripts

```bash
# Start services
./start.sh

# Stop services
./stop.sh

# Restart services
./restart.sh

# Health check
./health-check.sh

# Backup database
./backup.sh

# Restore from backup
./restore.sh backups/fatima_erp_YYYYMMDD_HHMMSS.sql.gz
```

## Troubleshooting

### Services not starting?
```bash
docker compose logs -f backend    # Check backend logs
docker compose logs -f frontend   # Check frontend logs
docker compose logs -f db         # Check database logs
```

### Port already in use?
```bash
# Kill existing containers
docker compose down

# Start fresh
./start.sh
```

### Database connection error?
```bash
# Ensure database is ready
docker compose exec -T db pg_isready -U fatima

# Check logs
docker compose logs db
```

## Configuration

Edit `.env` to modify:
- `POSTGRES_PASSWORD` — Database password
- `JWT_SECRET` — Authentication secret
- `POSTGRES_USER` — Database username
- `CORS_ORIGIN` — Allowed origins for API
- `NEXT_PUBLIC_API_URL` — Frontend API endpoint

## Default Demo Accounts

All accounts use password: `Fatima@2026`

| Username | Role | Department |
|----------|------|-----------|
| admin | System Administrator | — |
| manager | General Manager | — |
| reception | Receptionist | Reception |
| cashier | Cashier | Accounts |
| accountant | Accountant | Accounts |
| waiter | Waiter | Restaurant |
| bar | Bar Staff | Bar |
| kitchen | Kitchen Staff | Kitchen |
| housekeeping | Housekeeping | Housekeeping |
| store | Storekeeper | Store |
| maintenance | Maintenance Technician | Maintenance |
| supervisor | Supervisor | — |
| auditor | Auditor | — |

## Features Included

### Core Hospitality Management
- ✅ 90-room management with status tracking
- ✅ Reservation system
- ✅ Check-in/check-out workflow
- ✅ Guest folio and billing

### Point of Sale (POS)
- ✅ Restaurant orders with kitchen display
- ✅ Bar operations
- ✅ Charge-to-room billing
- ✅ Automatic inventory deduction

### Operations
- ✅ Housekeeping task management
- ✅ Maintenance ticket tracking
- ✅ Inventory management with stock control
- ✅ Restaurant/bar menu management with recipes

### Reports
- ✅ Daily revenue reports
- ✅ Occupancy analysis
- ✅ Restaurant/bar sales breakdown
- ✅ Expense tracking
- ✅ Outstanding guest balances
- ✅ Inventory movement history
- ✅ Staff activity logs

### Security
- ✅ Role-based access control (14 roles)
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Full audit trail
- ✅ User activity logging

## Architecture

```
┌─────────────────────────────────────────────┐
│  Web Browser (http://localhost)             │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │  Caddy Proxy (port 80)  │
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────┐          ┌──────▼────┐
│ Frontend │          │  Backend   │
│ Next.js  │          │  NestJS    │
│ (3000)   │          │  (4000)    │
└──────────┘          └──────┬─────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
            ┌───▼──┐    ┌────▼────┐  ┌──▼───┐
            │  DB  │    │  Redis  │  │Uploads
            │ PG16 │    │ v7      │  │
            └──────┘    └─────────┘  └──────┘
```

## File Structure

```
fatima-erp/
├── install.sh           # Automated installation
├── start.sh             # Start services
├── stop.sh              # Stop services
├── restart.sh           # Restart services
├── health-check.sh      # System health check
├── backup.sh            # Database backup
├── restore.sh           # Database restore
├── docker-compose.yml   # Container orchestration
├── .env                 # Environment variables
├── .env.example         # Example environment
├── backend/             # NestJS API
│   ├── src/             # Source code (14 modules)
│   ├── prisma/          # Database schema + migrations + seeds
│   ├── Dockerfile       # Backend container image
│   └── package.json     # Dependencies
├── frontend/            # Next.js Web UI
│   ├── app/             # Pages and routing
│   ├── components/      # React components
│   ├── Dockerfile       # Frontend container image
│   └── package.json     # Dependencies
└── infra/               # Infrastructure config
    └── Caddyfile        # Proxy routing
```

## Technology Stack

- **Backend**: NestJS 10 (Node.js framework)
- **Frontend**: Next.js 14.2 (React framework)
- **Database**: PostgreSQL 16 (data persistence)
- **Cache**: Redis 7 (session + caching)
- **Proxy**: Caddy 2 (reverse proxy + SSL ready)
- **ORM**: Prisma 5 (type-safe database client)
- **Auth**: JWT + Passport (authentication)
- **WebSockets**: Socket.IO (real-time updates)
- **Styling**: Tailwind CSS 3

## Support & Issues

### Common Issues

**Docker not found**: Install Docker from https://docs.docker.com/engine/install/

**Port 80 already in use**: Change in docker-compose.yml:
```yaml
ports:
  - "8080:80"  # Use port 8080 instead
```

**Slow initial build**: First build can take 5-10 minutes. Subsequent builds are faster.

**Database migration failed**: Check database is healthy:
```bash
docker compose logs db
docker compose exec -T db pg_isready
```

## Next Steps

1. **Change default passwords** (`.env` and all demo user passwords in Settings)
2. **Configure your LAN** (see NETWORK_ARCHITECTURE.md)
3. **Set up backups** (add `./backup.sh` to crontab for hourly backups)
4. **Train staff** (See operation guides in repo)
5. **Go live** (backup production data regularly)

---

**System Ready**: All services compiled, tested, and ready to deploy.
