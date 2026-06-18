# Rapport d'audit de sécurité — GUMÜÇ Royal

**Date :** 16 juin 2026  
**Périmètre :** Code source (`E-COM`), configuration, dépendances, site live  
**URLs :** `https://gumucroyal.store` · `https://api.gumucroyal.store`  
**Méthode :** Revue statique du code + tests black-box sur la production (curl, headers, endpoints)

---

## Executive Summary

GUMÜÇ Royal est une boutique e-commerce **COD** (sans paiement carte). L'architecture est saine : Next.js + FastAPI + PostgreSQL, Cloudflare devant le frontend, recalcul des prix côté serveur, pas de sinks XSS évidents, pas d'upload de fichiers.

**Constat majeur : la production n'est pas alignée avec le code local.** Les correctifs récents (jetons checkout, BFF admin HttpOnly, OpenAPI désactivé, HMAC webhook, CSP renforcée) existent dans le dépôt mais **ne sont pas déployés**. Un attaquant qui inspecte la prod voit encore une surface d'attaque significative.

| Zone | Production (live) | Code source (local) |
|------|-------------------|---------------------|
| Auth commandes | Endpoints confirm/GET **sans token** (OpenAPI) | Jeton HMAC `X-Checkout-Token` |
| OpenAPI /docs | **Exposés** (HTTP 200) | Désactivés si `APP_ENV=production` |
| Admin session | Token Bearer direct sur l'API | Cookie HttpOnly via BFF `/api/admin/*` |
| CSP | `unsafe-eval` présent | `unsafe-eval` retiré en prod |
| robots.txt | `Disallow: /admin` seulement | + `Disallow: /thank-you` |

### Score de sécurité

| Environnement | Score |
|---------------|-------|
| **Production actuelle** | **62 / 100** |
| **Après deploy du code local + config prod correcte** | **~85 / 100** |
| **Avec durcissement réseau (Cloudflare WAF, IP admin, Redis, CAPTCHA)** | **~92 / 100** |

---

## Inspection live (perspective attaquant)

### Routes publiques confirmées

| URL | Statut | Notes |
|-----|--------|-------|
| `/` | 200 | Storefront Next.js, Cloudflare |
| `/admin` | 200 | Formulaire de login visible |
| `/thank-you/*` | 200 | Pas de `noindex` confirmé côté headers |
| `/sitemap.xml` | 404 | Absent |
| `/robots.txt` | 200 | Cloudflare Managed + `Disallow: /admin` |
| `/api/admin/session` | 404 | BFF admin **non déployé** |

### En-têtes HTTP (storefront)

Présents et corrects : `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP, `Server: cloudflare`.

Manques : pas de `Content-Security-Policy-Report-Only`, pas de `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy`.

### En-têtes HTTP (API)

Présents : HSTS, X-Frame-Options, nosniff, CSP `default-src 'none'`.  
**Fuite d'information :** `Server: uvicorn` exposé.

### Cookies (live)

Aucun cookie de session sur `/` ou `/admin` sans login. Pas de cookie HttpOnly admin visible (BFF absent en prod).

### OpenAPI / reconnaissance

```
GET https://api.gumucroyal.store/openapi.json → HTTP 200 (16 KB)
GET https://api.gumucroyal.store/docs         → HTTP 200
```

Le schéma OpenAPI expose **toute la surface API**, y compris les champs PII de `OrderOut` (nom, téléphone, ville) et les endpoints admin.

### Tests d'exploitation live

| Test | Résultat |
|------|----------|
| CORS depuis `https://evil.com` | **Bloqué** — `Disallowed CORS origin` |
| `POST /orders/{uuid}/confirm` sans token | `404 Order not found` (pas de 401 → **pas de jeton checkout en prod**) |
| `GET /orders/{order_number}` sans token | `404` (commande inexistante ; avec UUID valide = fuite PII en prod) |
| `POST /admin/login` credentials invalides | `401 Invalid credentials` — endpoint **public** |
| Analytics POST | Accepté (204) — endpoint public |

### Cloudflare

- Proxy actif (`CF-RAY`, `Server: cloudflare`)
- `robots.txt` enrichi par Cloudflare (Content-Signal, blocage bots IA)
- Pas de visibilité sur WAF/rate-limit edge depuis l'extérieur — **à configurer explicitement**

