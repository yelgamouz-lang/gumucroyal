# Coding Rules — GUMÜÇROYAL

> Règles pour l'AI Coder. Non-négociables.

---

## Principes généraux

1. **Lire tous les docs avant de coder** — suivre l'ordre dans README.md
2. **Minimize scope** — ne pas ajouter de features hors spec
3. **Match conventions** — code cohérent, même style partout
4. **RTL first** — tester chaque composant en arabe RTL
5. **Mobile first** — designer mobile puis desktop
6. **Performance** — pixels deferred, images optimisées
7. **No secrets in code** — tout via env variables

---

## Langue & Copy

- Tout texte UI visible = **Arabe** (avec Darija naturel)
- Code comments = **Anglais**
- Variables/fonctions = **Anglais**
- Docs API errors user-facing = **Arabe**
- Ne jamais afficher "dropshipping", "supplier", "AliExpress"

---

## Frontend Rules

### TypeScript
- Strict mode enabled
- No `any` — utiliser types définis dans `types/`
- Props interfaces pour chaque composant

### Components
- Un composant = un fichier
- Composants réutilisables dans `components/shared/`
- Pas de logique business dans les composants UI — hooks/stores

### Styling
- Tailwind CSS uniquement (pas de CSS modules sauf globals.css)
- Design tokens from `design-system.md`
- Pas de inline styles sauf dynamic values

### State
- Zustand pour cart + UI modals
- Pas de Redux, pas de Context API pour state global
- Persist cart dans localStorage

### Images
- `next/image` obligatoire
- Placeholders from `lib/placeholders.ts` until real images
- WebP preferred

### Forms
- React Hook Form + Zod validation
- Phone validation = même logic frontend ET backend
- Display errors en arabe

### API Calls
- Centraliser dans `lib/api.ts`
- Try/catch avec messages user-friendly
- Loading states sur tous les CTAs async

---

## Backend Rules

### Python
- Type hints everywhere
- Pydantic v2 for schemas
- Async endpoints where I/O (httpx for webhooks/CAPI)

### Structure
- Routes thin — logic in services
- Models = SQLAlchemy, Schemas = Pydantic (separate)
- No business logic in route handlers

### Database
- Alembic migrations for ALL schema changes
- Seed data in migration 002
- Auto-run migrations on startup

### Validation
- Phone: Morocco 06/07 ONLY — reject all others
- Normalize to `212XXXXXXXXX` before storage
- Name: strip, min 2 chars

### Security
- CORS restricted to gumucroyal.store
- Webhook secret validation for Sheets
- Never log raw phone numbers
- Hash PII only in CAPI service (not in DB)

### Error Handling
- HTTPException with Arabic detail for user errors
- Log internal errors with order_id, not PII

---

## Tracking Rules

- Generate `event_id` ONCE per action
- Browser pixels: NO hashing
- CAPI: SHA256 hash phone/name/country
- Phone hash input: `212612345678` (E.164 no plus)
- Same event_id browser + server
- Snap: explicit `client_dedup_id` on browser
- Pixels: `strategy="lazyOnload"` in Next.js Script

---

## Git Rules

- `.env` files gitignored
- `.env.example` committed with all vars (no values)
- Meaningful commit messages
- Separate frontend/ and backend/ folders

---

## Docker Rules

- Multi-stage build for frontend (standalone output)
- Backend: slim Python image
- Health checks configured
- No secrets baked into images

---

## Testing Checklist (Manual)

Before marking complete, verify:

- [ ] Home page loads RTL Arabic
- [ ] All 3 product pages complete with sections
- [ ] Offer selector works, default = duo
- [ ] Add to cart opens drawer
- [ ] Cross-sells add to cart
- [ ] Checkout popup: name + phone only
- [ ] Phone rejects invalid (05, 08, too short)
- [ ] Phone accepts 06, 07, +212 formats
- [ ] Upsell shows 12 sec with 69 MAD
- [ ] Upsell accept/skip both work
- [ ] Thank you page shows order
- [ ] Order saved in PostgreSQL
- [ ] Order sent to Google Sheet
- [ ] Meta/TikTok/Snap pixels fire (check console)
- [ ] CAPI fires on backend (check logs)
- [ ] Same event_id in pixel + CAPI
- [ ] Mobile responsive all pages
- [ ] Cart persists on refresh
- [ ] Docker builds succeed
- [ ] Migrations run on backend start

---

## Skills AI Coder Should Apply

1. **Next.js App Router** — SSG/SSR, layouts, Script component
2. **Tailwind CSS** — responsive, RTL support (`rtl:` variants)
3. **FastAPI** — async, Pydantic, SQLAlchemy
4. **PostgreSQL** — migrations, JSONB
5. **CRO UX** — scarcity, social proof, offer selectors
6. **Morocco e-commerce** — COD, phone validation, Darija copy
7. **Ad tracking** — Meta CAPI, TikTok Events API, Snap CAPI
8. **Docker** — multi-stage, EasyPanel deployment

---

## File Naming

```
Components:  PascalCase.tsx     (ProductCard.tsx)
Hooks:       camelCase.ts        (useCart.ts)
Utils:       camelCase.ts        (phone.ts)
Types:       camelCase.ts        (product.ts)
API routes:  snake_case.py       (orders.py)
Models:      snake_case.py       (order.py)
Migrations:  NNN_description.py  (001_initial_schema.py)
```

---

## Dependencies Policy

- Prefer well-maintained packages with large community
- No unnecessary dependencies
- Lock versions in package.json / requirements.txt

### Approved Frontend
next, react, react-dom, typescript, tailwindcss, zustand, react-hook-form, zod, lucide-react, framer-motion (optional)

### Approved Backend
fastapi, uvicorn, sqlalchemy, alembic, pydantic, pydantic-settings, httpx, psycopg2-binary, python-dotenv

---

## Do NOT

- ❌ Add user authentication / login
- ❌ Add payment gateway (COD only)
- ❌ Add admin dashboard (MVP)
- ❌ Add email collection field
- ❌ Add discount codes / coupons
- ❌ Add i18n switcher (Arabic only)
- ❌ Use Shopify/WooCommerce
- ❌ Hardcode API keys
- ❌ Skip phone validation on backend
- ❌ Hash data in browser pixels
- ❌ Send unhashed phone to CAPI
- ❌ Use `afterInteractive` for pixels (use `lazyOnload`)
