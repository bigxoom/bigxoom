# Installation Guide — Ubuntu Server LTS

## 1. Prerequisites
- Ubuntu Server 22.04 LTS or later
- A static local IP on the hotel LAN (recommended: reserve it in the router/DHCP)
- Docker + Docker Compose plugin:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo apt install -y docker-compose-plugin
  sudo usermod -aG docker $USER   # then log out/in
  ```

## 2. Deploy
```bash
tar -xzf fatima-erp.tar.gz
cd fatima-erp
cp .env.example .env
nano .env      # POSTGRES_PASSWORD, JWT_SECRET — use long random values
./install.sh
```

`install.sh` builds the containers, runs database migrations, seeds demo
data (90 rooms, one user per role, sample menu/inventory), then starts
the full stack.

## 3. Verify
```bash
./health-check.sh
```
Open `http://SERVER-IP` from any device on the LAN.

## 4. Day-to-day
```bash
./start.sh      # start everything
./stop.sh        # stop everything
./restart.sh     # restart everything
./backup.sh       # manual backup (also schedule this — see BACKUP_RESTORE.md)
```

## 5. Automatic backups (cron)
```bash
crontab -e
# hourly incremental-style dump, daily kept, weekly kept — see BACKUP_RESTORE.md
0 * * * *  cd /path/to/fatima-erp && ./backup.sh >> backups/backup.log 2>&1
```

## 6. Replacing demo data
Demo rooms/users/menu are created by `prisma/seed.ts`, clearly separate from
real operational data. Update room numbers/types, create real staff accounts
via the Admin panel (do not reuse demo accounts in production), and clear
demo guests/reservations from Admin → Data before go-live.