---

## Findings par domaine d'audit

---

### 1. Authentication & Authorization

#### CRITICAL — P1-LIVE : Commandes confirmables sans preuve de propriété (production)

| | |
|--|--|
| **Description** | En production, `POST /orders/{uuid}/confirm`, `PATCH /orders/{uuid}` et `GET /orders/{order_number}` n'exigent pas de jeton (confirmé via OpenAPI live + absence de 401 sans token). |
| **Scénario d'attaque** | Attaquant intercepte ou devine un UUID de commande → confirme la commande → sync Google Sheets + CAPI pub. Ou énumère les numéros de commande pour lire nom/téléphone/ville. |
| **Fichiers** | Prod : ancienne version. Fix local : `backend/app/services/checkout_auth.py`, `backend/app/api/v1/router.py`, `frontend/src/lib/checkoutToken.ts` |
| **Remédiation** | Déployer immédiatement le code avec jetons checkout. Vérifier post-deploy : confirm sans token → **401**. |

#### MEDIUM — Auth checkout en sessionStorage (code local)

| | |
|--|--|
| **Description** | Jeton checkout stocké en `sessionStorage` — vulnérable à XSS. |
| **Scénario** | XSS → vol du jeton → accès commande 24h. |
| **Fichiers** | `frontend/src/lib/checkoutToken.ts` |
| **Remédiation** | Migrer vers cookie HttpOnly `SameSite=Strict` émis par un BFF checkout. |

---

### 2. Admin Panel Security

#### HIGH — H1 : API admin directement accessible sur sous-domaine public

| | |
|--|--|
| **Description** | `POST /api/v1/admin/login` retourne un token Bearer JSON utilisable depuis n'importe quel client HTTP, contournant le BFF cookie. |
| **Scénario** | Brute-force distribué (5/min/IP contournable via IP spoof ou botnet) → accès à toutes les commandes + PII. |
| **Fichiers** | `backend/app/api/v1/admin.py`, `docs/docker-deployment.md` |
| **Remédiation** | IP allowlist Cloudflare/nginx sur `/api/v1/admin/*`. MFA. Ne pas exposer l'API admin publiquement si possible. |

#### MEDIUM — M6 : Page `/admin` publique sans gate réseau

| | |
|--|--|
| **Description** | `/admin` retourne HTTP 200 avec formulaire de login pour tout le monde. |
| **Scénario** | Reconnaissance, phishing clone, credential stuffing via BFF ou API directe. |
| **Fichiers** | `frontend/src/app/admin/page.tsx`, `frontend/src/middleware.ts` |
| **Remédiation** | Cloudflare Access ou IP allowlist sur `/admin` et `/api/admin/*`. |

#### LOW — Token admin 24h sans révocation (code local)

| | |
|--|--|
| **Fichiers** | `backend/app/services/admin_auth.py` |
| **Remédiation** | TTL 8h, denylist Redis au logout, MFA. |

**Bien sécurisé (code local, non déployé)** : BFF `/api/admin/login` → cookie `gumuc_admin_session` HttpOnly + Secure + SameSite=Strict.

---

### 3. API Security

#### CRITICAL — P2-LIVE : OpenAPI et Swagger exposés en production

| | |
|--|--|
| **Description** | `/docs` et `/openapi.json` retournent HTTP 200 avec schéma complet incluant admin et PII. |
| **Scénario** | Attaquant cartographie l'API en 1 requête, identifie endpoints non protégés, prépare exploits ciblés. |
| **Fichiers** | Fix local : `backend/app/main.py` |
| **Remédiation** | Déployer avec `APP_ENV=production`. Vérifier : `/docs` → 404. |

#### MEDIUM — Endpoints publics sans rate limit

| | |
|--|--|
| **Description** | `GET /products`, `GET /health` sans limite applicative. |
| **Scénario** | Scraping massif, charge DB. |
| **Fichiers** | `backend/app/api/v1/router.py`, `backend/app/api/v1/health.py` |
| **Remédiation** | Rate limit global + cache CDN Cloudflare sur `/products`. |

---

### 4. Database Security

#### CRITICAL — C1 : SQLite avec PII potentiellement dans git

