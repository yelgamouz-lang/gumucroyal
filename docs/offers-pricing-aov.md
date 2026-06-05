# Offers, Pricing & AOV Strategy — GUMÜÇROYAL

## Philosophie pricing

- **Prix premium** justifié par preuves (matériaux, garantie, brand)
- **Prix barré** toujours visible (ancrage psychologique)
- **Bundles** pour pousser AOV — default = offer du milieu
- **Discount UNIQUE** = upsell post-checkout à **69 MAD** seulement
- Jamais de coupon code, jamais de promo site-wide

---

## Grille tarifaire

### Produit 1 — Bague Lien Éternel (base: 249 MAD)

| Offer | Qty | Prix | Prix/unité | Économie | Label AR |
|-------|-----|------|------------|----------|----------|
| single | 1 | 249 MAD | 249 | — | قطعة واحدة |
| duo ⭐ DEFAULT | 2 | 429 MAD | 214.5 | 69 MAD | عرض زوجي — الأكثر طلباً |
| trio | 3 | 549 MAD | 183 | 198 MAD | عرض العائلة — أفضل قيمة |

### Produit 2 — Collier Trèfle de Lumière (base: 279 MAD)

| Offer | Qty | Prix | Prix/unité | Économie | Label AR |
|-------|-----|------|------------|----------|----------|
| single | 1 | 279 MAD | 279 | — | قطعة واحدة |
| duo ⭐ DEFAULT | 2 | 479 MAD | 239.5 | 79 MAD | عرض زوجي — الأكثر طلباً |
| trio | 3 | 599 MAD | 199.7 | 238 MAD | عرض العائلة — أفضل قيمة |

### Produit 3 — Bague Double Signature (base: 229 MAD)

| Offer | Qty | Prix | Prix/unité | Économie | Label AR |
|-------|-----|------|------------|----------|----------|
| single | 1 | 229 MAD | 229 | — | قطعة واحدة |
| duo ⭐ DEFAULT | 2 | 389 MAD | 194.5 | 69 MAD | عرض زوجي — الأكثر طلباً |
| trio | 3 | 499 MAD | 166.3 | 188 MAD | عرض العائلة — أفضل قيمة |

---

## Offer Selector UI Spec

```
┌─────────────────────────────────────────────┐
│  ○  قطعة واحدة          249 د.م.           │
├─────────────────────────────────────────────┤
│  ●  عرض زوجي ⭐          429 د.م.           │  ← DEFAULT SELECTED
│     وفر 69 د.م. | 214.5 د.م./قطعة          │
├─────────────────────────────────────────────┤
│  ○  عرض العائلة          549 د.م.           │
│     وفر 198 د.م. | 183 د.م./قطعة           │
└─────────────────────────────────────────────┘

[  أضيفي للسلة — 429 د.م.  ]  ← CTA shows selected offer price
```

- Offer sélectionné = border gold + background subtle
- Badge "⭐ الأكثر طلباً" sur offer duo
- Badge "أفضل قيمة" sur offer trio
- CTA text dynamique avec prix offer sélectionné

---

## Cross-sells (Cart Drawer)

Quand un produit est dans le cart, afficher les 2 autres:

```
┌──────────────────────────────────────────┐
│  🛒 سلتك (1)                             │
│  ─────────────────────────────────────── │
│  [img] Bague Lien Éternel x2    429 د.م. │
│  ─────────────────────────────────────── │
│  💡 Clients ont aussi acheté:            │
│  ┌────────┐  ┌────────┐                  │
│  │ Collier│  │ Bague  │                  │
│  │ Trèfle │  │ Double │                  │
│  │ 279 د.م│  │ 229 د.م│                  │
│  │ [+ أضف]│  │ [+ أضف]│                  │
│  └────────┘  └────────┘                  │
│  ─────────────────────────────────────── │
│  المجموع: 429 د.م.                       │
│  [  تأكيد الطلب  ]                       │
└──────────────────────────────────────────┘
```

- Cross-sell add = ajoute avec offer **single** par défaut
- Click sur image cross-sell = ouvre product page dans nouvel onglet (optional) ou modal
- Recalcul total instantané

---

## Upsell Post-Checkout (SEUL DISCOUNT)

| Paramètre | Valeur |
|-----------|--------|
| Prix upsell | **69 MAD** (fixe) |
| Durée affichage | 10-15 secondes (configurable, default 12s) |
| Trigger | Après validation formulaire checkout |
| Produit | Complémentaire au produit principal commandé |
| Mapping | Voir table ci-dessous |
| Skip | "لا شكراً" — timer expire = auto skip |
| Accept | "نعم، أضيفي!" — ajoute au order, update total |

### Upsell mapping

| Produit commandé | Upsell proposé | Prix normal | Prix upsell |
|------------------|----------------|-------------|-------------|
| Bague Lien Éternel | Collier Trèfle (single) | 279 MAD | **69 MAD** |
| Collier Trèfle | Bague Lien Éternel (single) | 249 MAD | **69 MAD** |
| Bague Double Signature | Collier Trèfle (single) | 279 MAD | **69 MAD** |
| Multi-produits | Produit le moins cher non commandé | varies | **69 MAD** |

### Upsell UI

```
┌─────────────────────────────────────────────┐
│  ⏱️  عرض خاص — 12 ثانية                    │
│  ─────────────────────────────────────────  │
│  [img]  Collier Trèfle de Lumière           │
│  أضيفي هاد القلادة بثمن استثنائي!          │
│  ~~279 د.م.~~  →  69 د.م. فقط!             │
│  ─────────────────────────────────────────  │
│  [  نعم، أضيفي!  ]    [  لا شكراً  ]        │
│  ████████████░░░░  12s                      │
└─────────────────────────────────────────────┘
```

---

## AOV Calculation Examples

| Scénario | AOV estimé |
|----------|-----------|
| Single product, single offer | ~250 MAD |
| Single product, duo offer (default) | ~430 MAD |
| Product + cross-sell single | ~500 MAD |
| Duo offer + upsell accept | ~500 MAD |
| Duo offer + cross-sell + upsell | ~700+ MAD |

**Target AOV: >350 MAD** avec default offer duo.

---

## Order total calculation

```python
# Backend logic
subtotal = sum(item.offer_price * item.quantity for item in cart_items)
upsell_amount = 69.00 if upsell_accepted else 0.00
shipping = 0.00  # Livraison gratuite (inclus dans prix premium)
total = subtotal + upsell_amount + shipping
```

Livraison **gratuite** partout au Maroc — argument CRO ("توصيل مجاني").

---

## Data model (offers)

```sql
-- Voir database-schema.md pour DDL complet
offers (
  id, product_id, slug, label_ar, quantity,
  price_mad, compare_at_price_mad, is_default, sort_order
)
```

Seed data avec toutes les offers ci-dessus.
