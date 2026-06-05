# CRO Strategy — GUMÜÇROYAL

> Objectif: **CRO 12/10** — maximiser conversion rate, AOV, confirmation rate, delivery rate.

---

## Funnel CRO Map

```
Trafic (TikTok/Snap/FB Ads + UGC)
    ↓
Landing (Home ou Product Page)
    ↓ ViewContent pixel
Scroll + Social Proof + Authority sections
    ↓
Offer Selection (bundle = AOV↑)
    ↓ AddToCart pixel
Cart Drawer + Cross-sells
    ↓ InitiateCheckout pixel
Checkout Popup (name + phone only)
    ↓
Post-submit Upsell (69 MAD, 10-15 sec) ← SEUL endroit discount
    ↓
Thank You Page
    ↓ Purchase pixel + CAPI
Order → Backend → Google Sheet + CAPI server
```

---

## Métriques cibles

| Métrique | Cible | Levier |
|----------|-------|--------|
| Landing → Add to Cart | >8% | Offer clarity, social proof above fold |
| Cart → Checkout open | >60% | Cross-sells, scarcity in drawer |
| Checkout → Submit | >75% | 2 fields only, trust badges, COD emphasis |
| Submit → Upsell accept | >25% | Relevance, timer, single discount |
| Confirmation rate (COD) | >70% | WhatsApp follow-up, order summary clarity |
| Delivery rate | >85% | Phone validation, city confirmation |
| AOV | >350 MAD | Bundles, cross-sells, upsell |

---

## CRO Elements par zone

### Above the fold (Product Page)
- [ ] Star rating + review count (★★★★★ 4.9 — 847 avis)
- [ ] H1 émotionnel + subheading bénéfice
- [ ] Hero image produit (placeholder temporaire)
- [ ] Prix barré + prix actuel + "économisez X MAD"
- [ ] Offer selector (1 / 2 / 3 pièces) — default = middle offer
- [ ] CTA primary sticky mobile
- [ ] Trust bar: COD | Livraison 24-72h | Garantie 12 mois
- [ ] Scarcity: "باقي X فقط f stock dial [ville]" (dynamic feel)

### Mid-page sections (alternance text/image)
1. **Problem/Agitate** — douleur ICP
2. **Solution/Product detail** — features → benefits
3. **Science/Ingredients** — acier 316L, zircons, dorure
4. **Before/After or Lifestyle** — image placeholder
5. **Social Proof wall** — 6+ avis avec photos
6. **Comparison table** — GUMÜÇROYAL vs bijoux cheap vs bijouterie
7. **Unboxing/Experience** — emballage cadeau
8. **FAQ accordion** — objections
9. **Final CTA block** — repeat offer + scarcity + countdown feel

### Sticky elements
- **Mobile:** Bottom bar [Prix | أضيفي للسلة]
- **Desktop:** CTA sidebar ou floating après scroll 50%

---

## Scarcity & Urgency (sans fake agressif)

| Type | Implementation | Où |
|------|----------------|-----|
| Stock limité | "باقي 12 فقط" (randomized 8-23) | Product page, cart |
| Ville | "3 commandes f Casablanca l-youm" | Product page |
| Timer soft | "Commande daba = livraison [date+2j]" | Checkout popup |
| Offer expiry | "Had l'offre disponible daba" | Offer selector |
| Upsell timer | Countdown 15 sec visuel | Post-checkout upsell |

**Règle:** Ne jamais utiliser fake countdown qui reset. Utiliser des scarcity basées sur stock/ville/livraison.

---

## Social Proof Types

1. **Star ratings** — partout (product, cart, checkout)
2. **Review cards** — prénom + ville + texte + photo optionnelle
3. **Order counter** — "+2,847 client satisfait" (static ou incrementé)
4. **UGC gallery** — grid photos clientes (placeholders)
5. **Trust logos** — COD badge, livraison, garantie icons
6. **Media mentions** — "Vu sur TikTok" style badges
7. **Live activity** — "فاطمة mn Rabat commandat daba" (rotating, subtle)

---

## Confirmation Rate Optimization (COD)

Le plus gros challenge COD Maroc = **confirmation**.

### Tactiques site:
- Phone validation stricte (06/07 only) → moins de fake orders
- Récap commande ultra clair avant submit
- "Ghadi n3ayto lik bach nconfirmiw" messaging
- WhatsApp icon: "Des questions? WhatsApp daba"
- Order summary avec produits + total en gros

### Tactiques post-order (backend):
- Envoyer order à Google Sheet immédiatement
- Colonne `confirmation_status` dans sheet
- (Future) WhatsApp API auto-confirmation — noter dans docs mais pas MVP

---

## Delivery Rate Optimization

- Valider format phone Maroc côté frontend ET backend
- Stocker phone en format normalisé `212XXXXXXXXX`
- Inclure `city` detection future (not MVP — seulement name + phone MVP)
- Order ID unique lisible: `GR-YYYYMMDD-XXXX`

---

## AOV Optimization (voir offers-pricing-aov.md)

- Default offer = bundle 2 (pas single)
- Cross-sells dans cart drawer
- Upsell post-checkout 69 MAD
- "Ajoute boîte cadeau premium" checkbox (+29 MAD) — optionnel MVP

---

## Mobile-First CRO

> 90%+ trafic TikTok/Snap = mobile

- Touch targets min 48px
- CTA full-width mobile
- Cart drawer (pas page séparée)
- Checkout popup (pas redirect)
- Images optimisées WebP, lazy load
- LCP < 2.5s (pixels deferred!)
- No horizontal scroll
- Font size min 16px (éviter zoom iOS)

---

## A/B Test backlog (post-launch)

| Test | Variante A | Variante B |
|------|-----------|-----------|
| Default offer | Single | Bundle 2 |
| Hero | Product seul | Product porté (lifestyle) |
| CTA color | Gold | Black |
| Scarcity | Stock number | Ville-based |
| Upsell timing | 10 sec | 15 sec |

---

## Analytics events à tracker

| Event | Pixel (browser) | CAPI (server) | Trigger |
|-------|-----------------|---------------|---------|
| PageView | ✓ | ✓ | Every page |
| ViewContent | ✓ | ✓ | Product page view |
| AddToCart | ✓ | ✓ | CTA click add to cart |
| InitiateCheckout | ✓ | ✓ | Checkout popup open |
| AddPaymentInfo | ✓ | ✓ | Form filled valid |
| Purchase | ✓ | ✓ | Order confirmed (post-upsell skip/accept) |
| UpsellAccepted | ✓ custom | ✓ custom | Upsell accepted |

Voir `tracking-pixels-capi.md` pour implémentation.
