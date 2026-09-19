# CENTRE PASTORAL NOTRE DAME DE FATIMA — Hospitality Management System

An offline-first, LAN-based ERP for a 90-room hospitality facility: reception,
reservations, guest folio, restaurant & bar POS, kitchen display, housekeeping,
maintenance, inventory, accounting and internal staff communication — one
system, one database, one operational truth.

Built by **OfficeHomeTechX Ltd** for Centre Pastoral Notre Dame de Fatima.

## What's in this build (Phase 1–4 foundation)

This package is the working foundation of the full 10-phase system described
in the project brief: authentication + RBAC, the 90-room PMS, guest folio,
restaurant/bar POS with a live Kitchen Display System, housekeeping and
maintenance workflows, basic inventory, internal communication, the audit
trail, and the admin dashboard — end-to-end connected (reservation → check-in
→ folio → POS → kitchen → payment → checkout → room status → housekeeping →
audit log → dashboard), running entirely on your local network.

Not yet wired in this pass: PDF/CSV report exports, the FATIMA PRO+ AI
assistant, and the VLAN/network hardware deployment (documented, not
automatable from here). These are straightforward additions on top of this
foundation — see `NEXT_STEPS.md`.

## Quick start (Ubuntu Server LTS)

```bash
tar -xzf fatima-erp.tar.gz
cd fatima-erp
cp .env.example .env
nano .env                 # set real passwords and JWT_SECRET
./install.sh
```

Then open `http://SERVER-IP` in a browser on the local network.

Demo accounts (password for all: `Fatima@2026` — **change before go-live**):

| Username | Role |
|---|---|
| admin | SUPER_ADMIN |
| manager | GENERAL_MANAGER |
| reception | RECEPTIONIST |
| cashier | CASHIER |
| accountant | ACCOUNTANT |
| waiter | WAITER |
| bar | BAR_STAFF |
| kitchen | KITCHEN_STAFF |
| housekeeping | HOUSEKEEPING |
| store | STOREKEEPER |
| maintenance | MAINTENANCE |
| supervisor | SUPERVISOR |
| auditor | AUDITOR |

## Architecture

```
Internet (optional: backups, updates)
        │
   Firewall / Router
        │
  Core Managed Switch
        │
  Local ERP Server (Docker Compose)
   ├─ PostgreSQL   (single source of truth)
   ├─ Redis
   ├─ Backend API  (NestJS, JWT + RBAC, WebSockets)
   ├─ Frontend     (Next.js, served to every department)
   └─ Caddy        (reverse proxy, port 80)
        │
   Department LAN / VLANs
   Reception · Restaurant · Bar · Kitchen · Housekeeping
   Maintenance · Store · Accounting · Administration
```

Everything runs on the local server. No department needs the internet to
operate. See `NETWORK_ARCHITECTURE.md` for the VLAN plan.

## Stack

Ubuntu Server LTS · Docker Compose · PostgreSQL · Redis · NestJS ·
Next.js/TypeScript · Tailwind CSS · Socket.IO (Kitchen Display) · Caddy.

## Documentation

- `INSTALLATION.md` — full setup, from bare Ubuntu server to running system
- `ADMIN_GUIDE.md`, `RECEPTION_GUIDE.md`, `POS_GUIDE.md`, `KITCHEN_GUIDE.md`
- `BACKUP_RESTORE.md`
- `NETWORK_ARCHITECTURE.md`
- `SECURITY.md`
- `NEXT_STEPS.md` — what's left to reach the full brief

## Currency

All amounts default to RWF.
