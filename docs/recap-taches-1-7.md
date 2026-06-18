# GUMÜÇ Royal — Récapitulatif des tâches 1 à 7

> Objectif global : élever le site au niveau d'une maison de joaillerie premium internationale,
> qui inspire confiance et convertit le trafic froid (Snapchat / TikTok / Meta), sur **desktop et mobile**,
> avec une **persuasion 100 % honnête** (aucun faux avis, prix barré, timer ou compteur).
> Contraintes transverses respectées : RTL arabe + FR/EN cohérents, composants partagés,
> responsive, panier / offres 1-2-3 / webhook commandes intacts.

---

## TÂCHE 1 — Correction des bugs critiques (priorité absolue)

### 1A. Lettres latines collées dans des mots arabes
Correction de toutes les occurrences de lettres latines isolées à l'intérieur de mots arabes
(elles détruisaient la confiance des clientes marocaines).

- `قلادة البرسيم المضiء` → `قلادة البرسيم المضيء`
- `خاتم التوقيع المزdوج` → `خاتم التوقيع المزدوج`
- `فاطمة الزahrاء` → `فاطمة الزهراء`, `خاتم الرابط الأبدi` → `خاتم الرابط الأبدي`, `نconfirmiw` → `نأكّدو`, etc.

**Fichiers** : `backend/app/bootstrap.py`, `backend/alembic/versions/001_initial_schema.py`,
`docs/google-sheets-integration.md`, `docs/pages-structure.md`, `docs/icp-copywriting.md`,
`google-sheets/orders-sample.csv`, `index.html`, données produits frontend.

### 1B. WhatsApp — numéro factice supprimé
Le numéro `212600000000` est remplacé par la variable d'environnement
`NEXT_PUBLIC_WHATSAPP_NUMBER`. Si elle est vide, **le lien WhatsApp est masqué**
(jamais de faux numéro).

**Fichiers** : `frontend/src/lib/whatsapp.ts` *(nouveau : `getWhatsAppNumber`, `hasWhatsApp`,
`getWhatsAppLink`)*, `frontend/Dockerfile` (suppression du défaut codé en dur),
+ tous les composants affichant WhatsApp (Footer, UI, Contact).

### 1C. Avis fantômes supprimés
Retrait complet de toute donnée et tout affichage de `rating` / `review_count` factices (847, 623…).
Aucun faux avis affiché tant qu'il n'y a pas de vrai système d'avis vérifiés.

**Fichiers** : `backend/app/models/product.py`, `backend/app/schemas/product.py`,
`backend/app/services/product_service.py`, `frontend/src/types/product.ts`,
`frontend/src/components/shared/UI.tsx` (suppression `SocialProofCounter`, `ReviewCard`…),
`frontend/src/i18n/*` (types, hooks, messages).

### 1D. Prix barré fantôme → argument honnête
`compare_at_price_mad` étant égal à `base_price_mad` (pas de vraie réduction), les bundles
n'affichent plus de réduction sous-entendue. L'avantage est reformulé en **avantage quantité** :
« زيدي قطعة ثانية بـ 69 د.م » / « كل قطعة إضافية بـ 69 د.م ». Aucun prix barré sans vraie promo.

**Fichiers** : `frontend/src/i18n/messages/{ar,fr,en}.json` (`offers.*`, `addPiece.*`).

---

## TÂCHE 2 — Header (desktop + mobile)

- Sélecteur de langue **AR / FR / EN intégré dans la barre du header** (plus d'élément flottant
  `fixed top-5 left-5`). Discret sur desktop, accessible sur mobile.
- **Badge panier** affiché uniquement si le panier contient réellement des articles (état réel,
  jamais « 1 » en dur). Panier vide = pas de badge.

**Fichiers** : `frontend/src/components/layout/Header.tsx`,
suppression de `frontend/src/components/layout/GlobalLanguageSwitcher.tsx`,
`frontend/src/components/providers/AppProviders.tsx`.

---

## TÂCHE 3 — Hero accueil (desktop + mobile)

