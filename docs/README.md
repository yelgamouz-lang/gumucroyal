# GUMÜÇROYAL — Documentation Projet E-Commerce DTC

> **Marque:** GUMÜÇROYAL  
> **Marché:** Maroc (COD uniquement)  
> **Langue site:** Arabe (Darija marocaine pour le copy)  
> **Domaine:** `gumucroyal.store`  
> **API:** `api.gumucroyal.store`  
> **Database:** `GUMÜÇROYAL` (PostgreSQL, internal: `gumucroyal`)

---

## Objectif du projet

Construire un **store DTC branded premium** qui vend 3 produits bijouterie en dropshipping **à prix élevé**, mais avec une expérience qui donne l'impression d'une **marque propriétaire** — pas un site dropshipping générique.

Priorités: **authority, trust, CRO 12/10, AOV max, confirmation rate max, delivery rate max**.

---

## Index des documents

| # | Fichier | Contenu |
|---|---------|---------|
| 1 | [brand-positioning.md](./brand-positioning.md) | Positionnement, promesse, différenciation, tone of voice |
| 2 | [icp-copywriting.md](./icp-copywriting.md) | ICP Maroc, pain points, copy Darija, émotions, proof |
| 3 | [cro-strategy.md](./cro-strategy.md) | CRO global, scarcity, social proof, confirmation/delivery |
| 4 | [products-catalog.md](./products-catalog.md) | 3 produits, SKUs, descriptions, images, placements |
| 5 | [pages-structure.md](./pages-structure.md) | Home, About, Contact, Collection, Product pages |
| 6 | [offers-pricing-aov.md](./offers-pricing-aov.md) | Bundles, AOV, pricing strategy, upsell 69 MAD |
| 7 | [checkout-cart-flow.md](./checkout-cart-flow.md) | Cart drawer, checkout popup, upsell, thank you |
| 8 | [design-system.md](./design-system.md) | Couleurs, typo, layout, responsive, sections |
| 9 | [frontend-architecture.md](./frontend-architecture.md) | Next.js, React, Tailwind, structure dossiers |
| 10 | [backend-architecture.md](./backend-architecture.md) | FastAPI, services, migrations auto |
| 11 | [database-schema.md](./database-schema.md) | Tables, relations, migrations Alembic |
| 12 | [api-specification.md](./api-specification.md) | Endpoints REST, payloads, validation |
| 13 | [tracking-pixels-capi.md](./tracking-pixels-capi.md) | FB/TikTok/Snap pixels + CAPI + dedup + hashing |
| 14 | [google-sheets-integration.md](./google-sheets-integration.md) | Webhook, Apps Script, template colonnes, CSV |
| 15 | [coding-rules.md](./coding-rules.md) | Standards, conventions, skills AI coder |
| 16 | [docker-deployment.md](./docker-deployment.md) | Docker, EasyPanel, CI/CD GitHub |
| 17 | [env-variables.md](./env-variables.md) | Toutes les variables frontend + backend |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL 16 |
| Déploiement | Docker + EasyPanel |
| Orders export | Google Sheets via Apps Script webhook |
| Tracking | Meta Pixel + CAPI, TikTok Pixel + Events API, Snap Pixel + CAPI |

---

## Livrables attendus (AI Coder)

```
/
├── docs/                    ← CE DOSSIER (déjà créé)
├── frontend/                ← Next.js app
│   ├── Dockerfile
│   ├── docker-compose.yml (optionnel local)
│   ├── .env.example
│   └── ...
├── backend/                 ← FastAPI app
│   ├── Dockerfile
│   ├── alembic/
│   ├── .env.example
│   └── ...
├── google-sheets/
│   ├── apps-script.js       ← Code Google Apps Script
│   ├── sheet-template.csv   ← Colonnes template
│   └── orders-sample.csv    ← Exemple données
└── README.md                ← Setup global
```

---

## Ordre de lecture pour l'AI Coder

1. `README.md` (ce fichier)
2. `brand-positioning.md` + `icp-copywriting.md` (comprendre le WHY)
3. `products-catalog.md` + `offers-pricing-aov.md`
4. `pages-structure.md` + `design-system.md`
5. `checkout-cart-flow.md` + `cro-strategy.md`
6. `frontend-architecture.md` + `backend-architecture.md`
7. `database-schema.md` + `api-specification.md`
8. `tracking-pixels-capi.md` + `google-sheets-integration.md`
9. `coding-rules.md` + `docker-deployment.md` + `env-variables.md`

---

## Connection string PostgreSQL (EasyPanel internal)

```
postgres://gumucroyal:gumucroyal@gumucroyal_database:5432/gumucroyal?sslmode=disable
```

---

## Règles non-négociables

- **COD only** — pas de paiement carte en ligne
- **Arabe / Darija** — tout le copy visible client
- **Branded premium** — jamais l'air dropshipping
- **Upsell discount 69 MAD** — UNIQUEMENT post-checkout, durée 10-15 sec
- **Pixels deferred** — performance first
- **CAPI avec hashing SHA256** — phone normalisé E.164 `212XXXXXXXXX`
- **Web pixels sans hashing** — données brutes côté browser
- **Deduplication** — même `event_id` pixel + CAPI
- **Phone Maroc only** — validation stricte 06/07
- **Migrations auto** au démarrage backend
