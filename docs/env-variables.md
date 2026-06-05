# Environment Variables — GUMÜÇROYAL

---

## Frontend `.env.example`

```bash
# frontend/.env.example

# ─── API ───────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.gumucroyal.store

# ─── Brand ─────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://gumucroyal.store
NEXT_PUBLIC_BRAND_NAME=GUMÜÇROYAL
NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000

# ─── Meta (Facebook) Pixel — Browser only, NO hashing ──
NEXT_PUBLIC_META_PIXEL_ID=

# ─── TikTok Pixel — Browser only, NO hashing ─────────
NEXT_PUBLIC_TIKTOK_PIXEL_ID=

# ─── Snapchat Pixel — Browser only, NO hashing ───────
NEXT_PUBLIC_SNAP_PIXEL_ID=

# ─── Upsell Config ─────────────────────────────────
NEXT_PUBLIC_UPSELL_DURATION_SECONDS=12
NEXT_PUBLIC_UPSELL_PRICE_MAD=69

# ─── Analytics (optional) ──────────────────────────
# NEXT_PUBLIC_GA_ID=
```

### Notes Frontend

- All `NEXT_PUBLIC_*` are exposed to browser — never put secrets here
- Pixel IDs are public (safe in browser)
- `NEXT_PUBLIC_*` needed at **build time** for Docker — pass as build args
- WhatsApp number: format `212600000000` (no +)

---

## Backend `.env.example`

```bash
# backend/.env.example

# ─── App ───────────────────────────────────────────
APP_ENV=production
API_SECRET_KEY=change-me-to-random-64-char-string

# ─── Database ──────────────────────────────────────
# EasyPanel internal:
DATABASE_URL=postgresql+psycopg2://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal

# ─── CORS ──────────────────────────────────────────
CORS_ORIGINS=["https://gumucroyal.store","http://localhost:3000"]

# ─── Google Sheets Webhook ─────────────────────────
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=change-me-to-random-secret

# ─── Meta Conversions API (CAPI) ───────────────────
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=

# ─── TikTok Events API ─────────────────────────────
TIKTOK_PIXEL_ID=
TIKTOK_ACCESS_TOKEN=

# ─── Snapchat Conversions API ──────────────────────
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=

# ─── Upsell ────────────────────────────────────────
UPSELL_PRICE_MAD=69
```

### Notes Backend

- `DATABASE_URL`: use internal EasyPanel hostname `gumucroyal_database`
- CAPI tokens are **secrets** — backend only, never expose to frontend
- `META_PIXEL_ID` backend = same ID as `NEXT_PUBLIC_META_PIXEL_ID` frontend
- Same for TikTok and Snap pixel IDs

---

## Variable Mapping (Frontend ↔ Backend)

| Purpose | Frontend | Backend |
|---------|----------|---------|
| Meta Pixel ID | NEXT_PUBLIC_META_PIXEL_ID | META_PIXEL_ID |
| TikTok Pixel ID | NEXT_PUBLIC_TIKTOK_PIXEL_ID | TIKTOK_PIXEL_ID |
| Snap Pixel ID | NEXT_PUBLIC_SNAP_PIXEL_ID | SNAP_PIXEL_ID |
| API URL | NEXT_PUBLIC_API_URL | — |
| CAPI tokens | ❌ never | META_CAPI_ACCESS_TOKEN, etc. |

---

## EasyPanel Configuration Checklist

### Frontend Service Env + Build Args

```
NEXT_PUBLIC_API_URL=https://api.gumucroyal.store
NEXT_PUBLIC_SITE_URL=https://gumucroyal.store
NEXT_PUBLIC_BRAND_NAME=GUMÜÇROYAL
NEXT_PUBLIC_WHATSAPP_NUMBER=212XXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXX
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXX
NEXT_PUBLIC_SNAP_PIXEL_ID=XXXXXXXX
NEXT_PUBLIC_UPSELL_DURATION_SECONDS=12
NEXT_PUBLIC_UPSELL_PRICE_MAD=69
```

### Backend Service Env

```
APP_ENV=production
API_SECRET_KEY=<generate-random>
DATABASE_URL=postgresql+psycopg2://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal
CORS_ORIGINS=["https://gumucroyal.store"]
GOOGLE_SHEETS_WEBHOOK_URL=<apps-script-url>
GOOGLE_SHEETS_WEBHOOK_SECRET=<random-secret>
META_PIXEL_ID=<same-as-frontend>
META_CAPI_ACCESS_TOKEN=<from-meta-events-manager>
TIKTOK_PIXEL_ID=<same-as-frontend>
TIKTOK_ACCESS_TOKEN=<from-tiktok-events-manager>
SNAP_PIXEL_ID=<same-as-frontend>
SNAP_CAPI_ACCESS_TOKEN=<from-snap-ads-manager>
UPSELL_PRICE_MAD=69
```

---

## How to Get CAPI Tokens

### Meta (Facebook)
1. Meta Events Manager → Settings → Conversions API
2. Generate Access Token
3. Copy Pixel ID from Data Sources

### TikTok
1. TikTok Ads Manager → Events → Manage
2. Select Pixel → Settings → Generate Access Token
3. Copy Pixel Code (ID)

### Snapchat
1. Snap Ads Manager → Events Manager
2. Pixel → Settings → CAPI Token
3. Copy Pixel ID

---

## Security Notes

- Rotate CAPI tokens every 60-90 days
- Webhook secret: min 32 chars random
- API_SECRET_KEY: for future admin endpoints
- Never commit `.env` files
- `.env.example` has empty values only
