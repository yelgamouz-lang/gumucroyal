# Pages Structure — GUMÜÇROYAL

## Routes

| Route | Page | Type |
|-------|------|------|
| `/` | Home | Marketing |
| `/collection` | Collection | Catalog |
| `/products/[slug]` | Product Landing | CRO Landing |
| `/about` | About Us | Trust |
| `/contact` | Contact Us | Trust |
| `/thank-you/[orderId]` | Thank You | Conversion |
| `/api/*` | — | Proxied to backend |

---

## Global Layout (toutes pages)

### Header (sticky)

```
┌─────────────────────────────────────────────────────────────┐
│  [●] GUMÜÇROYAL    الرئيسية | المجموعة | من نحن | تواصل  [🛒 2] │
└─────────────────────────────────────────────────────────────┘
```

**Spec:**
- Position: sticky top, z-index 50
- Background: `--brand-black` avec backdrop-blur
- Height: 64px desktop, 56px mobile
- Logo circle: 40px, bg `--brand-gold`, logo SVG/icon inside
- Text logo: "GUMÜÇROYAL", Playfair Display, white, tracking-widest
- Nav links: Tajawal, white/80, hover gold
- Cart icon: badge count, opens cart drawer
- Mobile: hamburger menu → slide drawer RTL
- RTL: logo à droite, cart à gauche

### Footer

