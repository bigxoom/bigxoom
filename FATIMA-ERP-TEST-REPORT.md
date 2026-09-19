# FATIMA ERP — Test Report

Date: 2026-09-19
Scope: Admin Command Center feature work, plus a full verification pass on the
resulting package before final delivery.

This report is a factual account of what was run and what it showed — not a
marketing summary. Where something could not be tested, that is stated
plainly rather than assumed to pass.

---

## 1. How this was tested

Two different methods were used, for two different reasons:

**A. Native run** (system-installed PostgreSQL 16 + Redis 7 + Node 22, no
Docker) — used to exercise the actual application logic: schema, migrations,
seed data, every API route, and the full UI, via a real browser
(Playwright + Chromium) clicking through the real app.

**B. Docker** — used to validate `docker-compose.yml` syntax and to build
each Dockerfile's install/build steps. A full `docker compose up` could not
be completed in this environment: the sandbox's outbound network policy
blocks `production.cloudfront.docker.com`, the CDN Docker Hub uses to serve
image layers, so `node:20-alpine`, `postgres:16-alpine`, `redis:7-alpine`
and `caddy:2-alpine` cannot be pulled here. This was confirmed repeatedly
(policy-level 403 on CONNECT, not a transient failure) and is a property of
this build environment, not of the project. `docker compose config` (pure
syntax/parsing, no image pull) passes cleanly, and both Dockerfiles' exact
`RUN` steps were reproduced and verified outside Docker (details below) —
the actual likelihood of a successful `docker compose build` on a machine
with normal internet access is high, but that final step itself is the one
thing this report cannot claim to have watched pass.

---

## 2. Bugs found and fixed

Six real, pre-existing bugs were found this way and fixed. None were
introduced by the earlier feature work — they were latent in the delivered
project and would have surfaced on first real deployment.

1. **Migration failed on a fresh database.** `migration.sql` created
   `MenuItemRecipeComponent`'s foreign key to `InventoryItem` before
   `InventoryItem` existed. `prisma migrate deploy` failed immediately.
   Fixed by reordering the table creation.

2. **Every payment, invoice and POS sale crashed with HTTP 500.**
   `Payment.receiptNumber`, `Invoice.number` and `PosSale.receiptNumber` are
   `@default(autoincrement())` in `schema.prisma`, but the raw migration SQL
   declared them as plain `INTEGER`, never creating the backing sequence.
   Every insert hit a NOT NULL constraint violation. Switched all three to
   `SERIAL`. Verified via the real UI: reservation → check-in → add charge →
   record payment → invoice → check-out, all the way through, receipt
   numbers issued correctly.

3. **`docker compose build` / `npm start` would not boot the backend.**
   `tsconfig.json` had no `rootDir`, so the compiled entry point landed at
   `dist/src/main.js`, while `package.json`'s start script and the
   Dockerfile's `CMD` both run `dist/main.js`. Fixed the TypeScript output
   path to match what already ships.

4. **A persistent React hydration mismatch on every page.** Sidebar/TopBar/
   QuickActions and three pages read the logged-in user from `localStorage`
   directly during render, which differs between the server-rendered pass
   (no `window`) and the client. Added a mount-safe `useCurrentUser()` hook.

5. **LAN access was silently broken for every device except the server
   itself.** `docker compose build` never sees `.env` (`env_file` is a
   container-*runtime* mechanism; `next build`, which bakes in
   `NEXT_PUBLIC_*` vars, runs at *build* time) — so the frontend always
   fell back to a hardcoded `http://localhost/api` and `http://localhost`
   for its API and Socket.IO calls. From the server's own browser that's
   invisible; from any other device on the LAN opening `http://<server-ip>`,
   the browser would call *its own* localhost and every request would fail.
   Fixed by resolving both relative to the page's own origin instead
   (`/api`, `window.location.origin`), which Caddy's same-origin reverse
   proxy makes correct from any host automatically.

6. **The backend Docker image could not build at all.** `npm ci
   --only=production` stripped `@nestjs/cli`, `typescript` and `prisma` —
   all needed for `nest build` and for `prisma generate` — and `ts-node`/
   `prisma`, which `install.sh` runs directly against the built image
   (`docker compose run --rm backend npx ts-node prisma/seed.ts`). Reproduced
   the exact failure outside Docker (`npm ci --only=production && npm run
   build` → `sh: 1: nest: not found`), then fixed it and reproduced the fix
   the same way (clean build, `dist/main.js` present, `ts-node` still
   resolvable for the runtime seed step). Also switched the frontend
   Dockerfile to copy `package-lock.json` and use `npm ci` instead of
   regenerating the lockfile inside the image on every build.

---

## 3. What was actually run (native path)

Fresh PostgreSQL database, `prisma migrate deploy`, `prisma db seed`
(90 rooms, 13 role accounts, menu + recipes, inventory), backend and
frontend started, then driven through a real Chromium browser:

