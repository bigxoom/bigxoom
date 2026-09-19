# Next Steps — completing the full brief

This package delivers the working foundation: auth/RBAC, 90-room PMS,
guest folio, restaurant & bar POS, real-time kitchen display, housekeeping,
maintenance, basic inventory, internal communication, audit log, and the
admin dashboard — fully integrated end to end.

Still to build, in priority order:

1. **PDF/CSV report exports** for the report list in the brief (occupancy,
   revenue, expenses, guest history, POS sales, closing reports).
2. **Inventory ↔ POS auto-deduction** — reduce stock automatically when a
   tracked menu item is sold.
3. **Cash session / shift reconciliation UI** for cashiers and bartenders.
4. **Guest-facing check-in form + printable A4 invoice / thermal receipt
   templates.**
5. **FATIMA PRO+ AI** — optional local assistant via Ollama, read-only over
   the operational data (never allowed to modify financial records),
   answering questions like "give me today's summary."
6. **On-site network deployment** per `NETWORK_ARCHITECTURE.md` (VLANs,
   switches, Wi-Fi, firewall rules) — physical/ICT infrastructure work.
7. **E2E test suite** covering the full guest/order lifecycle listed in the
   original brief.
8. **HTTPS + rate limiting + account lockout** hardening described in
   `SECURITY.md`.

Each of these builds directly on the schema and modules already in place —
none require restructuring what's here.