```
┌─────────────────────────────────────────────────────────────┐
│  GUMÜÇROYAL                                                 │
│  فخامة تبان. جودة تبقى.                                    │
│  ─────────────────────────────────────────────────────────  │
│  المتجر          │  معلومات         │  تواصل               │
│  المجموعة        │  من نحن          │  WhatsApp: +212...   │
│  خواتم           │  سياسة الإرجاع   │  Email: ...          │
│  قلادات          │  شروط الاستخدام  │  Instagram           │
│                  │  سياسة الخصوصية  │  TikTok              │
│  ─────────────────────────────────────────────────────────  │
│  ✓ COD  ✓ Livraison 24-72h  ✓ Garantie 12 mois           │
│  ─────────────────────────────────────────────────────────  │
│  © 2026 GUMÜÇROYAL. جميع الحقوق محفوظة.                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Homepage (`/`)

### Section order

| # | Section | Layout | Content |
|---|---------|--------|---------|
| 1 | **Hero** | Full-width image bg + overlay text center | H1 brand, tagline, CTA → Collection |
| 2 | **Trust Bar** | Horizontal icons strip | COD, Livraison, Garantie, Qualité |
| 3 | **Featured Products** | 3-col grid (1 col mobile) | 3 product cards avec prix + CTA |
| 4 | **Brand Story teaser** | Text right + Image left (RTL: inverse) | "من نحن" snippet + link |
| 5 | **Best Seller** | Image left + Text right | Bague Lien Éternel highlight |
| 6 | **Science/Quality** | Center text + 4 icon cards | Acier 316L, Zircons, Dorure, Garantie |
| 7 | **Social Proof** | Review carousel | 6 avis rotatifs |
| 8 | **UGC Gallery** | Masonry grid 4-6 images | Placeholder photos |
| 9 | **Comparison** | Table GUMÜÇROYAL vs autres | Premium vs cheap vs traditional |
| 10 | **Final CTA** | Full-width dark bg | "اكتشفي مجموعتنا" + button |

### Hero spec
- Background: placeholder luxury jewelry image, dark overlay 60%
- H1: "GUMÜÇROYAL" + "فخامة تبان. جودة تبقى."
- Sub: "Bijouterie premium pour la femme marocaine exigeante"
- CTA primary: "اكتشفي المجموعة" → `/collection`
- CTA secondary: "شوفي الأكثر مبيعاً" → `/products/bague-lien-eternel`

---

## Collection Page (`/collection`)

| Element | Spec |
|---------|------|
| H1 | "مجموعتنا" |
| Sub | "3 قطع فريدة. تصميم حصري By GUMÜÇROYAL." |
| Filters | الكل \| خواتم (2) \| قلادات (1) |
| Sort | الأكثر مبيعاً (default) |
| Grid | 3 products, card avec image, nom, rating, prix, badge |
| Layout | 3 col desktop, 2 col tablet, 1 col mobile |

### Product Card
```
┌─────────────────────┐
│  [Image]            │
│  ⭐ Best Seller     │
│  Bague Lien Éternel │
│  ★★★★★ 4.9 (847)   │
│  ~~399~~ 249 د.م.  │
│  [  شوفي التفاصيل  ]│
└─────────────────────┘
```

---

## Product Page (`/products/[slug]`) — FULL LANDING

> Chaque product page = landing page CRO complète autonome (trafic ads direct).

### Section order (12+ sections)

| # | Section | Layout | CRO Element |
|---|---------|--------|-------------|
| 1 | **Product Hero** | Image gallery left + Info right (RTL inverse) | Stars, H1, sub, offer selector, CTA, trust bar, scarcity |
| 2 | **Problem/Agitate** | Text center, dark bg | Pain ICP en Darija |
| 3 | **Product Detail** | Image right + Text left | Features → Benefits |
| 4 | **Science/Ingredients** | 4 cards grid | Acier, Zircons, Dorure, Tests |
| 5 | **Lifestyle** | Full-width image | Placeholder lifestyle |
| 6 | **Social Proof Wall** | 6 review cards grid | Avis avec prénoms + villes |
| 7 | **Comparison Table** | 3 columns | GUMÜÇROYAL vs Cheap vs Traditional |
| 8 | **Unboxing Experience** | Image left + Text right | Boîte cadeau premium |
| 9 | **How It Works** | 3 steps horizontal | Commande → Livraison → Brille |
| 10 | **FAQ** | Accordion | 6-8 questions |
| 11 | **Repeat Offer** | Offer selector + CTA repeat | Same as hero |
| 12 | **Final CTA** | Dark bg, urgency | Scarcity + CTA |

### Image gallery
- Main image large + 3-4 thumbnails
- Swipe mobile
- Zoom on click (optional MVP)

### Sticky mobile bar
```
[ 429 د.م.  |  ★4.9  |  أضيفي للسلة  ]
```

---

## About Page (`/about`)

| Section | Content |
|---------|---------|
| Hero | "من نحن" + brand image |
| Story | Origine GUMÜÇROYAL, mission, vision |
| Values | 4 piliers: Qualité, Confiance, Élégance, Accessibilité |
| Process | Design → Matériaux → Contrôle qualité → Livraison |
| Numbers | +2,847 clients, 4.9/5, 12 mois garantie |
| Team/Craft | "Maison de joaillerie" narrative |
| CTA | → Collection |

Layout: alternance text/image chaque section.

---

## Contact Page (`/contact`)

| Element | Content |
|---------|---------|
| H1 | "تواصلي معنا" |
| WhatsApp CTA | Primary — "راسلينا على WhatsApp" (link wa.me) |
| Info | Email, horaires SAV (10h-20h) |
| FAQ quick | 3 questions top |
| Trust | "فريقنا كيجاوب f Darija" |

Pas de formulaire contact (WhatsApp only) — réduire friction.

---

## Thank You Page (`/thank-you/[orderId]`)

| Element | Content |
|---------|---------|
| H1 | "شكراً لثقتك! 🎉" |
| Order ID | GR-20260602-0042 |
| Summary | Produits + total |
| Next steps | "غادي نعيطو ليك باش نأكّدو" |
| WhatsApp | "عندك سؤال? راسلنا" |
| Social | "Partage experience dialk" (future UGC) |
| Pixel | Purchase event fire here |

---

## Alternating Layout Rule

**Desktop pattern (RTL):**
```
Section A: [Text (right/start)] [Image (left/end)]
Section B: [Image (right/start)] [Text (left/end)]
Section C: [Text (right/start)] [Image (left/end)]
...alternating
```

**Mobile:** Always stack — Text above Image (or Image above Text for visual break).

Appliquer sur: Home, About, Product pages, Contact.

---

## SEO Meta (chaque page)

```typescript
// Example product page meta
{
  title: 'خاتم الرابط الأبدي — GUMÜÇROYAL',
  description: 'Bague premium acier inoxydable doré or fin. Zircons taille brillant. Livraison COD Maroc.',
  openGraph: { images: [product.heroImage] },
}
```

Lang: `ar-MA`, dir: `rtl`.
