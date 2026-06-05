# Tracking: Pixels + CAPI — GUMÜÇROYAL

> **Règle clé:** Web pixels = données brutes (NO hashing). CAPI = SHA256 hashed PII.

---

## Architecture Overview

```
Browser (Frontend)                    Server (Backend)
─────────────────                    ─────────────────
Meta Pixel (fbq)        ──┐
TikTok Pixel (ttq)      ──┼── event_id (shared) ──→  Meta CAPI
Snap Pixel (snaptr)     ──┘                          TikTok Events API
                                                     Snap CAPI
                              Same event_id = deduplication
```

---

## Event ID Generation (Dedup)

**Critical:** Same `event_id` must be used for browser pixel AND server CAPI.

```typescript
// frontend/src/lib/event-id.ts
export function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${eventName.toLowerCase()}_${random}_${timestamp}`;
}

// Usage: generate once per action, pass to pixel AND API
const eventId = generateEventId('Purchase');
fbq('track', 'Purchase', { ... }, { eventID: eventId });
// Also send eventId in POST /orders tracking field
```

---

## Deferred Pixel Loading (Performance)

Use Next.js `Script` with `strategy="lazyOnload"` — NOT `afterInteractive` for max perf.

```tsx
// components/tracking/PixelProvider.tsx
import Script from 'next/script';

export function PixelProvider() {
  return (
    <>
      {/* Meta Pixel — lazyOnload */}
      <Script id="meta-pixel" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s){...}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* TikTok Pixel — lazyOnload */}
      <Script id="tiktok-pixel" strategy="lazyOnload">
        {`
          !function(w,d,t){...}(window,document,'script',
          'https://analytics.tiktok.com/i18n/pixel/events.js');
          ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID}');
          ttq.page();
        `}
      </Script>

      {/* Snap Pixel — lazyOnload */}
      <Script id="snap-pixel" strategy="lazyOnload">
        {`
          (function(e,t,n){...})(window,document,'script',
          'https://sc-static.net/scevent.min.js');
          snaptr('init', '${process.env.NEXT_PUBLIC_SNAP_PIXEL_ID}');
          snaptr('track', 'PAGE_VIEW');
        `}
      </Script>
    </>
  );
}
```

**Why lazyOnload:** Pixels are NOT needed for first paint. Social traffic converts after scroll — 2-3s delay acceptable. Saves LCP.

---

## Web Pixel Events (NO Hashing)

### Event Map

| Action | Meta | TikTok | Snap |
|--------|------|--------|------|
| Page load | PageView | page() | PAGE_VIEW |
| Product view | ViewContent | ViewContent | VIEW_CONTENT |
| Add to cart | AddToCart | AddToCart | ADD_CART |
| Checkout open | InitiateCheckout | InitiateCheckout | START_CHECKOUT |
| Form valid | AddPaymentInfo | — | ADD_BILLING |
| Purchase | Purchase | CompletePayment | PURCHASE |

### Meta Pixel (Browser)

```typescript
// NO hashing on browser
export function trackMeta(eventName: string, params: object, eventId: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params, { eventID: eventId });
  }
}

// Purchase example
trackMeta('Purchase', {
  value: 429.00,
  currency: 'MAD',
  content_ids: ['GR-BLE-001'],
  content_type: 'product',
  num_items: 2,
}, eventId);
```

### TikTok Pixel (Browser)

```typescript
export function trackTikTok(eventName: string, params: object, eventId: string) {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, { ...params, event_id: eventId });
  }
}

// CompletePayment
trackTikTok('CompletePayment', {
  value: 429.00,
  currency: 'MAD',
  content_id: 'GR-BLE-001',
  content_type: 'product',
  quantity: 2,
}, eventId);
```

### Snap Pixel (Browser)

```typescript
export function trackSnap(eventName: string, params: object, eventId: string) {
  if (typeof window !== 'undefined' && window.snaptr) {
    // MUST set client_dedup_id explicitly for dedup with CAPI
    window.snaptr('track', eventName, {
      ...params,
      client_dedup_id: eventId,
    });
  }
}

