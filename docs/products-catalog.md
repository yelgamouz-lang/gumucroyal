# Products Catalog — GUMÜÇROYAL

## Vue d'ensemble

3 produits exclusifs, tous en **acier inoxydable doré à l'or fin** avec **zircons taille brillant**.

Chaque produit apparaît dans **plusieurs endroits** du site:
- Homepage (featured section)
- Collection page
- Cross-sells (autres produits)
- Cart drawer cross-sells
- Upsell post-checkout (produit complémentaire)

---

## Produit 1 — Bague Lien Éternel

| Champ | Valeur |
|-------|--------|
| **ID** | `bague-lien-eternel` |
| **SKU** | `GR-BLE-001` |
| **Nom FR** | Bague Lien Éternel By GUMÜÇ Royal |
| **Nom AR** | خاتم الرابط الأبدي — By GUMÜÇROYAL |
| **Catégorie** | bagues |
| **Prix base (1 unité)** | 249 MAD |
| **Prix barré** | 399 MAD |
| **Description courte** | Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. |
| **Description longue** | Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable doré à l'or fin — un éclat qui ne ternit jamais. |
| **Matériau** | Acier inoxydable 316L, dorure or fin 18K, zircons CZ taille brillant |
| **Taille** | Ajustable (ouvert) |
| **Images requises** | 4 minimum: hero, close-up, porté, packaging |
| **Placeholder images** | Unsplash/Picsum: `jewelry ring gold` themed |
| **Rating** | 4.9 / 5 (847 avis) |
| **Badge** | Best Seller |
| **Cross-sell avec** | Collier Trèfle de Lumière |
| **Upsell compatible** | Collier Trèfle (69 MAD en upsell) |

### Benefits bullets (AR)
- ✨ éclat diamant sans prix diamant
- 💎 pierre solitaire + zircons pavés
- 🔒 acier 316L — ma kaybehdelch
- 📐 taille ajustable — kayji l kolchi
- 🎁 boîte cadeau premium incluse

---

## Produit 2 — Collier Trèfle de Lumière

| Champ | Valeur |
|-------|--------|
| **ID** | `collier-trefle-lumiere` |
| **SKU** | `GR-CTL-002` |
| **Nom FR** | Collier Trèfle de Lumière By GUMÜÇ Royal |
| **Nom AR** | قلادة البرسيم المضيء — By GUMÜÇROYAL |
| **Catégorie** | colliers |
| **Prix base (1 unité)** | 279 MAD |
| **Prix barré** | 449 MAD |
| **Description courte** | Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. |
| **Description longue** | Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. L'élégance discrète qui se remarque, en acier inoxydable doré à l'or fin. |
| **Matériau** | Acier inoxydable 316L, dorure or fin 18K, zircons CZ |
| **Longueur** | 40cm + 5cm extender |
| **Images requises** | 4 minimum: hero, close-up trèfles, porté cou, flat lay |
| **Rating** | 4.8 / 5 (623 avis) |
| **Badge** | Porte-Bonheur |
| **Cross-sell avec** | Bague Double Signature |
| **Upsell compatible** | Bague Lien Éternel (69 MAD en upsell) |

### Benefits bullets (AR)
- 🍀 4 trèfles porte-bonheur pavés
- ✨ double chaîne délicate
- 💫 zircons étincelants taille brillant
- 🔒 acier inoxydable — résiste eau et transpiration
- 🎁 emballage cadeau premium

---

## Produit 3 — Bague Double Signature

| Champ | Valeur |
|-------|--------|
| **ID** | `bague-double-signature` |
| **SKU** | `GR-BDS-003` |
| **Nom FR** | Bague Double Signature By GUMÜÇ Royal |
| **Nom AR** | خاتم التوقيع المزدوج — By GUMÜÇROYAL |
| **Catégorie** | bagues |
| **Prix base (1 unité)** | 229 MAD |
| **Prix barré** | 369 MAD |
| **Description courte** | Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. |
| **Description longue** | Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. Forme ouverte ajustable, en acier inoxydable doré à l'or fin. |
| **Matériau** | Acier inoxydable 316L, dorure or fin 18K, zircons CZ |
| **Taille** | Ajustable (ouvert) |
| **Images requises** | 4 minimum: hero, angle side, porté, detail zircons |
| **Rating** | 4.9 / 5 (512 avis) |
| **Badge** | Nouveau |
| **Cross-sell avec** | Collier Trèfle de Lumière |
| **Upsell compatible** | Bague Lien Éternel (69 MAD en upsell) |

### Benefits bullets (AR)
- 💎 design architectural unique
- ✨ deux extrémités pavées de zircons
- 📐 forme ouverte ajustable
- 🔒 acier 316L hypoallergénique
- 🎁 boîte cadeau premium incluse

---

## Offers par produit (voir offers-pricing-aov.md)

Chaque produit a 3 offers:

| Offer ID | Label AR | Quantité | Prix | Économie |
|----------|----------|----------|------|----------|
| `{sku}-single` | قطعة واحدة | 1 | Prix base | — |
| `{sku}-duo` | عرض زوجي ⭐ | 2 | ~15% off | "وفر X د.م." |
| `{sku}-trio` | عرض العائلة | 3 | ~25% off | "وفر X د.م." |

**Default selected:** Offer duo (middle) pour max AOV.

---

## Placement produits sur le site

```
Homepage
├── Hero (brand, pas produit)
├── Featured Products (3 cards)
├── Best Seller highlight (Bague Lien Éternel)
├── Social Proof section (mix products)
├── Science/Quality section
├── UGC gallery (all products)
└── Final CTA → Collection

Collection Page (/collection)
├── Grid 3 products
├── Filter: الكل | خواتم | قلادات
└── Sort: الأكثر مبيعاً

Product Page (/products/[slug])
├── Full landing page (12+ sections)
└── Self-contained CRO page

Cart Drawer
├── Cross-sell: autres 2 produits
└── "Clients ont aussi acheté"

Checkout Upsell
└── Produit complémentaire à 69 MAD
```

---

## Images placeholder (temporaires)

Utiliser URLs placeholder jusqu'à remplacement par images client:

```typescript
// frontend/src/lib/placeholders.ts
export const PLACEHOLDER_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
  ring1: 'https://images.unsplash.com/photo-1605100804763-247f67b35585?w=800&q=80',
  ring2: 'https://images.unsplash.com/photo-1603561596112-067a23a47fc8?w=800&q=80',
  necklace: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  lifestyle: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  packaging: 'https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80',
  ugc1: 'https://images.unsplash.com/photo-1515562141202-7a88fb084127?w=400&q=80',
  ugc2: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&q=80',
};
```

Utiliser `next/image` avec `priority` sur hero seulement.

---

## JSON seed data (backend)

Fournir un seed script ou migration avec les 3 produits + offers.
Voir `database-schema.md` pour structure tables `products`, `offers`.