| | |
|--|--|
| **Description** | `backend/gumucroyal.db` marqué modifié dans git — possible historique de PII clients. |
| **Scénario** | Accès repo → extraction noms/téléphones/villes. |
| **Fichiers** | `backend/gumucroyal.db`, `.gitignore` |
| **Remédiation** | `git rm --cached`, purge historique, audit accès repo. |

#### HIGH — H4 : Credentials Postgres faibles en dev

| | |
|--|--|
| **Description** | `gumucroyal:gumucroyal` dans `docker-compose.yml` avec port `5432:5432` exposé. |
| **Scénario** | Postgres exposé sur Internet + mot de passe par défaut → dump complet. |
| **Fichiers** | `docker-compose.yml`, `backend/.env.example` |
| **Remédiation** | Mots de passe générés, port non publié, TLS interne. |

**Bien sécurisé** : ORM SQLAlchemy exclusivement — pas d'injection SQL dynamique. Validation prod bloque SQLite (`backend/app/security_check.py`).

---

### 5. Environment Variables Exposure

#### LOW — NEXT_PUBLIC_* attendus et sûrs

Variables exposées dans le bundle : `NEXT_PUBLIC_API_URL`, pixels, WhatsApp, prix add-piece — **comportement normal**.

| Variable | Risque |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Public — OK |
| Pixels Meta/TikTok/Snap | Public — OK |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public — OK |

**Aucun secret backend** (`API_SECRET_KEY`, `ADMIN_PASSWORD`) dans le frontend.

---

### 6. Secrets and Credentials Exposure

#### HIGH — H3 : Script Google Sheets legacy avec secret en clair

| | |
|--|--|
| **Description** | `google-sheets/apps-script.js` compare `data.secret === expectedSecret` (secret dans chaque requête). Le script HMAC moderne est dans `docs/google-sheets-webhook.gs`. |
| **Scénario** | Mauvais script déployé → secret dans logs/proxies, replay possible. |
| **Fichiers** | `google-sheets/apps-script.js` vs `docs/google-sheets-webhook.gs` |
| **Remédiation** | Supprimer le legacy, déployer uniquement HMAC, rotation secret. |

**Bien sécurisé (code local)** : HMAC-SHA256 + timestamp 5 min, secret obligatoire (`backend/app/services/sheets_service.py`).

---

### 7. XSS Vulnerabilities

#### HIGH — H5 : CSP permissive en production live

| | |
|--|--|
| **Description** | Live : `script-src ... 'unsafe-inline' 'unsafe-eval'`. Code local retire `unsafe-eval` en prod. |
| **Scénario** | Injection script (supply chain, extension) → vol jeton checkout / manipulation admin. |
| **Fichiers** | `frontend/src/middleware.ts`, `frontend/src/components/tracking/PixelProvider.tsx` |
| **Remédiation** | Déployer middleware local. Nonces CSP pour pixels. |

**Bien sécurisé** : aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval()` dans le frontend. Rendu React text-only pour données utilisateur.

---

### 8. CSRF Vulnerabilities

#### LOW — Risque CSRF limité

| | |
|--|--|
| **Description** | API JSON + CORS strict (`Disallowed CORS origin` confirmé live pour `evil.com`). Admin cookie `SameSite=Strict` (code local BFF). |
| **Scénario** | CSRF classique cross-origin **mitigé** par CORS preflight. |
| **Remédiation** | Maintenir CORS sans wildcard. Token checkout en header (non automatique) renforce la protection. |

---

### 9. SQL/NoSQL Injection

#### INFORMATIONAL — Risque très faible

Requêtes ORM paramétrées uniquement. Path params (`slug`, `order_number`) via filtres SQLAlchemy. Pydantic valide les entrées.

**Remédiation** : Maintenir l'interdiction de SQL brut utilisateur.

---

### 10. File Upload Vulnerabilities

#### INFORMATIONAL — Aucune surface

Pas de `UploadFile`, pas de multipart handlers. **Aucun risque d'upload malveillant.**

---

### 11. Open Redirects

#### LOW — Redirects contrôlés

Middleware redirige uniquement vers `https://gumucroyal.store` (HTTP→HTTPS, www→apex). Pas de redirect basé sur paramètre utilisateur.

**Fichiers** : `frontend/src/middleware.ts`

---

### 12. Rate Limiting & Brute-Force Protection

