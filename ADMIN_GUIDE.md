# Admin Guide

## Dashboard
Log in as `admin` (or any ADMIN/SUPER_ADMIN/GENERAL_MANAGER account) to see,
at a glance: room status counts, today's check-ins/check-outs/current guests,
revenue by department, outstanding guest balances, open maintenance and
housekeeping tasks, low stock alerts, unread internal messages, and a live
activity feed sourced directly from the audit log.

## User & role management
Roles are fixed in the system (SUPER_ADMIN, ADMIN, GENERAL_MANAGER,
RECEPTIONIST, CASHIER, ACCOUNTANT, WAITER, BAR_STAFF, KITCHEN_STAFF,
HOUSEKEEPING, STOREKEEPER, MAINTENANCE, SUPERVISOR, AUDITOR). Every account
only sees the modules its role needs; sensitive actions (refunds, discounts,
voids, price changes, deleting financial records) are logged with who/what/
when/old value/new value/reason.

## Audit log
`Audit Logs` shows every recorded action across the system, newest first,
with the acting user and role. Nothing financial disappears silently —
corrections are new entries, not edits.

## Reports
The current build exposes the underlying data through the API for every
report area listed in the brief (occupancy, revenue by department, expenses,
reservations, guest history, inventory, maintenance, housekeeping, POS
sales). PDF/CSV export endpoints are the next increment — see
`NEXT_STEPS.md`.
