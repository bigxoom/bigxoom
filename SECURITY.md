# Security

- Passwords hashed with bcrypt; never stored in plain text.
- JWT-based sessions; set a long, random `JWT_SECRET` in `.env` before
  go-live and never commit `.env` to version control.
- Role-based access control enforced on every API route; sensitive actions
  are further restricted to specific roles.
- Every state-changing action writes an audit log entry (who, what, when,
  old value, new value, reason where applicable).
- Input validation on all API endpoints (`class-validator`); Prisma's
  parameterized queries prevent SQL injection.
- `helmet` sets standard security headers; CORS restricted to the
  configured frontend origin.
- No hardcoded production credentials — everything sensitive comes from
  `.env`, which is excluded from the package and must be created per
  deployment.
- Recommended additions before go-live: rate limiting on `/auth/login`,
  account lockout after repeated failures, HTTPS via the Caddy proxy with a
  local CA or Let's Encrypt if a public hostname is available, and a VPN for
  any remote-admin access (see `NETWORK_ARCHITECTURE.md`).