| Endpoint | Limite (code) | Live |
|----------|---------------|------|
| POST orders | 5/min + 30/h | Probablement actif |
| GET order | 30/min | Actif |
| Admin login | 5/min | Actif (401 testé) |
| Analytics | 120/min | Actif |
| Confirm/patch | 10/min + 60/h | **Non déployé** |
| Products/health | Aucune | Aucune |

#### MEDIUM — M1 : Rate limit en mémoire sans Redis

| | |
|--|--|
| **Description** | `memory://` par défaut — inefficace multi-instances, reset au restart. |
| **Fichiers** | `backend/app/rate_limit.py` |
| **Remédiation** | `REDIS_URL` en prod + rate limits Cloudflare sur `/api/v1/admin/login` et `/api/v1/orders`. |

#### HIGH — H2 : IP spoofable pour analytics

| | |
|--|--|
| **Description** | Analytics utilise le **premier** `X-Forwarded-For` (spoofable). Commandes utilisent `X-Real-IP` (correct). |
| **Fichiers** | `backend/app/api/v1/analytics.py` vs `backend/app/utils/client_ip.py` |
| **Remédiation** | Unifier sur `get_client_ip()` partout. Utiliser `CF-Connecting-IP` via Cloudflare. |

---

### 13. Security Headers

| Header | Storefront | API |
|--------|------------|-----|
| HSTS | ✅ | ✅ |
| X-Frame-Options | ✅ | ✅ |
| X-Content-Type-Options | ✅ | ✅ |
| CSP | ⚠️ unsafe-eval live | ✅ strict |
| Permissions-Policy | ✅ | ✅ |
| X-Powered-By | Absent (Next) | `uvicorn` exposé |

**Remédiation** : Masquer `Server` header via reverse proxy. Déployer CSP local sans `unsafe-eval`.

---

### 14. Cookies & Session Security

| Cookie | Prod | Code local |
|--------|------|------------|
| Admin session | Absent (API Bearer direct) | HttpOnly, Secure, SameSite=Strict |
| Checkout token | N/A (pas de protection) | sessionStorage (à améliorer) |
| Tracking (_fbp, etc.) | Third-party | Lecture seule, non auth |

---

### 15. Payment & Checkout Security

**Bien sécurisé (fort point du projet)**

- COD uniquement — pas de PCI-DSS
- Prix **jamais** acceptés du client — recalcul serveur (`calculate_subtotal`)
- Pydantic `extra="forbid"` sur payloads commande
- Validation offre/produit/is_active (code local)
- UUID produits/offres — manipulation panier localStorage sans impact facturation

#### MEDIUM — M7 : Spam commandes COD

| | |
|--|--|
| **Description** | Pas de CAPTCHA, OTP, ou déduplication téléphone. |
| **Scénario** | Bot crée des centaines de fausses commandes → coût logistique, Sheet pollué. |
| **Remédiation** | Cloudflare Turnstile, limite par numéro de téléphone, honeypot. |

---

### 16. Cloudflare Configuration Risks

| Risque | Sévérité | Détail |
|--------|----------|--------|
| Pas de WAF rules visibles | Medium | Rate limit edge non confirmé sur API |
| API origin directement accessible | High | `api.gumucroyal.store` bypass possible du frontend — normal mais nécessite durcissement API |
| Managed robots.txt | Low | Bonne gestion bots IA |
| CF-Connecting-IP non utilisé | Medium | Backend n'exploite pas l'IP Cloudflare de confiance |

**Remédiation** : WAF rules sur `/api/v1/admin/*`, `/api/v1/orders`, Bot Fight Mode, rate limiting edge, transmettre `CF-Connecting-IP` au backend.

---

### 17. CORS Configuration

**Bien sécurisé en production live** : preflight depuis `https://evil.com` → `Disallowed CORS origin`.

**Fichiers** : `backend/app/main.py`, `backend/app/config.py`  
**Remédiation** : Valider au startup que `CORS_ORIGINS` ne contient pas `*` en prod.

---

### 18. Dependency Vulnerabilities

#### Backend (`requirements.txt`)

Versions récentes et épinglées. **Pas de scan automatisé** (`pip-audit`) dans le CI.

