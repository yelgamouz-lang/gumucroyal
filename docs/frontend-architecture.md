# Frontend Architecture — GUMÜÇROYAL

## Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.x | App Router, SSR/SSG, Image optimization |
| React | 19.x | UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | Cart + UI state |
| React Hook Form | 7.x | Checkout form |
| Zod | 3.x | Form validation |
| Lucide React | latest | Icons |
| Framer Motion | 11.x | Subtle animations (optional) |

---

## Folder Structure

```
frontend/
├── Dockerfile
├── docker-compose.yml          # local dev only
├── .env.example
├── .env.local                  # gitignored
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── logo.svg
│   ├── logo-circle.svg
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx          # Root: RTL, fonts, providers, deferred pixels
    │   ├── page.tsx            # Home
    │   ├── collection/
    │   │   └── page.tsx
    │   ├── products/
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── about/
    │   │   └── page.tsx
    │   ├── contact/
    │   │   └── page.tsx
    │   ├── thank-you/
    │   │   └── [orderId]/
    │   │       └── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   ├── MobileMenu.tsx
    │   │   └── TrustBar.tsx
    │   ├── product/
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGallery.tsx
    │   │   ├── OfferSelector.tsx
    │   │   ├── ProductHero.tsx
    │   │   └── ProductSections.tsx  # All landing sections
    │   ├── cart/
    │   │   ├── CartDrawer.tsx
    │   │   ├── CartItem.tsx
    │   │   └── CrossSellCard.tsx
    │   ├── checkout/
    │   │   ├── CheckoutPopup.tsx
    │   │   ├── CheckoutForm.tsx
    │   │   └── OrderSummary.tsx
    │   ├── upsell/
    │   │   └── UpsellModal.tsx
    │   ├── home/
    │   │   ├── HeroSection.tsx
    │   │   ├── FeaturedProducts.tsx
    │   │   ├── SocialProof.tsx
    │   │   ├── ScienceSection.tsx
    │   │   ├── ComparisonTable.tsx
    │   │   └── UGCGallery.tsx
    │   ├── shared/
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Stars.tsx
    │   │   ├── Price.tsx
    │   │   ├── ReviewCard.tsx
    │   │   ├── FAQAccordion.tsx
    │   │   ├── SectionWrapper.tsx   # Alternating layout helper
    │   │   ├── ScarcityBadge.tsx
    │   │   └── PhoneInput.tsx
    │   └── tracking/
    │       ├── PixelProvider.tsx
    │       ├── MetaPixel.tsx
    │       ├── TikTokPixel.tsx
    │       ├── SnapPixel.tsx
    │       └── trackEvent.ts
    ├── lib/
    │   ├── api.ts                # Backend API client
    │   ├── products.ts           # Product data (fetch from API or static)
    │   ├── placeholders.ts       # Temp image URLs
    │   ├── phone.ts              # Morocco phone validation
    │   ├── format.ts             # Price formatting MAD
    │   └── event-id.ts           # Generate dedup event IDs
    ├── stores/
    │   ├── cartStore.ts
    │   └── uiStore.ts
    ├── types/
    │   ├── product.ts
    │   ├── cart.ts
    │   └── order.ts
    └── hooks/
        ├── useCart.ts
        ├── useTracking.ts
        └── useUpsellTimer.ts
```

---

## Key Implementation Notes

### Root Layout (`layout.tsx`)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ar-MA" dir="rtl">
      <head>
        {/* Preconnect fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-brand-black text-text-primary font-tajawal">
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <CheckoutPopup />
        <UpsellModal />
        {/* Pixels loaded deferred — see tracking-pixels-capi.md */}
        <PixelProvider />
      </body>
    </html>
  );
}
```

### API Client

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.gumucroyal.store';

export async function createOrder(data: CreateOrderPayload): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE}/api/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Order creation failed');
  return res.json();
}
```

### Product Data Strategy

**MVP:** Fetch products from backend API `/api/v1/products` with static fallback.
Products seeded in DB via migration.

### Static Generation

- Product pages: `generateStaticParams` for 3 slugs
- Home, About, Contact: SSG
- Thank you: dynamic (client-side fetch order)

### next.config.ts essentials

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'gumucroyal.store' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID/INP | < 200ms |
| CLS | < 0.1 |
| Lighthouse Performance | > 85 mobile |

### How to achieve:
1. Pixels: `strategy="lazyOnload"` (see tracking doc)
2. Images: WebP, next/image, lazy except hero
3. Fonts: `display=swap`, subset Arabic
4. No heavy JS libraries
5. Code split per page
6. Zustand (not Redux)

---

## Environment Variables

See `env-variables.md` — frontend section.

---

## Docker

See `docker-deployment.md`.

```dockerfile
# Dockerfile summary
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Enable `output: 'standalone'` in next.config.ts for Docker.

---

## CORS

Backend must allow origin `https://gumucroyal.store` (and localhost for dev).

Frontend calls backend directly at `api.gumucroyal.store`.
