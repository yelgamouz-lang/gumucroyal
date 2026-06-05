# Design System — GUMÜÇROYAL

## Design Principles

1. **Premium Dark Luxury** — fonds sombres, accents or
2. **RTL First** — tout conçu pour arabe right-to-left
3. **Mobile First** — 90% trafic social mobile
4. **Whitespace = Luxury** — espaces généreux
5. **Proof Visible** — trust elements jamais cachés
6. **Performance** — images optimisées, pixels deferred

---

## Color Tokens

```css
:root {
  /* Brand */
  --brand-gold: #C9A962;
  --brand-gold-light: #E8D5A3;
  --brand-gold-dark: #A68B4B;
  --brand-black: #0A0A0A;
  --brand-charcoal: #1A1A1A;
  --brand-gray: #2A2A2A;
  --brand-white: #FAFAFA;
  --brand-cream: #F5F0E8;
  
  /* Functional */
  --color-scarcity: #C0392B;
  --color-trust: #27AE60;
  --color-star: #F1C40F;
  --color-error: #E74C3C;
  
  /* Text */
  --text-primary: #FAFAFA;
  --text-secondary: #B0B0B0;
  --text-muted: #707070;
  --text-on-light: #1A1A1A;
  
  /* Surfaces */
  --surface-dark: #0A0A0A;
  --surface-card: #1A1A1A;
  --surface-elevated: #2A2A2A;
  --surface-light: #F5F0E8;
}
```

### Tailwind config mapping
```javascript
// tailwind.config.ts
colors: {
  brand: {
    gold: '#C9A962',
    'gold-light': '#E8D5A3',
    black: '#0A0A0A',
    charcoal: '#1A1A1A',
    cream: '#F5F0E8',
  }
}
```

---

## Typography

| Usage | Font | Weight | Size (desktop/mobile) |
|-------|------|--------|----------------------|
| Logo / H1 brand | Playfair Display | 700 | 48px / 32px |
| H1 page | Playfair Display | 600 | 36px / 28px |
| H2 section | Playfair Display | 600 | 28px / 24px |
| H3 card | Tajawal | 700 | 22px / 18px |
| Body | Tajawal | 400 | 16px / 16px |
| Body small | Tajawal | 400 | 14px / 14px |
| CTA buttons | Tajawal | 700 | 16px / 16px |
| Price | Playfair Display | 700 | 24px / 20px |
| Badge | Tajawal | 600 | 12px / 11px |

### Google Fonts import
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Tajawal:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### RTL Typography rules
- `direction: rtl` on html
- `text-align: right` default
- Numbers/prices: keep LTR within RTL (`dir="ltr"` on price spans if needed)
- Letter-spacing on logo: `0.15em`

---

## Spacing Scale

```
4px  → 1    (0.25rem)
8px  → 2    (0.5rem)
12px → 3    (0.75rem)
16px → 4    (1rem)
24px → 6    (1.5rem)
32px → 8    (2rem)
48px → 12   (3rem)
64px → 16   (4rem)
96px → 24   (6rem) — section padding vertical
```

Section vertical padding: `py-16 md:py-24` (64px/96px)

---

## Components

### Buttons

```tsx
// Primary CTA
<button className="bg-brand-gold text-brand-black font-bold py-4 px-8 rounded-none 
  hover:bg-brand-gold-light transition-all duration-300 w-full text-lg">
  أضيفي للسلة — 429 د.م.
</button>

// Secondary
<button className="border border-brand-gold text-brand-gold py-3 px-6 
  hover:bg-brand-gold hover:text-brand-black transition-all">
  شوفي التفاصيل
</button>

// Ghost
<button className="text-brand-gold underline hover:text-brand-gold-light">
  لا شكراً
</button>
```

- Min height: 48px (touch target)
- No border-radius (sharp = luxury) OR max `rounded-sm`
- Full width on mobile CTAs

### Product Card

