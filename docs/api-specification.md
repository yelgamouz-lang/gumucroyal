# API Specification — GUMÜÇROYAL

Base URL: `https://api.gumucroyal.store/api/v1`

---

## Health

### `GET /health`

**Response 200:**
```json
{
  "status": "ok",
  "service": "gumucroyal-api",
  "version": "1.0.0"
}
```

---

## Products

### `GET /products`

List all active products with offers.

**Response 200:**
```json
{
  "products": [
    {
      "id": "uuid",
      "slug": "bague-lien-eternel",
      "sku": "GR-BLE-001",
      "name_ar": "خاتم الرابط الأبدي — By GUMÜÇROYAL",
      "name_fr": "Bague Lien Éternel By GUMÜÇ Royal",
      "description_short": "...",
      "category": "bagues",
      "base_price_mad": 249.00,
      "compare_at_price_mad": 399.00,
      "rating": 4.9,
      "review_count": 847,
      "badge": "Best Seller",
      "images": [
        { "url": "https://...", "alt": "...", "sort_order": 0 }
      ],
      "benefits": ["✨ ...", "💎 ..."],
      "offers": [
        {
          "id": "uuid",
          "slug": "GR-BLE-001-single",
          "label_ar": "قطعة واحدة",
          "quantity": 1,
          "price_mad": 249.00,
          "compare_at_price_mad": 399.00,
          "savings_mad": null,
          "is_default": false,
          "badge_ar": null
        },
        {
          "id": "uuid",
          "slug": "GR-BLE-001-duo",
          "label_ar": "عرض زوجي",
          "quantity": 2,
          "price_mad": 429.00,
          "savings_mad": 69.00,
          "is_default": true,
          "badge_ar": "⭐ الأكثر طلباً"
        }
      ],
      "cross_sell_slug": "collier-trefle-lumiere",
      "upsell_slug": "collier-trefle-lumiere"
    }
  ]
}
```

### `GET /products/{slug}`

Single product. Same shape as array item above.

**Response 404:**
```json
{ "detail": "Product not found", "code": "NOT_FOUND" }
```

---

## Orders

### `POST /orders`

Create draft order (checkout submit, before upsell).

**Request:**
```json
{
  "customer_name": "فاطمة الزهراء",
  "customer_phone": "0612345678",
  "items": [
    {
      "product_id": "uuid",
      "offer_id": "uuid",
      "quantity": 1
    }
  ],
  "tracking": {
    "event_id": "purchase_abc123_1717340000",
    "fbp": "fb.1.1717340000.123456789",
    "fbc": "fb.1.1717340000.AbCdEf",
    "ttclid": "E.C.P.xxx",
    "sc_click_id": "xxx",
    "source_url": "https://gumucroyal.store/products/bague-lien-eternel",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Validation:**
- `customer_name`: required, 2-100 chars
- `customer_phone`: Morocco 06/07 only
- `items`: min 1 item
- `tracking.event_id`: required for dedup

**Response 201:**
```json
{
  "id": "uuid",
  "order_number": "GR-20260602-0042",
  "status": "upsell_offered",
  "subtotal_mad": 429.00,
  "total_mad": 429.00,
  "upsell_product": {
    "id": "uuid",
    "slug": "collier-trefle-lumiere",
    "name_ar": "قلادة البرسيم المضيء",
    "image_url": "https://...",
    "original_price_mad": 279.00,
    "upsell_price_mad": 69.00
  },
  "event_id": "purchase_abc123_1717340000"
}
```

**Response 422:**
```json
{
  "detail": [
    { "loc": ["body", "customer_phone"], "msg": "رقم الهاتف غير صالح", "code": "INVALID_PHONE" }
  ]
}
```

---

### `PATCH /orders/{order_id}`

Update upsell decision.

**Request:**
```json
{
  "upsell_accepted": true
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "order_number": "GR-20260602-0042",
  "status": "upsell_offered",
  "upsell_accepted": true,
  "subtotal_mad": 429.00,
  "upsell_amount_mad": 69.00,
  "total_mad": 498.00
}
```

---

### `POST /orders/{order_id}/confirm`

Finalize order → DB + Google Sheet + CAPI.

**Request:**
```json
{
  "upsell_accepted": false
}
```

(Can also be called after PATCH — this field confirms final state)

**Response 200:**
```json
{
  "id": "uuid",
  "order_number": "GR-20260602-0042",
  "status": "completed",
  "customer_name": "فاطمة الزهراء",
  "customer_phone_display": "06 12 34 56 78",
  "items": [
    {
      "product_name_ar": "خاتم الرابط الأبدي",
      "offer_label_ar": "عرض زوجي",
      "quantity": 2,
      "total_price_mad": 429.00
    }
  ],
  "upsell_accepted": false,
  "subtotal_mad": 429.00,
  "upsell_amount_mad": 0.00,
  "total_mad": 429.00,
  "payment_method": "COD",
  "event_id": "purchase_abc123_1717340000",
  "confirmed_at": "2026-06-02T14:30:00Z"
}
```

**Backend actions on confirm:**
1. Update order status → `completed`
2. POST to Google Sheets webhook
3. Fire Meta CAPI Purchase
4. Fire TikTok Events API CompletePayment
5. Fire Snapchat CAPI PURCHASE
6. Mark `sheet_synced` and `capi_synced`

---

### `GET /orders/{order_number}`

Get order for thank you page (by order_number like `GR-20260602-0042`).

**Response 200:** Same as confirm response.

**Response 404:**
```json
{ "detail": "Order not found", "code": "ORDER_NOT_FOUND" }
```

---

## Error Format

```json
{
  "detail": "Human readable message",
  "code": "ERROR_CODE"
}
```

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_PHONE | 422 | Phone not valid Morocco |
| INVALID_NAME | 422 | Name validation failed |
| NOT_FOUND | 404 | Resource not found |
| ORDER_ALREADY_CONFIRMED | 409 | Double confirm attempt |
| INTERNAL_ERROR | 500 | Server error |

---

## CORS

```
Access-Control-Allow-Origin: https://gumucroyal.store
Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Rate Limiting (recommended)

- POST /orders: 10 req/min per IP
- Implement via middleware or EasyPanel nginx

---

## Client IP & User Agent

Backend extracts from request headers for CAPI:
```python
client_ip = request.headers.get("X-Forwarded-For", request.client.host).split(",")[0]
user_agent = request.headers.get("User-Agent", "")
```

Frontend passes tracking IDs; backend adds IP/UA server-side.