| Package | Version |
|---------|---------|
| fastapi | 0.115.6 |
| sqlalchemy | 2.0.36 |
| httpx | 0.28.1 |
| slowapi | 0.1.9 |

**Remédiation** : `pip-audit` en CI, Dependabot.

#### Frontend (`npm audit`)

**2 vulnérabilités modérées** : PostCSS XSS via `next` (GHSA-qx2v-qp2m-jg93). Fix breaking change vers Next 9.x — **ne pas appliquer aveuglément**.

**Remédiation** : Surveiller correctif Next.js 16.x, mettre à jour quand patch disponible.

---

### 19. Client-Side Security Issues

| Issue | Sévérité |
|-------|----------|
| Prix catalogue hardcodés client | Info — affichage seulement |
| Panier `localStorage` manipulable | Low — serveur recalcule |
| Pixels third-party (Meta/TikTok/Snap) | Medium — surface supply chain |
| Product/offer UUIDs dans bundle | Info — publics par design |
| Admin BFF non déployé | High — token Bearer exposé à JS si login direct API |

---

### 20. Sensitive Information Leakage

| Fuite | Sévérité | Source |
|-------|----------|--------|
| OpenAPI complet | **Critical (live)** | `api.gumucroyal.store/openapi.json` |
| `Server: uvicorn` | Low | Headers API |
| Health endpoint version | Low | `{"version":"1.0.0"}` |
| Order PII via GET public | **Critical (live)** | API orders |
| Numéro commande dans URL thank-you | Low | `/thank-you/{order_number}` |

**Bien sécurisé** : CAPI hash phone/name avant envoi pub (`backend/app/services/tracking/hashing.py`).

---

### 21. SEO Files Exposing Sensitive Routes

| Fichier | Live | Code local |
|---------|------|------------|
| `robots.txt` | `Disallow: /admin` | + `/thank-you` |
| `sitemap.xml` | Absent (404) | Absent |
| Admin metadata | `noindex` (code) | Présent |

**Remédiation** : Déployer `robots.txt` local. Ajouter `noindex` thank-you (déjà en code local).

---

### 22. Publicly Accessible Endpoints

| Endpoint | Auth prod | Auth code local |
|----------|-----------|-----------------|
| `GET /health` | Public | Public |
| `GET /products` | Public | Public |
| `POST /orders` | Public | Public |
| `POST /orders/{id}/confirm` | **Public** | Token checkout |
| `GET /orders/{number}` | **Public** | Token checkout |
| `PATCH /orders/{id}` | **Public** | Token checkout |
| `POST /analytics/events` | Public | Public |
| `POST /admin/login` | Public | Public |
| `GET /admin/*` | Bearer | Bearer |
| `GET /docs`, `/openapi.json` | **Public** | Off en prod |

---

### 23. Storage & Media Security

- Assets statiques dans `frontend/public/` — pas de contrôle d'accès nécessaire
- Images produits locales — pas de données sensibles
- Next/Image : remote limité à `images.unsplash.com` (`next.config.ts`)
- Vidéos hero en `/public` — accessibles publiquement (normal)
- Docker frontend : utilisateur non-root `nextjs` ✅

---

### 24. Bot Abuse Risks

| Vecteur | Protection actuelle | Gap |
|---------|---------------------|-----|
| Spam commandes COD | 5/min + 30/h IP | Pas CAPTCHA, IP spoofable analytics |
| Admin brute-force | 5/min | API publique, pas de lockout compte |
| Analytics inflation | 120/min | IP spoofable, pas de WAF edge |
| Scraping produits | Aucune | Cloudflare cache possible |
| Cloudflare bot rules | Partiel (robots.txt IA) | WAF non confirmé |

---

### 25. Business Logic Vulnerabilities

| Issue | Sévérité | Détail |
|-------|----------|--------|
| Confirm sans auth (live) | Critical | Sheets + CAPI déclenchables |
| Race condition confirm | Medium | Double sync Sheet/CAPI possible |
| PATCH upsell schema mismatch | Low | Endpoint incohérent, frontend utilise confirm |
| Pas de dédup téléphone | Medium | Même client peut spammer commandes |
| Upsell prix serveur | ✅ OK | `upsell_price_mad()` depuis env |
| Offer/product binding | ✅ OK (local) | Validation `offer.product_id` |

---

## Synthèse des findings