```tsx
<div className="bg-brand-charcoal group cursor-pointer">
  <div className="aspect-square overflow-hidden relative">
    <Image ... className="group-hover:scale-105 transition-transform duration-500" />
    <Badge>Best Seller</Badge>
  </div>
  <div className="p-4">
    <Stars rating={4.9} count={847} />
    <h3 className="font-bold mt-2">خاتم الرابط الأبدي</h3>
    <Price current={249} compareAt={399} />
    <Button variant="secondary" className="mt-3">شوفي التفاصيل</Button>
  </div>
</div>
```

### Offer Selector

- Radio-style cards, not native radio inputs (styled)
- Selected: `border-2 border-brand-gold bg-brand-gold/5`
- Unselected: `border border-brand-gray`
- Badge "⭐ الأكثر طلباً" on default offer

### Trust Bar

```tsx
<div className="flex flex-wrap justify-center gap-6 py-4 bg-brand-charcoal text-sm">
  <TrustItem icon="💰" text="الدفع عند الاستلام" />
  <TrustItem icon="🚚" text="توصيل 24-72 ساعة" />
  <TrustItem icon="✅" text="ضمان 12 شهر" />
  <TrustItem icon="💎" text="acier 316L certifié" />
</div>
```

### Review Card

```tsx
<div className="bg-brand-charcoal p-6 border border-brand-gray/30">
  <Stars rating={5} />
  <p className="mt-3 text-text-secondary italic">"وصلني f 2 jours, quality kayna quality!"</p>
  <p className="mt-2 text-sm text-brand-gold">— سارة, الدار البيضاء</p>
</div>
```

### Scarcity Badge

```tsx
<span className="text-color-scarcity text-sm font-semibold animate-pulse">
  🔥 باقي {stockCount} فقط f stock
</span>
```

`stockCount`: randomize between 8-23 on page load (stored in session, not reactive countdown).

---

## Layout Patterns

### Alternating Section (Desktop)

```tsx
// Section A: Text start, Image end (RTL)
<section className="grid md:grid-cols-2 gap-12 items-center py-24">
  <div className="order-1">{/* Text content */}</div>
  <div className="order-2">{/* Image */}</div>
</section>

// Section B: Image start, Text end (RTL) — reversed
<section className="grid md:grid-cols-2 gap-12 items-center py-24">
  <div className="order-2 md:order-1">{/* Image */}</div>
  <div className="order-1 md:order-2">{/* Text content */}</div>
</section>
```

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Section backgrounds alternance
- Dark: `bg-brand-black`
- Charcoal: `bg-brand-charcoal`
- Light (occasional): `bg-brand-cream text-text-on-light`

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

Mobile-first: default styles = mobile, `md:` prefix = desktop.

---

## Animations

Keep subtle — luxury = calm:

```css
/* Fade in on scroll */
.fade-in { animation: fadeIn 0.6s ease-out; }

/* Cart drawer slide */
.cart-drawer { transition: transform 300ms ease-in-out; }

/* Button hover */
.btn-primary { transition: all 300ms ease; }

/* NO: aggressive bounce, flash, shake */
```

Use `Intersection Observer` or `framer-motion` for scroll reveals (optional, keep perf).

---

## Icons

Use **Lucide React** for UI icons (cart, close, check, star, truck, shield).
Custom SVG for logo circle.

---

## Image Guidelines

| Context | Ratio | Size | Format |
|---------|-------|------|--------|
| Product hero | 1:1 | 800x800 | WebP |
| Product gallery | 1:1 | 600x600 | WebP |
| Lifestyle | 16:9 | 1200x675 | WebP |
| UGC | 1:1 | 400x400 | WebP |
| Hero bg | 16:9 | 1920x1080 | WebP |

- Always use `next/image`
- `priority` on above-fold hero only
- `loading="lazy"` everywhere else
- Placeholder: blur data URL or solid brand-charcoal

---

## Accessibility

- Color contrast: gold on black = WCAG AA minimum
- Focus states visible on all interactive elements
- `aria-label` on icon-only buttons (cart, close)
- Form labels associated with inputs
- Skip to content link (hidden)

---

## Dark/Light

Site is **dark mode only** for MVP — premium jewelry aesthetic.
No light mode toggle needed.
