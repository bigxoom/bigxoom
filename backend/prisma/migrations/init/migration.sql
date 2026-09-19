-- InitialSchema -- Creates the complete Fatima ERP schema

-- Auth / RBAC
CREATE TYPE "Role" AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'GENERAL_MANAGER',
  'RECEPTIONIST',
  'CASHIER',
  'ACCOUNTANT',
  'WAITER',
  'BAR_STAFF',
  'KITCHEN_STAFF',
  'HOUSEKEEPING',
  'STOREKEEPER',
  'MAINTENANCE',
  'SUPERVISOR',
  'AUDITOR'
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "department" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Rooms
CREATE TYPE "RoomStatus" AS ENUM (
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'DIRTY',
  'CLEANING',
  'READY',
  'MAINTENANCE',
  'BLOCKED'
);

CREATE TABLE "RoomType" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "basePrice" DECIMAL(12, 2) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "description" TEXT
);

CREATE TABLE "Room" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "number" TEXT NOT NULL UNIQUE,
  "floor" TEXT,
  "building" TEXT,
  "roomTypeId" TEXT NOT NULL,
  "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
  "features" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id")
);

-- Guests & Reservations
CREATE TABLE "Guest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "nationality" TEXT,
  "idNumber" TEXT,
  "organization" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "ReservationStatus" AS ENUM (
  'NEW',
  'CONFIRMED',
  'ARRIVAL',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW'
);

CREATE TABLE "Reservation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'NEW',
  "arrivalDate" TIMESTAMP NOT NULL,
  "departureDate" TIMESTAMP NOT NULL,
  "numGuests" INTEGER NOT NULL DEFAULT 1,
  "specialRequests" TEXT,
  "depositAmount" DECIMAL(12, 2),
  "groupBookingRef" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("guestId") REFERENCES "Guest"("id"),
  FOREIGN KEY ("roomId") REFERENCES "Room"("id"),
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE TABLE "Stay" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reservationId" TEXT UNIQUE,
  "guestId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "checkInAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkOutAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id"),
  FOREIGN KEY ("guestId") REFERENCES "Guest"("id"),
  FOREIGN KEY ("roomId") REFERENCES "Room"("id")
);

-- Folio & Payments
CREATE TABLE "GuestFolio" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "stayId" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("stayId") REFERENCES "Stay"("id")
);

CREATE TABLE "FolioItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "folioId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "sourceOrderId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("folioId") REFERENCES "GuestFolio"("id")
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "number" SERIAL UNIQUE,
  "folioId" TEXT NOT NULL,
  "total" DECIMAL(12, 2) NOT NULL,
  "issuedById" TEXT,
  "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pdfPath" TEXT,
  FOREIGN KEY ("folioId") REFERENCES "GuestFolio"("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "receiptNumber" SERIAL UNIQUE,
  "folioId" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "method" TEXT NOT NULL,
  "reference" TEXT,
  "cashierId" TEXT,
  "receivedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("folioId") REFERENCES "GuestFolio"("id")
);

-- Inventory (created before POS & Kitchen: MenuItemRecipeComponent references InventoryItem)
CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "phone" TEXT
);

CREATE TABLE "InventoryItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "quantity" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "minStock" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  "unitCost" DECIMAL(12, 2),
  "supplierId" TEXT,
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
);

-- POS & Kitchen
CREATE TABLE "MenuCategory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL
);

CREATE TABLE "MenuItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DECIMAL(12, 2) NOT NULL,
  "trackStock" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id")
);

CREATE TABLE "MenuItemRecipeComponent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "menuItemId" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "quantityPerUnit" DECIMAL(12, 4) NOT NULL,
  UNIQUE("menuItemId", "inventoryItemId"),
  FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id"),
  FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id")
);

CREATE TYPE "PosOrderStatus" AS ENUM (
  'OPEN',
  'SENT',
  'PREPARING',
  'READY',
  'SERVED',
  'PAID',
  'CANCELLED'
);