// PURCHASE — also set transaction_id = order_number
trackSnap('PURCHASE', {
  price: 429.00,
  currency: 'MAD',
  item_ids: ['GR-BLE-001'],
  number_items: 2,
  transaction_id: 'GR-20260602-0042',
  client_dedup_id: eventId,
});
```

---

## CAPI (Server-Side) — WITH Hashing

### Hashing Utility (Backend)

```python
# app/services/tracking/hashing.py
import hashlib
import re

def sha256_hash(value: str) -> str:
    return hashlib.sha256(value.strip().lower().encode('utf-8')).hexdigest()

def hash_phone_e164(normalized_phone: str) -> str:
    """
    Input: 212612345678 (E.164 without +)
    Output: SHA256 hash
    """
    # Remove any non-digits, ensure country code
    digits = re.sub(r'\D', '', normalized_phone)
    return sha256_hash(digits)

def hash_name(name: str) -> str:
    """Lowercase, trim, hash — for fn field."""
    return sha256_hash(name.strip().lower())

def split_name(full_name: str) -> tuple[str, str]:
    """Split Arabic/full name into fn/ln for Meta."""
    parts = full_name.strip().split()
    fn = parts[0] if parts else full_name
    ln = parts[-1] if len(parts) > 1 else ''
    return hash_name(fn), hash_name(ln) if ln else None
```

### Phone Normalization for CAPI (Morocco)

```
User input:     0612345678
Normalized:     212612345678
Hashed:         SHA256("212612345678")