- Login as `admin` / `Fatima@2026`
- Admin Command Center: KPI cards, Live Room Board (90 rooms, grouped by
  floor), Attention Required, Live Operations, Financial Snapshot, Quick
  Actions, Recent Activity — all loading real data
- New Reservation → Check-In → Add Charge (150,000 RWF) → Record Payment
  (150,000 RWF, balance settles to 0) → Check-Out (room flips to DIRTY, a
  housekeeping task is auto-created) — the full guest-journey timeline in
  the room drawer updated live at every step
- Global search found the guest by name
- Every other page (Reservations, Housekeeping, Kitchen, POS, Maintenance,
  Guests & Folios, Inventory, Audit Trail) loaded without error
- Zero browser console errors, zero failed network requests, on the final
  pass

This was then repeated **a second time from the collected
`fatima-erp-production/` folder itself** — `npm ci` + build inside
`fatima-erp-production/backend` and `fatima-erp-production/frontend`, the
frontend run from its `.next/standalone` output (the same artifact the
Dockerfile's final stage ships) with `.next/static` copied alongside it
exactly as the Dockerfile does — to confirm the package being delivered,
not just the working tree it was collected from, is what was tested. Result:
90 rooms rendered, room drawer opened, a second full reservation → check-in
→ payment flow completed with a correctly issued receipt number, zero
console errors.

---

## 4. What was run via Docker

- `docker compose config` from the collected folder: **passes**, no
  warnings, all five services resolve, all bind mounts and build contexts
  resolve to paths inside the collected folder (no external references).
- Backend Dockerfile's `npm ci` → `prisma generate` → `npm run build`
  sequence, and frontend's `npm ci` → `npm run build`: reproduced outside
  Docker against the exact collected-folder source, both clean.
- `docker build` itself (pulling `node:20-alpine`) and `docker compose up`:
  **blocked** by this sandbox's egress policy (see §1). Not run.
- `docker save` for a prebuilt image bundle: **not produced**, for the same
  reason — there is nothing to save without a completed build. The
  `install.sh` logic to `docker load` a bundle from
  `images/fatima-erp-images.tar` when present is in place and ready, but the
  tar itself is not included in this delivery.
- `backup.sh`/`restore.sh` use `docker compose exec -T db pg_dump`/`psql`,
  which needs a running container stack this sandbox can't provide — but the
  underlying mechanism (`pg_dump | gzip`, then `gunzip | psql` into a fresh
  database) was verified directly against the seeded native database: the
  restored copy matched the source exactly (90 rooms, 13 users). The only
  untested part is the one-line `docker compose exec` wrapper around it.

---

## 5. Known limitations, stated plainly

- **Docker build/up was not directly observed to succeed.** Everything that
  can be verified without pulling images was verified and passed; the
  Dockerfiles were proven correct by reproducing their exact commands
  outside Docker. The one thing not literally watched end-to-end is
  `docker compose build && docker compose up` on a machine with normal
  internet access. Run `./install.sh` (or `docker compose config` first, if
  you want a fast sanity check) on first deployment and watch it.
- **Prebuilt images are not included.** `images/fatima-erp-images.tar` is
  not part of this package. `install.sh` will build from source, which is
  the documented path in any case.
- **LAN reachability from a second physical device was not literally
  tested** (this sandbox has one network namespace). The fix in §2.5 is a
  well-understood, verifiable-by-inspection correction (confirmed the built
  JS bundle contains no hardcoded `localhost` string), but a real second
  device on the LAN opening `http://<server-ip>` after deployment is the
  final confirmation worth doing once.
- Role-specific dashboards, Finance & Reports, Communication, and Users &
  Settings pages are intentionally not built — the sidebar shows them as
  disabled "Soon" entries rather than dead links. This was a scope decision
  from the original feature work, not a bug.

---

## 6. Summary

| Item | Result |
|---|---|
| Backend build | PASS (native + reproduced Dockerfile sequence) |
| Frontend build | PASS (native + reproduced Dockerfile sequence) |
| `docker compose config` | PASS |
| Docker image build/up | NOT TESTED — blocked by sandbox network policy |
| PostgreSQL | PASS |
| Redis | PASS |
| Migration | PASS (after fix) |
| Seed (90 rooms, users, menu, inventory) | PASS |
| Backend health endpoint | PASS |
| Frontend | PASS |
| Full guest journey (reservation→checkout) | PASS (after fixes) |
| Collected-folder standalone re-test | PASS |
| LAN URL correctness (build inspection) | PASS (fix verified in bundle; not tested from a second physical device) |
| Backup/restore mechanism | PASS (pg_dump/restore verified directly, exact row-count match; the `docker compose exec` wrapper itself not exercised — see note above) |
| Installer (`install.sh`) | Reviewed and updated; not executed end-to-end (same Docker limitation) |
| Prebuilt image bundle | NOT PRODUCED — Docker Hub unreachable in this sandbox |
