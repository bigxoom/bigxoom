FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# Full install (not --only=production): the build needs @nestjs/cli/
# typescript, and the running container needs ts-node/prisma at runtime
# too (install.sh runs `prisma migrate deploy` and `ts-node prisma/seed.ts`
# directly against this image via `docker compose run`).
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main.js"]