Meta ph field:  hash of "212612345678" (digits only, with country code, no +)
TikTok phone:   hash of "212612345678" (E.164 without +)
Snap ph:        hash of "212612345678"
```

**TikTok note:** Phone should include country code before hashing. E.164 format without `+`.

---

## Meta Conversions API (CAPI)

### Endpoint
```
POST https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token={TOKEN}
```

### Purchase Payload

```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1717340000,
    "event_id": "purchase_abc123_1717340000",
    "action_source": "website",
    "event_source_url": "https://gumucroyal.store/thank-you/GR-20260602-0042",
    "user_data": {
      "ph": ["<SHA256 of 212612345678>"],
      "fn": ["<SHA256 of first name>"],
      "ln": ["<SHA256 of last name>"],
      "client_ip_address": "196.206.xxx.xxx",
      "client_user_agent": "Mozilla/5.0...",
      "fbc": "fb.1.1717340000.AbCdEf",
      "fbp": "fb.1.1717340000.123456789",
      "country": ["<SHA256 of 'ma'>"]
    },
    "custom_data": {
      "currency": "MAD",
      "value": 429.00,
      "content_ids": ["GR-BLE-001"],
      "content_type": "product",
      "num_items": 2,
      "order_id": "GR-20260602-0042"
    }
  }]
}
```

**Hashing rules (Meta):**
- `ph`: remove symbols, letters, leading zeros. Include country code. Then SHA256.
- `em`: lowercase, trim, SHA256 (if email available — we don't have email MVP)
- `fn`, `ln`: lowercase, SHA256
- `country`: lowercase ISO 3166-1 alpha-2, SHA256 → `"ma"`
- `client_ip_address`, `client_user_agent`, `fbc`, `fbp`: **DO NOT HASH**

---

## TikTok Events API

### Endpoint
```
POST https://business-api.tiktok.com/open_api/v1.3/event/track/
Headers: Access-Token: {TOKEN}
```

### CompletePayment Payload

```json
{
  "event_source": "web",
  "event_source_id": "{PIXEL_ID}",
  "data": [{
    "event": "CompletePayment",
    "event_time": 1717340000,
    "event_id": "purchase_abc123_1717340000",
    "user": {
      "phone": "<SHA256 of 212612345678>",
      "ttclid": "E.C.P.xxx",
      "ip": "196.206.xxx.xxx",
      "user_agent": "Mozilla/5.0..."
    },
    "page": {
      "url": "https://gumucroyal.store/thank-you/GR-20260602-0042",
      "referrer": "https://gumucroyal.store/products/bague-lien-eternel"
    },
    "properties": {
      "currency": "MAD",
      "value": 429.00,
      "contents": [{
        "content_id": "GR-BLE-001",
        "content_type": "product",
        "content_name": "Bague Lien Éternel",
        "quantity": 2,
        "price": 214.50
      }]
    }
  }]
}
```

**TikTok hashing:**
- Phone: E.164 without `+`, then SHA256 lowercase hex
- Email: lowercase trim SHA256 (if available)
- `ttclid`: NOT hashed — pass from frontend cookie/URL
- Same `event_id` as browser pixel for dedup (48h window)

---

## Snapchat Conversions API

### Endpoint
```
POST https://tr.snapchat.com/v2/conversion
Headers: Authorization: Bearer {TOKEN}
```

### PURCHASE Payload (CAPI v3 style)

```json
{
  "pixel_id": "{PIXEL_ID}",
  "timestamp": "1717340000000",
  "event_type": "PURCHASE",
  "event_conversion_type": "WEB",
  "event_id": "purchase_abc123_1717340000",
  "page_url": "https://gumucroyal.store/thank-you/GR-20260602-0042",
  "user_agent": "Mozilla/5.0...",
  "hashed_phone_number": "<SHA256 of 212612345678>",
  "client_dedup_id": "purchase_abc123_1717340000",
  "transaction_id": "GR-20260602-0042",
  "price": "429.00",
  "currency": "MAD",
  "item_ids": ["GR-BLE-001"],
  "number_items": "2"
}
```

**Snap dedup rules:**
- Browser: `client_dedup_id` = event_id (MUST set explicitly, not auto-generated)
- CAPI: `event_id` = same value as browser `client_dedup_id`
- PURCHASE: also set `transaction_id` (browser) = `order_id`/`transaction_id` (CAPI)
- Phone: normalize (country code, remove +, spaces, leading 0) THEN SHA256
- **Snap requires hashed phone OR hashed email for all events**

---

## Deduplication Summary

| Platform | Browser param | Server param | Window |
|----------|--------------|--------------|--------|
| Meta | `eventID` in fbq | `event_id` in payload | 48h |
| TikTok | `event_id` in ttq.track | `event_id` in payload | 48h |
| Snap | `client_dedup_id` in snaptr | `event_id` in CAPI | 48h |

**Implementation checklist:**
- [ ] Generate `event_id` once per user action
- [ ] Pass to browser pixel immediately
- [ ] Store in order record (`orders.event_id`)
- [ ] Send same ID in CAPI on confirm
- [ ] Snap: also set `client_dedup_id` on browser = `event_id`
- [ ] Snap PURCHASE: `transaction_id` = `order_number`

---

## Click ID Capture (Frontend)

```typescript
// lib/tracking-cookies.ts
export function getTrackingParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    fbc: getCookie('_fbc') || params.get('fbclid') ? `fb.1.${Date.now()}.${params.get('fbclid')}` : undefined,
    fbp: getCookie('_fbp'),
    ttclid: params.get('ttclid') || getCookie('ttclid'),
    sc_click_id: params.get('ScCid') || getCookie('_scid'),
  };
}
```

Store in sessionStorage, attach to order POST.

---

## Event Firing Sequence

| Step | Browser Event | Server Event |
|------|--------------|--------------|
| Product page load | ViewContent | — |
| Add to cart | AddToCart | — |
| Checkout open | InitiateCheckout | — |
| Form valid | AddPaymentInfo | — |
| Order confirm | Purchase | Purchase (all 3 CAPI) |
| Thank you page | Purchase (backup fire with same event_id) | — |

**Purchase fires ONCE with same event_id.** Thank you page can re-fire browser Purchase with same event_id (Meta deduplicates). CAPI fires once from backend on confirm.

---

## Environment Variables

See `env-variables.md` for all pixel/CAPI tokens.

---

## Testing

1. Meta Events Manager → Test Events
2. TikTok Events Manager → Test Events  
3. Snap Pixel Helper browser extension
4. Verify dedup: same event_id in browser + server columns
5. Verify phone hash: use Meta's test hash tool

---

## Confirmed Requirements ✅

| Requirement | Status |
|-------------|--------|
| Web pixels NO hashing | ✅ Confirmed |
| CAPI WITH SHA256 hashing | ✅ Confirmed |
| Phone E.164 before hash | ✅ 212XXXXXXXXX |
| TikTok phone with country code | ✅ Required before hash |
| Snap requires phone or email hash | ✅ Phone from order |
| Deferred pixels (lazyOnload) | ✅ Confirmed |
| Deduplication via event_id | ✅ All 3 platforms |
| Snap client_dedup_id explicit | ✅ Must not auto-generate |
