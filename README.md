# GUMÜÇROYAL — DTC E-Commerce Store

Premium bijouterie store for Morocco (COD, Arabic RTL, CRO optimized).

## Structure

```
├── docs/              Documentation for AI coders
├── frontend/          Next.js 16 + React 19 + Tailwind 4
├── backend/           FastAPI + PostgreSQL + Alembic
├── google-sheets/     Apps Script webhook + CSV templates
└── docker-compose.yml Local dev stack
```

## Quick Start (Local)

### With Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/v1/health

### Manual

**Backend:**
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
# Start PostgreSQL and set DATABASE_URL
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Production (EasyPanel)

| Service | Domain | Port |
|---------|--------|------|
| Frontend | gumucroyal.store | 3000 |
| Backend | api.gumucroyal.store | 8000 |
| PostgreSQL | gumucroyal_database (internal) | 5432 |

Database URL (internal):
```
postgresql+psycopg2://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal
```

## Google Sheets Setup

1. Create sheet from `google-sheets/sheet-template.csv`
2. Deploy `google-sheets/apps-script.js` as Web App
3. Set `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_WEBHOOK_SECRET` in backend env

## Docs

See `docs/README.md` for full documentation index.

## Features

- 3 products with bundle offers (AOV optimized)
- Cart drawer + cross-sells
- Checkout COD (name + phone Morocco 06/07)
- Post-checkout upsell 69 MAD (10-15 sec)
- Meta / TikTok / Snap pixels (deferred) + CAPI
- Orders → PostgreSQL + Google Sheets