Vidéo de fond + logo conservés. Copy réécrit pour annoncer le **« quoi + bénéfice »** en 3 secondes :

- Eyebrow : « دار مجوهرات مغربية · الدفع عند الاستلام »
- H1 : « مجوهرات تليق بيكِ، بريق ما كيتبهدلش »
- Sous-titre : « فولاذ مطلي بالذهب — أناقة كل يوم، توصلك لباب دارك، والخلاص منين توصل. »
- Versions FR/EN équivalentes.
- Bouton hero → **`/collection/signature`** (au lieu de `/collection` floue).
- **Hauteur du hero réduite sur mobile** (`min-h-[72dvh]`) pour révéler le début de la section
  suivante, sous-titre non coupé.

**Fichiers** : `frontend/src/components/pages/HomePageClient.tsx`,
`frontend/src/i18n/messages/{ar,fr,en}.json` (`home.heroEyebrow/heroTitle/heroSubtitle`).

---

## TÂCHE 4 — Page produit (cœur de conversion)

### 4A. Galerie multi-photos
`ProductGallery` refait : **carousel swipe + points sur mobile**, **image principale + miniatures
sur desktop**. Support de plusieurs images par produit, **placeholder propre** si image manquante,
**image principale en priorité**, les autres en **lazy**.
`PRODUCT_PHOTOS` accepte désormais un **tableau d'images par produit** (principale + angles + photo portée).

### 4B. Section Objections (remplace le 2ᵉ bloc répétitif)
Le second bloc « bénéfices » (acier/zircon, redondant) est remplacé par une section honnête
**« باش تكوني مطمئنة »** avec 3 Q/R :
- « واش غادي يتبهدل؟ » → « لا. فولاذ 316L مطلي، ما كيصدّاش وما كيخضّرش اليد. »
- « واش هاد الثمن حقيقي؟ » → « نعم — بريق الذهب، بلا ثمن الذهب. »
- « واش نقدر نرجّع؟ » → **placeholder `TEXTE_POLITIQUE_RETOUR`** (à compléter).

### 4C. Réassurance COD au formulaire
Bloc visible « 🔒 ما كنطلبو منك حتى خلاص دابا. كتخلّصي غير منين يوصلك الطلب لباب دارك. »
(FR : « Vous ne payez rien maintenant. Réglez seulement à la réception, chez vous. »)
ajouté **au-dessus des champs nom + téléphone + ville** du checkout, et dans le bloc de fin de page
produit (qui était vide).

### 4D. FAQ
La 1ʳᵉ question **« كيفاش نقدر نطلب؟ »** est ajoutée en tête et **dépliée par défaut** ;
les autres restent en accordéon.

### 4E. Logique préservée
Sélecteur d'offre 1/2/3, drawer panier + upsell +69 DH, date de livraison et réassurance COD
existante : **non modifiés**.

**Fichiers** : `frontend/src/components/product/ProductComponents.tsx` (galerie),
`frontend/src/components/product/ProductPageClient.tsx`,
`frontend/src/components/checkout/CheckoutFlow.tsx`,
`frontend/src/components/shared/UI.tsx` (`FAQItem` `defaultOpen`),
`frontend/src/i18n/I18nProvider.tsx` (`useProductObjections`),
`frontend/src/i18n/messages/{ar,fr,en}.json` (`productPage.objectionsTitle`, `productObjections`,
`checkout.codReassurance`, `productFaq`), suppression de `Steel316LSection.tsx`.

---

## TÂCHE 5 — Home : cohérence visuelle & sections

- Les 2 cartes « portes d'entrée » (Héritage / Signature) sont préparées pour un **même niveau
  visuel premium** : la carte Héritage reçoit une **image dédiée sombre** (`cardImage`
  = `/Produit/heritage-card.jpg`) avec **fallback automatique** tant que le fichier n'est pas fourni
  (aucune image cassée).