CREATE TABLE "PosOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "tableNumber" TEXT,
  "roomId" TEXT,
  "waiterId" TEXT NOT NULL,
  "status" "PosOrderStatus" NOT NULL DEFAULT 'OPEN',
  "chargeToRoom" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id"),
  FOREIGN KEY ("waiterId") REFERENCES "User"("id")
);

CREATE TABLE "PosOrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "notes" TEXT,
  "unitPrice" DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id"),
  FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id")
);

CREATE TABLE "PosSale" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "receiptNumber" SERIAL UNIQUE,
  "orderId" TEXT NOT NULL UNIQUE,
  "amount" DECIMAL(12, 2) NOT NULL,
  "method" TEXT NOT NULL,
  "cashierId" TEXT,
  "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id")
);

CREATE TYPE "KitchenStatus" AS ENUM (
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'SERVED',
  'CANCELLED'
);

CREATE TABLE "KitchenTicket" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL UNIQUE,
  "status" "KitchenStatus" NOT NULL DEFAULT 'NEW',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "handledById" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id"),
  FOREIGN KEY ("handledById") REFERENCES "User"("id")
);

-- Housekeeping & Maintenance
CREATE TYPE "HousekeepingStatus" AS ENUM (
  'DIRTY',
  'ASSIGNED',
  'CLEANING',
  'INSPECTION',
  'READY'
);

CREATE TABLE "HousekeepingTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "roomId" TEXT NOT NULL,
  "status" "HousekeepingStatus" NOT NULL DEFAULT 'DIRTY',
  "assignedToId" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id"),
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
);

CREATE TYPE "MaintenanceStatus" AS ENUM (
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PART',
  'COMPLETED',
  'VERIFIED',
  'CLOSED'
);

CREATE TABLE "MaintenanceTicket" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "roomId" TEXT,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "assignedToId" TEXT,
  "cost" DECIMAL(12, 2),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"("id"),
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
);

-- Stock transactions
CREATE TYPE "StockTxStatus" AS ENUM (
  'POSTED',
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE "StockTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "itemId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "quantity" DECIMAL(12, 2) NOT NULL,
  "reason" TEXT,
  "status" "StockTxStatus" NOT NULL DEFAULT 'POSTED',
  "requestedById" TEXT,
  "approvedById" TEXT,
  "sourceOrderId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP,
  FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id")
);

-- Accounting
CREATE TABLE "Expense" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "approvedById" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("approvedById") REFERENCES "User"("id")
);

CREATE TABLE "CashSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "openedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP,
  "openingFloat" DECIMAL(12, 2) NOT NULL,
  "closingTotal" DECIMAL(12, 2),
  "notes" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Communication
CREATE TYPE "TaskStatus" AS ENUM (
  'OPEN',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "toDepartment" TEXT,
  "toUserId" TEXT,
  "content" TEXT NOT NULL,
  "isOperationalTask" BOOLEAN NOT NULL DEFAULT false,
  "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("senderId") REFERENCES "User"("id")
);

-- Audit & System
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "reason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE "SystemSetting" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL
);

-- Indexes
CREATE INDEX "idx_user_username" ON "User"("username");
CREATE INDEX "idx_room_status" ON "Room"("status");
CREATE INDEX "idx_guest_name" ON "Guest"("fullName");
CREATE INDEX "idx_reservation_status" ON "Reservation"("status");
CREATE INDEX "idx_stay_checkout" ON "Stay"("checkOutAt");
CREATE INDEX "idx_folio_status" ON "GuestFolio"("status");
CREATE INDEX "idx_posorder_status" ON "PosOrder"("status");
CREATE INDEX "idx_kitchen_status" ON "KitchenTicket"("status");
CREATE INDEX "idx_housekeeping_status" ON "HousekeepingTask"("status");
CREATE INDEX "idx_maintenance_status" ON "MaintenanceTicket"("status");
CREATE INDEX "idx_inventory_quantity" ON "InventoryItem"("quantity");
CREATE INDEX "idx_stock_transaction_type" ON "StockTransaction"("type");
CREATE INDEX "idx_audit_action" ON "AuditLog"("action");
CREATE INDEX "idx_audit_created" ON "AuditLog"("createdAt");
