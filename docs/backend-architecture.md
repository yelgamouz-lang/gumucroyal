# Backend Architecture — GUMÜÇROYAL

## Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.12 | Runtime |
| FastAPI | 0.115+ | API framework |
| Uvicorn | 0.32+ | ASGI server |
| SQLAlchemy | 2.0+ | ORM |
| Alembic | 1.14+ | Migrations |
| Pydantic | 2.x | Validation |
| httpx | 0.28+ | Async HTTP (Google Sheets, CAPI) |
| psycopg2-binary | 2.9+ | PostgreSQL driver |
| python-dotenv | 1.x | Env loading |

---

## Folder Structure

```
backend/
├── Dockerfile
├── .env.example
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
│       ├── 001_initial_schema.py
│       └── 002_seed_products.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, lifespan
│   ├── config.py               # Settings from env
│   ├── database.py             # Engine, session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── offer.py
│   │   └── order.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── tracking.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py           # Main router
│   │   └── v1/
│   │       ├── products.py
│   │       ├── orders.py
│   │       └── health.py
│   ├── services/
│   │   ├── order_service.py
│   │   ├── phone_service.py
│   │   ├── sheets_service.py   # Google Sheets webhook
│   │   └── tracking/
│   │       ├── meta_capi.py
│   │       ├── tiktok_capi.py
│   │       ├── snap_capi.py
│   │       └── hashing.py      # SHA256 normalization
│   └── utils/
│       ├── order_id.py
│       └── deps.py               # DB session dependency
└── scripts/
    └── run_migrations.sh
```

---

## Application Entry (`main.py`)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import api_router
from alembic.config import Config
from alembic import command

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-run migrations on startup
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    yield

app = FastAPI(
    title="GUMÜÇROYAL API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
```

---

## Auto Migration on Startup

**Requirement:** Migrations run automatically when backend starts.

```python
# In lifespan (above) OR in Dockerfile entrypoint:
# alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Dockerfile CMD:**
```dockerfile
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

---

## Config (`config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CORS_ORIGINS: list[str] = ["https://gumucroyal.store", "http://localhost:3000"]
    
    # Google Sheets
    GOOGLE_SHEETS_WEBHOOK_URL: str
    
    # Meta CAPI
    META_PIXEL_ID: str
    META_CAPI_ACCESS_TOKEN: str
    
    # TikTok Events API
    TIKTOK_PIXEL_ID: str
    TIKTOK_ACCESS_TOKEN: str
    
    # Snapchat CAPI
    SNAP_PIXEL_ID: str
    SNAP_CAPI_ACCESS_TOKEN: str
    
    # App
    APP_ENV: str = "production"
    API_SECRET_KEY: str  # optional internal auth
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Order Flow (Backend)

```
POST /api/v1/orders          → Create draft order
PATCH /api/v1/orders/{id}    → Add upsell decision
POST /api/v1/orders/{id}/confirm → Finalize + Sheet + CAPI
GET /api/v1/orders/{id}      → Get order (thank you page)
GET /api/v1/products         → List products with offers
GET /api/v1/products/{slug}  → Single product
GET /api/v1/health           → Health check
```

See `api-specification.md` for full payloads.

---

## Phone Service

```python
# app/services/phone_service.py
import re

MOROCCO_PHONE_PATTERN = re.compile(r'^(?:0|\+?212)?([67]\d{8})$')

def normalize_morocco_phone(phone: str) -> str | None:
    """Returns E.164 format: 212XXXXXXXXX or None if invalid."""
    cleaned = re.sub(r'[\s\-\(\)\.]', '', phone.strip())
    match = MOROCCO_PHONE_PATTERN.match(cleaned)
    if not match:
        return None
    return f"212{match.group(1)}"

def format_display_phone(normalized: str) -> str:
    """212612345678 → 06 12 34 56 78"""
    local = f"0{normalized[3:]}"
    return f"{local[:2]} {local[2:4]} {local[4:6]} {local[6:8]} {local[8:10]}"
```

---

## Google Sheets Integration

On order confirm → POST to Google Apps Script webhook.
See `google-sheets-integration.md`.

---

## CAPI Integration

On order confirm → fire Purchase to Meta, TikTok, Snap in parallel.
See `tracking-pixels-capi.md`.

Use `asyncio.gather` for parallel CAPI calls — don't block response.

---

## Error Handling

```python
from fastapi import HTTPException

# Standard error responses
{ "detail": "رقم الهاتف غير صالح", "code": "INVALID_PHONE" }
{ "detail": "Order not found", "code": "ORDER_NOT_FOUND" }
```

---

## Logging

- Log order creation, confirmation, CAPI results, Sheet webhook results
- Never log raw phone numbers in production logs (log order ID only)
- Use structured JSON logging

---

## Health Check

```python
@router.get("/health")
async def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "gumucroyal-api"}
```

EasyPanel uses this for container health.

---

## Database Connection

```
postgres://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal?sslmode=disable
```

SQLAlchemy URL (same):
```
postgresql+psycopg2://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal
```

Database name: **gumucroyal** (PostgreSQL identifier, ASCII)

---

## Docker

See `docker-deployment.md`.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```
