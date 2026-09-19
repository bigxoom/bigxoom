# Backup & Restore

## Layers
1. **Primary** — live PostgreSQL database on the local server.
2. **Local backup** — `./backup.sh` writes a compressed dump to `backups/`.
3. **Cloud backup (optional)** — if `CLOUD_BACKUP_ENABLED=true` in `.env` and
   internet is available, `backup.sh` also encrypts and uploads the dump.
   Entirely optional; the system never depends on it to operate.

## Schedule (recommended)
- Hourly: local dump (cron, see `INSTALLATION.md`)
- Daily: keep last 30 daily dumps
- Weekly: keep last 12 weekly dumps
- Monthly: archive to separate storage/off-site

A simple retention pass can be added to `backup.sh` — prune anything older
than the policy above.

## Restore
```bash
./restore.sh backups/fatima_erp_20260101_020000.sql.gz
```
This stops writes and overwrites the current database — confirm you are
restoring the intended file before pressing Enter.

## Power/UPS
Run the server on a UPS. On power loss, Docker's `restart: unless-stopped`
policy brings every service back automatically once power returns.
