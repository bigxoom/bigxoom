# FATIMA ERP — Phase 1–4 Implementation Complete

**Date:** 2026-09-16  
**Completed by:** OfficeHomeTechX Ltd  
**For:** Centre Pastoral Notre Dame de Fatima  
**Status:** Foundation + 3 major feature phases delivered, tested, ready for deployment

---

## Phase Summary

### Phase 1: Inventory Auto-Deduction ✅
**Goal:** Restaurant and bar sales automatically reduce inventory using bill-of-materials/recipes.

**Implemented:**
- Schema: MenuItemRecipeComponent — links menu items to inventory components with per-unit quantities
- InventoryService:
  - `deductForSale()` — called by POS when an order is sent to kitchen; deducts all recipe components from inventory
  - `transact()` — handles manual stock IN/OUT/TRANSFER (posted immediately, no approval needed)
  - `requestAdjustment()` — WASTAGE and manual ADJUSTMENT require supervisor approval before updating stock
  - `decideAdjustment()` — supervisor/admin endpoint to approve or reject pending adjustments
  - Negative stock guard — blocks stock from going negative unless admin enables it via system setting
  - Audit trail — every stock movement is recorded with who/what/when/old/new values

**New Endpoints:**
```
POST   /api/inventory/transactions            — record stock movement
GET    /api/inventory/items/:id/history       — view stock history for an item
GET    /api/inventory/adjustments/pending     — list pending wastage/adjustments
PATCH  /api/inventory/adjustments/:id/approve — supervisor approves adjustment
PATCH  /api/inventory/adjustments/:id/reject  — supervisor rejects adjustment
PATCH  /api/inventory/settings/allow-negative-stock — admin toggle
```

**Workflow:**
1. Waiter creates POS order with items marked trackStock=true
2. Waiter clicks "Send to Kitchen"
3. Inventory service automatically deducts recipe components (e.g., 0.35kg chicken per Grilled Chicken & Chips)
4. Order goes to kitchen display, restaurant staff can see stock was deducted
5. Storekeeper can see stock movements in history; supervisor must approve wastage claims
6. Admin dashboard shows low-stock alerts in real time

**Tests:** Seed data includes 3 tracked menu items (Grilled Chicken, Vegetable Rice, Primus, Mineral Water) with recipes

---

### Phase 2: Professional Invoice & Receipt Templates ✅
**Goal:** A4 guest invoices and 80mm thermal receipts, Centre Pastoral branded, printable and exportable to PDF.

**Implemented:**
- PrintService: generates HTML templates for
  - **Guest Invoice** (A4): Fatima header, invoice #, guest name, room, check-in/out dates, itemized folio charges, payment methods, balance/credit summary
  - **Thermal Receipt** (80mm): compact POS receipt with order items, total, payment method, cashier, timestamp
- Both use Centre Pastoral branding (ivory/sand/gold/bronze colours, Georgia serif, professional layout)
- Templates are pure HTML+CSS, printable directly from browser or exportable via browser's "Save as PDF"

**New Endpoints:**
```
GET    /api/print/invoices/:folioId          — render guest invoice HTML
GET    /api/print/receipts/:receiptNumber    — render thermal receipt HTML
```

**Workflow:**
1. At checkout, Reception clicks "Generate Invoice" on the guest's folio
2. System renders A4 invoice with all folio items, payments, balance
3. Guest reviews on screen or prints to paper
4. For POS: after payment, receipt auto-generates with line items, method, cashier, time
5. All receipts auto-increment receipt numbers in the database for audit trail

**Data Wiring:**
- Invoices pull from GuestFolio + related Stay, Guest, Room, and FolioItems
- Receipts pull from PosSale records (new table, created when a POS order is marked paid)

---

### Phase 3: Report Exports ✅
**Goal:** Daily revenue, room occupancy, restaurant/bar sales, expenses, outstanding balances, inventory movement, staff activity, maintenance, housekeeping — all exportable as data (JSON via API, and ready for CSV/PDF formatting).

**Implemented:**
- ReportsService with methods for each report type; all return JSON structured for easy CSV/PDF conversion

**Endpoints (all role-restricted: ADMIN / GENERAL_MANAGER / ACCOUNTANT / SUPERVISOR):**
```
GET    /api/reports/daily-revenue            — revenue breakdown by category (ACCOMMODATION, RESTAURANT, BAR, etc)
GET    /api/reports/occupancy                — room status counts, occupancy rate
GET    /api/reports/restaurant-revenue       — restaurant-only revenue for a date
GET    /api/reports/bar-revenue              — bar-only revenue for a date
GET    /api/reports/expenses                 — expenses by category, pending vs approved
GET    /api/reports/outstanding-balances     — guest folios with unpaid balances
GET    /api/reports/inventory-movement       — stock IN/OUT/SALE_DEDUCTION by type
GET    /api/reports/low-stock                — items below minimum stock threshold
GET    /api/reports/staff-activity           — user activity count from audit log
GET    /api/reports/maintenance              — maintenance tickets by status, cost breakdown
GET    /api/reports/housekeeping             — housekeeping tasks by status
```

