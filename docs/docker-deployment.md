# Docker & Deployment — GUMÜÇROYAL

## Architecture déploiement (EasyPanel)

```
Internet
    │
    ├── gumucroyal.store ──────→ Frontend container (Next.js :3000)
    │
    └── api.gumucroyal.store ──→ Backend container (FastAPI :8000)
                                      │
                                      └── gumucroyal_database:5432 (PostgreSQL internal)
```

---

## Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* must be available at build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_TIKTOK_PIXEL_ID
ARG NEXT_PUBLIC_SNAP_PIXEL_ID
ARG NEXT_PUBLIC_WHATSAPP_NUMBER

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_TIKTOK_PIXEL_ID=$NEXT_PUBLIC_TIKTOK_PIXEL_ID
ENV NEXT_PUBLIC_SNAP_PIXEL_ID=$NEXT_PUBLIC_SNAP_PIXEL_ID
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

### next.config.ts requirement

```typescript
const nextConfig = {
  output: 'standalone',
  // ... rest
};
export default nextConfig;
```

---

## Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

---

## Docker Compose (Local Dev)

```yaml
# docker-compose.yml (root)
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: gumucroyal
      POSTGRES_PASSWORD: gumucroyal
      POSTGRES_DB: gumucroyal
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg2://gumucroyal:gumucroyal@db:5432/gumucroyal
    depends_on:
      - db
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend
    env_file:
      - ./frontend/.env.local

volumes:
  pgdata:
```

---

## EasyPanel Setup

### 1. PostgreSQL (déjà installé)

Connection string internal:
```
postgres://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal?sslmode=disable
```

Backend env `DATABASE_URL`:
```
postgresql+psycopg2://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal
```

### 2. Backend Service

| Setting | Value |
|---------|-------|
| Source | GitHub repo |
| Build | Dockerfile in `backend/` |
| Port | 8000 |
| Domain | api.gumucroyal.store |
| Health | `/api/v1/health` |
| Env | All backend vars from env-variables.md |

### 3. Frontend Service

| Setting | Value |
|---------|-------|
| Source | GitHub repo |
| Build | Dockerfile in `frontend/` |
| Port | 3000 |
| Domain | gumucroyal.store |
| Build args | NEXT_PUBLIC_* vars |
| Env | Frontend vars from env-variables.md |

### 4. DNS

```
gumucroyal.store       → A/CNAME → EasyPanel frontend
api.gumucroyal.store   → A/CNAME → EasyPanel backend
```

### 5. SSL

EasyPanel auto SSL via Let's Encrypt for both domains.

---

## GitHub Push Workflow

```bash
git init
git add .
git commit -m "Initial GUMÜÇROYAL store"
git remote add origin https://github.com/USER/gumucroyal.git
git push -u origin main
```

EasyPanel watches repo → auto deploy on push.

---

## Environment Separation

| Env | Frontend URL | Backend URL |
|-----|-------------|-------------|
| Local | http://localhost:3000 | http://localhost:8000 |
| Production | https://gumucroyal.store | https://api.gumucroyal.store |

CORS backend must include both in dev, production only in prod.

---

## Build & Run Commands

```bash
# Local with docker-compose
docker-compose up --build

# Frontend only (dev)
cd frontend && npm install && npm run dev

# Backend only (dev)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Run migrations manually
cd backend && alembic upgrade head
```

---

## Monitoring (Recommended)

- EasyPanel built-in logs
- Backend health endpoint for uptime monitoring
- Google Sheet as order notification (real-time)
- (Future) Sentry for error tracking

---

## Rollback

EasyPanel supports redeploy previous version from git history.

Database migrations: write reversible downgrade in Alembic if possible.
