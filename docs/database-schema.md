# Database Schema — GUMÜÇROYAL

## Database Info

| Property | Value |
|----------|-------|
| Name | `gumucroyal` |
| Brand name | GUMÜÇROYAL |
| Engine | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic (auto on startup) |

---

## ER Diagram

```
products 1──N offers
products 1──N order_items
orders 1──N order_items
orders 1──0..1 upsells
```

---

## Tables

### `products`

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    sku             VARCHAR(50) UNIQUE NOT NULL,
    name_fr         VARCHAR(255) NOT NULL,
    name_ar         VARCHAR(255) NOT NULL,
    description_short TEXT NOT NULL,
    description_long  TEXT NOT NULL,
    category        VARCHAR(50) NOT NULL,  -- 'bagues' | 'colliers'
    base_price_mad  DECIMAL(10,2) NOT NULL,
    compare_at_price_mad DECIMAL(10,2) NOT NULL,
    material        TEXT,
    rating          DECIMAL(2,1) DEFAULT 4.9,
    review_count    INTEGER DEFAULT 0,
    badge           VARCHAR(50),  -- 'Best Seller' | 'Nouveau' | 'Porte-Bonheur'
    images          JSONB NOT NULL DEFAULT '[]',  -- [{url, alt, sort_order}]
    benefits        JSONB NOT NULL DEFAULT '[]',  -- ["✨ ...", "💎 ..."]
    cross_sell_slug VARCHAR(100),
    upsell_slug     VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
```

### `offers`

```sql
CREATE TABLE offers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    label_ar        VARCHAR(255) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    price_mad       DECIMAL(10,2) NOT NULL,
    compare_at_price_mad DECIMAL(10,2),
    savings_mad     DECIMAL(10,2),
    is_default      BOOLEAN DEFAULT FALSE,
    badge_ar        VARCHAR(100),  -- '⭐ الأكثر طلباً' | 'أفضل قيمة'
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_product_id ON offers(product_id);
```

### `orders`

```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,  -- GR-YYYYMMDD-XXXX
    customer_name   VARCHAR(255) NOT NULL,
    customer_phone  VARCHAR(20) NOT NULL,  -- normalized 212XXXXXXXXX
    phone_display   VARCHAR(20) NOT NULL,  -- 06 XX XX XX XX
    subtotal_mad    DECIMAL(10,2) NOT NULL,
    upsell_amount_mad DECIMAL(10,2) DEFAULT 0,
    total_mad       DECIMAL(10,2) NOT NULL,
    status          VARCHAR(30) DEFAULT 'pending',  
    -- pending | confirmed | upsell_offered | completed | cancelled
    upsell_accepted BOOLEAN DEFAULT FALSE,
    upsell_product_id UUID REFERENCES products(id),
    payment_method  VARCHAR(20) DEFAULT 'COD',
    event_id        VARCHAR(100),  -- for pixel dedup
    fbp             VARCHAR(255),  -- Meta browser ID (from frontend)
    fbc             VARCHAR(255),  -- Meta click ID
    ttclid          VARCHAR(255),  -- TikTok click ID
    sc_click_id     VARCHAR(255),  -- Snapchat click ID
    client_ip       VARCHAR(45),
    user_agent      TEXT,
    source_url      TEXT,
    sheet_synced    BOOLEAN DEFAULT FALSE,
    sheet_synced_at TIMESTAMPTZ,
    capi_synced     BOOLEAN DEFAULT FALSE,
    capi_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at    TIMESTAMPTZ
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### `order_items`

```sql
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    offer_id        UUID REFERENCES offers(id),
    product_name_ar VARCHAR(255) NOT NULL,
    offer_label_ar  VARCHAR(255),
    quantity        INTEGER NOT NULL,
    unit_price_mad  DECIMAL(10,2) NOT NULL,
    total_price_mad DECIMAL(10,2) NOT NULL,
    is_upsell       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## Seed Data (Migration 002)

Insert 3 products + 9 offers (3 per product). Data from `products-catalog.md` and `offers-pricing-aov.md`.

```python
# alembic/versions/002_seed_products.py — pseudo
PRODUCTS = [
    {
        "slug": "bague-lien-eternel",
        "sku": "GR-BLE-001",
        "name_ar": "خاتم الرابط الأبدي — By GUMÜÇROYAL",
        "base_price_mad": 249.00,
        "compare_at_price_mad": 399.00,
        "badge": "Best Seller",
        "cross_sell_slug": "collier-trefle-lumiere",
        "upsell_slug": "collier-trefle-lumiere",
        # ... offers: single 249, duo 429 (default), trio 549
    },
    # ... 2 more products
]
```

---

## Alembic Setup

```ini
# alembic.ini
sqlalchemy.url = driver://user:pass@localhost/dbname
# Overridden in env.py from DATABASE_URL env var
```

```python
# alembic/env.py
from app.config import settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
from app.models import Base
target_metadata = Base.metadata
```

---

## Status Flow

```
pending → (checkout submit)
upsell_offered → (upsell shown)
completed → (upsell accept/skip + confirm)
```

Single transaction for confirm: update order + insert upsell item if accepted + mark completed.

---

## Queries fréquentes

```sql
-- Order with items for thank you page
SELECT o.*, 
       json_agg(json_build_object(
         'name', oi.product_name_ar,
         'quantity', oi.quantity,
         'price', oi.total_price_mad
       )) as items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.order_number = 'GR-20260602-0042'
GROUP BY o.id;
```

---

## Notes

- Pas de table `users` — COD sans compte client
- Pas de table `inventory` — dropshipping, stock = marketing scarcity only
- `event_id` stored for CAPI dedup reference
- Phone stored normalized `212XXXXXXXXX` always