### Critical (5)

| ID | Finding | Environnement |
|----|---------|---------------|
| C-LIVE-1 | Commandes confirm/GET/PATCH sans authentification | **Production** |
| C-LIVE-2 | OpenAPI + Swagger exposés — cartographie complète API + PII schema | **Production** |
| C-1 | SQLite PII dans historique git | Repo |
| C-LIVE-3 | Correctifs sécurité majeurs non déployés | **Production vs code** |
| C-LIVE-4 | Fuite PII via `GET /orders/{number}` si numéro connu | **Production** |

### High (8)

| ID | Finding |
|----|---------|
| H-1 | API admin publique sur sous-domaine — bypass BFF |
| H-2 | IP spoofable pour analytics (incohérence avec orders) |
| H-3 | Script Sheets legacy avec secret plaintext |
| H-4 | Credentials Postgres faibles + port exposé (docker-compose) |
| H-5 | CSP `unsafe-eval` en production live |
| H-6 | Admin login retourne token Bearer exploitable directement |
| H-7 | Pas de restriction réseau sur `/admin` |
| H-8 | Cloudflare WAF / rate limit edge non configurés sur API |

### Medium (12)

Analytics abuse, rate limit mémoire, geo HTTP, race confirm, admin single-password, order spam sans CAPTCHA, validation prod incomplète, PATCH schema mismatch, thank-you sans noindex live, dépendance PostCSS modérée, confirm idempotence, BFF admin absent en prod.

### Low (10)

Health/products sans rate limit, uvicorn Server header, doGet webhook info disclosure, cart localStorage, order number in URL, placeholder WhatsApp, PostgreSQL sslmode disable docs, public endpoints scraping, legacy env naming Dockerfile, Apps Script non constant-time compare.

---

## Ce qui est bien sécurisé

1. **Intégrité des prix** — recalcul serveur, `extra="forbid"`, pas de champ prix client
2. **CORS production** — origine malveillante rejetée (testé live)
3. **En-têtes sécurité storefront** — HSTS preload, DENY frame, nosniff
4. **Pas de XSS sinks** dans le code React
5. **Pas d'upload / pas d'injection SQL**
6. **Comparaisons timing-safe** — admin creds et signatures HMAC
7. **Hashing PII CAPI** — phone/nom avant Meta/TikTok/Snap
8. **Cloudflare** devant le frontend
9. **Docker non-root** pour le frontend
10. **Correctifs locaux solides** — prêts à déployer (checkout token, HMAC webhook, security_check, admin BFF)

---

## Plan de remédiation priorisé

| Priorité | Action | Impact score |
|----------|--------|--------------|
| **P0 — Immédiat** | Redéployer backend + frontend avec correctifs locaux | +18 pts |
| **P0** | Vérifier post-deploy : confirm sans token → 401, `/docs` → 404 | — |
| **P0** | Purger `gumucroyal.db` de git + rotation secrets | +5 pts |
| **P1** | Cloudflare WAF : rate limit `/api/v1/admin/login`, `/api/v1/orders` | +5 pts |
| **P1** | IP allowlist admin (Cloudflare Access ou firewall) | +4 pts |
| **P1** | `REDIS_URL` + unifier IP analytics | +3 pts |
| **P1** | Supprimer `google-sheets/apps-script.js`, déployer HMAC script | +2 pts |
| **P2** | Cloudflare Turnstile sur checkout | +3 pts |
| **P2** | CAPTCHA + dédup téléphone | +2 pts |
| **P2** | npm/pip audit en CI | +1 pt |

---

## Security Score : 62 / 100 (production actuelle)

| Catégorie | Poids | Score |
|-----------|-------|-------|
| Auth & autorisation | 20% | 35/100 |
| API & endpoints | 15% | 45/100 |
| Données & secrets | 15% | 70/100 |
| Frontend & XSS/CSRF | 15% | 72/100 |
| Infra & headers | 15% | 78/100 |
| Business logic checkout | 10% | 85/100 |
| Dépendances & ops | 10% | 65/100 |

**Score projeté après deploy complet du code local + config prod : ~85/100**

---

*Audit read-only — tests live effectués le 16/06/2026 via requêtes HTTP non destructives sur `gumucroyal.store` et `api.gumucroyal.store`.*
