# Google Sheets Integration — GUMÜÇROYAL

## Flow

```
Order confirmed (backend)
    ↓
POST to Google Apps Script Web App URL
    ↓
Apps Script validates secret + appends row to Sheet
    ↓
Response 200 { "success": true, "row": 42 }
    ↓
Backend marks order.sheet_synced = true
```

---

## Google Sheet Template

Create a Google Sheet named: **GUMÜÇROYAL Orders**

### Columns (Row 1 headers)

| Col | Header | Type | Example |
|-----|--------|------|---------|
| A | order_number | string | GR-20260602-0042 |
| B | created_at | datetime | 2026-06-02 14:30:00 |
| C | customer_name | string | فاطمة الزهراء |
| D | customer_phone | string | 06 12 34 56 78 |
| E | customer_phone_normalized | string | 212612345678 |
| F | products | string | خاتم الرابط الأبدي x2 (عرض زوجي) |
| G | items_count | number | 2 |
| H | subtotal_mad | number | 429.00 |
| I | upsell_accepted | boolean | TRUE |
| J | upsell_product | string | قلادة البرسيم المضiء |
| K | upsell_amount_mad | number | 69.00 |
| L | total_mad | number | 498.00 |
| M | payment_method | string | COD |
| N | status | string | completed |
| O | source_url | string | https://gumucroyal.store/products/... |
| P | event_id | string | purchase_abc123_1717340000 |
| Q | confirmation_status | string | pending |
| R | notes | string | (manual field for team) |

Column Q `confirmation_status` = manual update by team (pending → confirmed → delivered → cancelled).

---

## Apps Script Code

File location in repo: `google-sheets/apps-script.js`

Deploy as **Web App**:
- Execute as: Me
- Who has access: Anyone

---

## Webhook Payload (Backend → Apps Script)

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "order_number": "GR-20260602-0042",
  "created_at": "2026-06-02T14:30:00Z",
  "customer_name": "فاطمة الزahrاء",
  "customer_phone": "06 12 34 56 78",
  "customer_phone_normalized": "212612345678",
  "products": "خاتم الرابط الأبدi x2 (عرض زوجي)",
  "items_count": 2,
  "subtotal_mad": 429.00,
  "upsell_accepted": true,
  "upsell_product": "قلادة البرسيم المضiء",
  "upsell_amount_mad": 69.00,
  "total_mad": 498.00,
  "payment_method": "COD",
  "status": "completed",
  "source_url": "https://gumucroyal.store/products/bague-lien-eternel",
  "event_id": "purchase_abc123_1717340000"
}
```

---

## Backend Service

```python
# app/services/sheets_service.py
import httpx
from app.config import settings

async def sync_order_to_sheet(order_data: dict) -> bool:
    payload = {
        "secret": settings.GOOGLE_SHEETS_WEBHOOK_SECRET,
        **order_data,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.GOOGLE_SHEETS_WEBHOOK_URL,
                json=payload,
            )
            return response.status_code == 200
    except Exception as e:
        # Log error, don't fail order confirmation
        logger.error(f"Sheet sync failed: {e}")
        return False
```

**Important:** Sheet sync failure should NOT block order confirmation. Log and retry later (optional queue).

---

## Setup Instructions (Manual)

1. Create Google Sheet with columns from template
2. Extensions → Apps Script → paste `apps-script.js`
3. Set `WEBHOOK_SECRET` in script Properties
4. Deploy → New deployment → Web app
5. Copy Web App URL → `GOOGLE_SHEETS_WEBHOOK_URL` in backend env
6. Test with sample POST

---

## CSV Files in Repo

- `google-sheets/sheet-template.csv` — headers only
- `google-sheets/orders-sample.csv` — 2 example rows

---

## Retry Strategy (Optional MVP+)

If webhook fails:
- Store `sheet_synced = false`
- Background task retries every 5 min (cron or manual admin endpoint)
- Admin endpoint: `POST /api/v1/admin/retry-sheets` (protected by API_SECRET_KEY)