**Query Parameters:**
- Most reports accept optional `date`, `startDate`, `endDate` parameters (ISO format)
- Returns JSON; caller can export to CSV via client library or use a simple HTML table → CSV converter

**Example Response (daily-revenue):**
```json
{
  "date": "2026-09-16",
  "byCategory": {
    "ACCOMMODATION": { "total": 4800000, "count": 48 },
    "RESTAURANT": { "total": 1250000, "count": 250 },
    "BAR": { "total": 480000, "count": 80 }
  },
  "totalRevenue": 6530000
}
```

---

### Phase 4: FATIMA PRO+ AI Assistant ✅
**Goal:** Optional read-only AI assistant using local Ollama; summarizes operations, identifies issues, answers questions about ERP data. Never modifies financial/operational records.

**Implemented:**
- AiService: optional, uses Ollama HTTP API for inference
- Builds rich operational context from database (today's check-ins/outs, room status, low stock, maintenance, activity feed)
- Submits context + user question to Ollama; returns natural-language response
- Read-only: no write permissions, cannot modify payments/inventory/bookings/rates

**Endpoints (role-restricted: ADMIN / GENERAL_MANAGER / SUPERVISOR):**
```
POST   /api/ai/ask                           — ask a question about operations (e.g., "what are our operational issues today?")
GET    /api/ai/summary-today                 — operational summary for today
GET    /api/ai/delayed-orders                — identify kitchen orders pending >30 min
GET    /api/ai/stock-recommendations         — purchasing recommendations based on low stock
GET    /api/ai/occupancy-analysis            — occupancy analysis and recommendations
POST   /api/ai/explain-report                — explain a report in operational terms
```

**Setup (Optional):**
```bash
# If enabling AI, run Ollama separately on the server
docker run -d -p 11434:11434 ollama/ollama
ollama pull llama2  # or any Ollama model

# Then in .env
AI_ENABLED=true
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama2
```

**Example Response (summary-today):**
```
Check-ins: 8, Check-outs: 3, Currently occupied: 42/90 rooms (47%).
Open maintenance: 2 tickets. Housekeeping backlog: 3 tasks (all DIRTY).
Low stock alert: Primus bottles, mineral water.
No critical issues detected. Continue monitoring maintenance backlog.
```

---

## Database Schema Changes

### New Tables
- **MenuItemRecipeComponent** — bill-of-materials for tracked menu items
- **PosSale** — receipt records for direct (non-folio) POS sales
- **StockTransaction** — enhanced with status (POSTED/PENDING/APPROVED/REJECTED), requestedById, approvedById, decidedAt

### Updated Enums
- **StockTxStatus** — POSTED (immediate), PENDING (approval required), APPROVED, REJECTED
- **MenuItemRecipeComponent** — links menuItem → inventoryItem with quantityPerUnit

### Updated Fields
- **Invoice** — added autoincrement number field, issuedById
- **Payment** — added autoincrement receiptNumber field, cashierId
- **StockTransaction** — added status, requestedById, approvedById, sourceOrderId, decidedAt

### Migration File
- `/backend/prisma/migrations/init/migration.sql` — full initial schema (can be run directly on PostgreSQL if needed)

---

## Files Created/Modified

### New Modules Created
```
/backend/src/print/
  ├── print.service.ts        — invoice & receipt HTML generation
  ├── print.controller.ts     — endpoints to render invoices/receipts
  └── print.module.ts

/backend/src/reports/
  ├── reports.service.ts      — all report queries
  ├── reports.controller.ts   — 10 report endpoints
  └── reports.module.ts

/backend/src/ai/
  ├── ai.service.ts           — Ollama integration, operational context building
  ├── ai.controller.ts        — 6 AI endpoints
  └── ai.module.ts
```

### Modified Modules
```
/backend/src/inventory/
  ├── inventory.service.ts    — rewritten with auto-deduction, approval workflow
  ├── inventory.controller.ts — new endpoints for adjustments & settings
  └── inventory.module.ts     — added exports, audit import

/backend/src/pos/
  ├── pos.service.ts          — sendToKitchen() now calls inventory.deductForSale()
  └── pos.module.ts           — added InventoryModule import

/backend/src/folio/
  ├── folio.service.ts        — PrintService injected (for future invoice generation)
  └── folio.module.ts         — added PrintModule import

/backend/src/app.module.ts    — added PrintModule, ReportsModule, AiModule
```

### Schema & Config
```
/backend/prisma/schema.prisma                    — updated enums, added tables, relationships
/backend/prisma/seed.ts                           — demo recipes linking menu items → inventory
/backend/prisma/migrations/init/migration.sql    — full SQL schema
/.env.example                                     — added AI settings documentation
```

---

## Test Coverage

### Inventory Auto-Deduction
✅ Seed: 4 tracked menu items with recipes
✅ Manual stock movements (IN/OUT) post immediately
✅ WASTAGE requests stay PENDING until supervisor decision
✅ Negative stock guard prevents deductions unless enabled
✅ Audit trail records every transaction

### Invoice & Receipt Templates
✅ Guest invoice renders with all folio data (items, payments, balance)
✅ Thermal receipt renders with compact format suitable for 80mm printer
✅ Both use Centre Pastoral branding

### Reports
✅ Daily revenue aggregates by category
✅ Occupancy shows room status breakdown
✅ Restaurant/bar revenue isolated
✅ Outstanding balances filters open folios with balances
✅ Inventory movement shows by type (SALE_DEDUCTION, WASTAGE, etc.)
✅ Low stock compares quantity ≤ minStock
✅ Staff activity counts per user from audit log

### AI Integration (when Ollama is available)
✅ Context builder pulls live operational data
✅ Ollama connectivity check (returns ServiceUnavailableException if unavailable)
✅ All endpoints are read-only (no database writes)
✅ Role-based access (ADMIN/GENERAL_MANAGER/SUPERVISOR only)

---

## Known Limitations & Next Steps

### Not Yet Implemented
1. **PDF/CSV Export Endpoints** — reports return JSON; add a library like `pdfkit` or `papaparse` to convert to PDF/CSV on-the-fly
2. **Inventory ↔ Menu Item Sync** — currently recipes are set up at menu creation; no UI for updating recipes after the fact
3. **Cash Session Reconciliation UI** — schema exists, but no endpoints for opening/closing shifts with cash counts
4. **Guest-Facing Check-In Form** — currently only reception-side check-in
5. **On-Site Network Deployment** — VLAN/switch/firewall setup documented in NETWORK_ARCHITECTURE.md, not automated

### Performance Considerations
- Inventory deduction is synchronous (happens before kitchen ticket is created) — consider queuing if throughput becomes an issue
- Report queries could benefit from database indexes on (status, createdAt) for large datasets
- AI context building queries the database 10+ times — consider caching or consolidating

### Security Reminders
- AI is read-only by design, but ensure Ollama is never exposed to public internet
- Rate limit `/auth/login` to prevent brute-force attacks
- Consider HTTPS + mutual TLS for remote admin access (see SECURITY.md)

---

## Deployment Instructions

### Prerequisites
- Docker + Docker Compose (v2+)
- Ubuntu Server 22.04 LTS or later
- UPS for the server (recommended, not required)

### Quick Start
```bash
tar -xzf fatima-erp.tar.gz
cd fatima-erp

# Configure environment
cp .env.example .env
nano .env  # set POSTGRES_PASSWORD, JWT_SECRET, AI settings

# Deploy
./install.sh

# Verify
./health-check.sh

# Open http://SERVER-IP in browser
# Demo login: admin / Fatima@2026 (CHANGE BEFORE GO-LIVE)
```

### Enabling AI (Optional)
```bash
# On the server, add to docker-compose.yml or run separately:
docker run -d -p 11434:11434 --name ollama ollama/ollama

# Then in .env:
AI_ENABLED=true

# And restart:
./restart.sh
```

### Backups
```bash
./backup.sh        # manual backup to backups/
./restore.sh backups/fatima_erp_YYYYMMDD_HHMMSS.sql.gz  # restore from backup

# For automatic backups, add to crontab:
0 * * * *  cd /path/to/fatima-erp && ./backup.sh >> backups/backup.log 2>&1
```

---

## Files to Download

The complete implementation is packaged in **fatima-erp.zip**:
- Full source (backend + frontend)
- Docker Compose stack
- Prisma migrations
- Seed data (90 rooms, demo users, recipes, inventory)
- Installation & operational scripts
- Complete documentation

---

## Support & Customization

All modules are built on standard NestJS + Next.js patterns. To extend:
- Add new report types: extend `ReportsService` with new methods, wire into controller
- Add new inventory transaction types: update enum, handle in `InventoryService`
- Add new menu items: use seed data or POST to `/api/pos/menu/items` (extend endpoint)
- Customize AI prompts: edit `buildContext()` in `AiService`
- Customize invoice/receipt HTML: edit templates in `PrintService`

All changes feed back into the audit log automatically via the `AuditService`.

---

**Delivered:** 2026-09-16  
**Prepared by:** OfficeHomeTechX Ltd  
**For:** Centre Pastoral Notre Dame de Fatima Hospitality Management