- **Affectations collections vérifiées** : Collier Trèfle = `heritage`, Bague Lien Éternel &
  Bague Double Signature = `signature`. Ajout d'un **backfill de la collection** côté API pour que
  les pages collection fonctionnent même si le backend ne renvoie pas encore le champ.
- Sections conservées : best-sellers, La Maison, engagement, réassurance COD.

**Fichiers** : `frontend/src/lib/collectionConfig.ts`,
`frontend/src/components/home/CollectionGateway.tsx`, `frontend/src/lib/products.ts`.

---

## TÂCHE 6 — Footer

- Nouvelle colonne **« Informations »** : Politique de confidentialité (`/privacy`),
  Conditions de vente (`/terms`), Livraison & retours (`/shipping-returns`). Bilingue AR/FR/EN.
- **3 pages créées** depuis un composant partagé `LegalPageClient`, avec **placeholder TEXTE**
  (aucun contenu juridique inventé) et `robots: { index: false }` tant que le vrai texte n'est pas posé.
- WhatsApp footer : reste **piloté par l'environnement** et masqué si vide (cf. 1B).

**Fichiers** : `frontend/src/components/layout/Footer.tsx`,
`frontend/src/components/pages/LegalPageClient.tsx` *(nouveau)*,
`frontend/src/app/{privacy,terms,shipping-returns}/page.tsx` *(nouveaux)*,
`frontend/src/i18n/messages/{ar,fr,en}.json` (`footer.*`, bloc `legal`).

---

## TÂCHE 7 — Performance (mobile 4G d'abord)

- **Polices réduites de 5 → 2 familles** : **Cormorant Garamond** (display latin + prix) +
  **Tajawal** (arabe titres + corps). Supprimé Playfair, Amiri, DM Sans. Les variables CSS
  héritées sont **aliasées** pour ne rien casser ; le corps latin tombe sur la pile système.
  → moins de fichiers de police téléchargés, **LCP mobile allégé**.
- **Vidéos hero** : la vidéo inactive ne précharge plus sur desktop (`preload="none"`) ;
  respect de **`prefers-reduced-motion`** (pas d'autoplay, poster statique conservé).
  Poster en `fetchPriority="high"` (LCP), vidéos en lazy/poster.
- **Images** : toutes en `next/image` (`OptimizedImage`), lazy hors écran, formats modernes
  (seul le poster hero reste un `<img>` volontaire, préchargé pour le LCP).
- **`prefers-reduced-motion`** : règle globale neutralisant hover-zoom, transitions,
  animations en boucle et smooth-scroll.

**Fichiers** : `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`,
`frontend/src/components/home/HeroVideoBackground.tsx`.

---

## Sécurité & hygiène (contexte des sessions précédentes)

- Jetons checkout HMAC (`X-Checkout-Token`), Swagger/OpenAPI désactivés en production,
  BFF admin avec cookie HttpOnly, CSP sans `unsafe-eval`, `robots.txt` (Disallow `/admin`,
  `/thank-you`), script Google Sheets HMAC — commités et poussés.
- **Purge de `backend/gumucroyal.db`** de tout l'historique git (`git-filter-repo`).
- Production confirmée sur **PostgreSQL** (jamais SQLite).

---

## Restes à faire de ton côté

| Élément | Où |
| --- | --- |
| Remplacer `TEXTE_POLITIQUE_RETOUR` (objections produit) | `i18n/messages/{ar,fr,en}.json` → `productObjections` |
| Rédiger le contenu des pages légales puis retirer `robots: { index: false }` | `i18n` `legal.*` + `app/{privacy,terms,shipping-returns}/page.tsx` |
| Fournir l'image sombre `heritage-card.jpg` | `frontend/public/Produit/` |
| Ajouter les 3 angles + photo portée par produit | tableaux dans `frontend/src/lib/products.ts` (`PRODUCT_PHOTOS`) |
| Renseigner `NEXT_PUBLIC_WHATSAPP_NUMBER` | variables EasyPanel |

---

*Toutes les modifications ont été buildées avec succès (`next build`), commitées et poussées
sur `main` pour redéploiement EasyPanel.*
