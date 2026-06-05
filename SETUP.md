# GUMÜÇROYAL — Setup & Development Guide

## 📋 Project Overview

Premium DTC jewelry e-commerce store for Morocco (COD only).

**Stack:**
- Frontend: Next.js 15 + React 19 + Tailwind CSS 4
- Backend: FastAPI + PostgreSQL + Alembic
- Tracking: Meta + TikTok + Snap pixels
- Orders: Google Sheets webhook integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- PostgreSQL 16 (local or Docker)
- Git

### 1. Frontend Setup

```bash
cd frontend
npm install
```

**Create `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_id
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_id
NEXT_PUBLIC_SNAP_PIXEL_ID=your_id
```

**Run dev server:**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

### 2. Backend Setup

**Python virtual environment:**
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Create `.env.local`:**
```env
APP_ENV=development
DATABASE_URL=postgresql+psycopg2://gumucroyal:gumucroyal@localhost:5432/gumucroyal
GOOGLE_SHEETS_WEBHOOK_URL=your_url
GOOGLE_SHEETS_WEBHOOK_SECRET=your_secret
UPSELL_PRICE_MAD=69.0
```

**Run migrations:**
```bash
alembic upgrade head
```

**Start dev server:**
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

---

### 3. PostgreSQL Setup (Local)

**Option A: Docker**
```bash
docker run --name gumucroyal-db \
  -e POSTGRES_DB=gumucroyal \
  -e POSTGRES_USER=gumucroyal \
  -e POSTGRES_PASSWORD=gumucroyal \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Local install**
```bash
# Create database
createdb -U postgres gumucroyal
# Create user
psql -U postgres -c "CREATE USER gumucroyal WITH PASSWORD 'gumucroyal';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE gumucroyal TO gumucroyal;"
```

---

## 📁 Project Structure

```
E-COM/
├── frontend/          ← Next.js 15 app
│   ├── public/
│   ├── src/
│   │   ├── app/       ← Pages & routes
│   │   ├── components/← UI components
│   │   ├── hooks/     ← Custom hooks (useCart, useTracking, etc.)
│   │   ├── lib/       ← Utilities (api.ts, format.ts, phone.ts)
│   │   ├── stores/    ← Zustand stores (cart, UI state)
│   │   ├── types/     ← TypeScript definitions
│   │   └── styles/    ← Global CSS
│   └── package.json
│
├── backend/           ← FastAPI app
│   ├── app/
│   │   ├── models/    ← SQLAlchemy models (Product, Order, Offer)
│   │   ├── schemas/   ← Pydantic request/response models
│   │   ├── api/       ← API routes (endpoints)
│   │   ├── services/  ← Business logic
│   │   ├── main.py    ← FastAPI app initialization
│   │   ├── config.py  ← Settings from environment
│   │   └── database.py← Database engine & session
│   ├── alembic/       ← Database migrations
│   ├── requirements.txt
│   └── Dockerfile
│
└── docs/              ← Documentation (brand, CRO, specs)
```

---

## 🔗 API Endpoints

### Products

```
GET /api/v1/products              — List all products
GET /api/v1/products/{slug}       — Get single product
```

### Orders

```
POST /api/v1/orders               — Create order (draft)
PATCH /api/v1/orders/{id}/upsell  — Add upsell to order
POST /api/v1/orders/{id}/confirm  — Finalize order
GET /api/v1/orders/{order_number} — Get order details
```

### Health

```
GET /api/v1/health                — Health check
```

---

## 🛠️ Development Workflow

### Adding a new page

1. Create file in `frontend/src/app/[route]/page.tsx`
2. Import components
3. Test at `http://localhost:3000/[route]`

### Adding a new component

1. Create in `frontend/src/components/[category]/`
2. Use TypeScript + Tailwind CSS
3. Follow RTL conventions (text-right, flex-row-reverse if needed)

### Adding a database migration

```bash
cd backend
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

---

## 📊 Tracking Setup

### Meta Pixel

1. Get Pixel ID from Meta Business Suite
2. Add to `.env.local`: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_id`
3. Events tracked: ViewContent, AddToCart, InitiateCheckout, Purchase

### TikTok Pixel

1. Get Pixel ID from TikTok Ads Manager
2. Add to `.env.local`: `NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_id`
3. Events tracked: ViewContent, AddToCart, Checkout, Purchase

### Snap Pixel

1. Get Pixel ID from Snap Ads Manager
2. Add to `.env.local`: `NEXT_PUBLIC_SNAP_PIXEL_ID=your_id`
3. Events tracked: ViewContent, Purchase

---

## 📝 Database Schema

### Products
- `id` (UUID, PK)
- `slug` (String, unique)
- `sku` (String, unique)
- `name_ar`, `name_fr`
- `category` (bagues, colliers)
- `base_price_mad`, `compare_at_price_mad`
- `rating`, `review_count`
- `images` (JSONB array)
- `benefits` (JSONB array)
- `offers` (FK to Offers)

### Offers
- `id` (UUID, PK)
- `product_id` (FK)
- `slug` (unique)
- `label_ar` (e.g., "عرض زوجي")
- `quantity` (1, 2, 3)
- `price_mad`
- `is_default` (boolean, DUO = true)

### Orders
- `id` (UUID, PK)
- `order_number` (e.g., GR-20260602-0042)
- `customer_name`, `customer_phone` (normalized)
- `items` (FK to OrderItems)
- `total_mad`
- `status` (pending, completed, cancelled)
- `upsell_accepted` (boolean)
- `sheet_synced` (boolean, for Google Sheets)

### OrderItems
- `id` (UUID, PK)
- `order_id` (FK)
- `product_id`, `offer_id` (FK)
- `quantity`, `unit_price_mad`, `total_price_mad`
- `is_upsell` (boolean)

---

## 🔐 Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
NEXT_PUBLIC_SNAP_PIXEL_ID=
```

### Backend (`.env.local`)
```
APP_ENV=development
DATABASE_URL=postgresql+psycopg2://gumucroyal:gumucroyal@localhost:5432/gumucroyal
CORS_ORIGINS=["http://localhost:3000"]
GOOGLE_SHEETS_WEBHOOK_URL=
GOOGLE_SHEETS_WEBHOOK_SECRET=
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
TIKTOK_PIXEL_ID=
TIKTOK_ACCESS_TOKEN=
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=
UPSELL_PRICE_MAD=69.0
```

---

## 🧪 Testing

### Frontend Tests
```bash
npm run lint      # ESLint
npm run build     # Production build test
```

### Backend Tests
```bash
# Run API health check
curl http://localhost:8000/api/v1/health

# List products
curl http://localhost:8000/api/v1/products
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push

# Vercel automatically deploys on push
# Set env vars in Vercel dashboard
```

### Backend (Docker + EasyPanel)
```bash
# Build Docker image
docker build -t gumucroyal-api .

# Run with EasyPanel or Docker Compose
docker-compose up -d
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 🆘 Troubleshooting

### CORS errors?
Check `CORS_ORIGINS` in backend `.env.local` includes `http://localhost:3000`

### Database connection errors?
Verify PostgreSQL is running and `DATABASE_URL` is correct

### Migrations won't run?
```bash
alembic current   # Check current revision
alembic stamp --sql head  # Force latest
alembic upgrade head
```

### Frontend slow?
Check Network tab in DevTools, enable Tailwind JIT minification

---

## 📞 Support

See `/docs` folder for detailed specifications on:
- Brand positioning
- CRO strategy
- Product catalog
- Checkout flow
- Google Sheets integration
- Tracking setup
