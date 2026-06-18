import type { CartItem, Product } from "@/types/product";
import type { Locale } from "@/i18n/types";
import { enrichProductOffers, enrichProductsOffers, getDefaultOffer } from "@/lib/offerTiers";
import { getCatalogBasePrice } from "@/lib/productCatalog";

const LIFE = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80";
const PACK = "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80";
const HERO = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=80";

/**
 * Photos produits — frontend/public/Produit/
 * Tableau par produit : la 1ʳᵉ image est la principale (priorité de chargement),
 * les suivantes sont les angles + la photo portée (lazy) affichées dans la galerie.
 * Pour ajouter des photos : déposez les fichiers dans public/Produit/ puis ajoutez
 * leurs chemins ici (ex. ".../bague-lien-eternel-2.jpg", ".../bague-lien-eternel-porte.jpg").
 */
export const PRODUCT_PHOTOS = {
  "bague-lien-eternel": ["/Produit/bague-lien-eternel.jpg"],
  "collier-trefle-lumiere": ["/Produit/collier-trefle.jpg"],
  "bague-double-signature": ["/Produit/bague-double-signature.jpg"],
} as const;

export const PLACEHOLDER_IMAGES = { hero: HERO, lifestyle: LIFE, packaging: PACK };

/** Homepage brand sections — public/Produit/ */
export const HOME_SECTION_IMAGES = {
  about: "/Produit/maison-1.jpg",
  commitment: "/Produit/maison-2.jpg",
} as const;

/** About page (La Maison) — public/Produit/ */
export const ABOUT_SECTION_IMAGES = {
  mission: "/Produit/mission.jpg",
  quality: "/Produit/qualite.jpg",
} as const;

export const BRAND_COMMITMENT_IMAGE = "/brand-commitment.jpg";

export { getDefaultOffer } from "@/lib/offerTiers";

export function getProductName(product: Pick<Product, "name_fr" | "name_ar">, locale: Locale): string {
  return locale === "ar" ? product.name_ar : product.name_fr;
}

export function getCartItemName(
  item: Pick<CartItem, "productNameFr"> & { productNameAr?: string },
  locale: Locale
): string {
  return locale === "ar" && item.productNameAr ? item.productNameAr : item.productNameFr;
}

/** Applique base_price_mad depuis data/products.csv sur un produit API/static. */
export function applyCatalogPricing(product: Product): Product {
  try {
    const base = getCatalogBasePrice(product.slug);
    return enrichProductOffers({ ...product, base_price_mad: base, compare_at_price_mad: base });
  } catch {
    return enrichProductOffers(product);
  }
}

const OFFER_IDS: Record<string, [string, string, string]> = {
  "bague-lien-eternel": [
    "22222222-2222-2222-2222-222222222201",
    "22222222-2222-2222-2222-222222222202",
    "22222222-2222-2222-2222-222222222203",
  ],
  "collier-trefle-lumiere": [
    "22222222-2222-2222-2222-222222222204",
    "22222222-2222-2222-2222-222222222205",
    "22222222-2222-2222-2222-222222222206",
  ],
  "bague-double-signature": [
    "22222222-2222-2222-2222-222222222207",
    "22222222-2222-2222-2222-222222222208",
    "22222222-2222-2222-2222-222222222209",
  ],
};

function stubOffers(slug: string, sku: string) {
  const ids = OFFER_IDS[slug];
  if (!ids) return [];
  return [
    { id: ids[0], slug: `${sku}-single`, label_ar: "قطعة واحدة", quantity: 1, price_mad: 0, is_default: false },
    { id: ids[1], slug: `${sku}-duo`, label_ar: "عرض زوجي", quantity: 2, price_mad: 0, is_default: true, badge_ar: "⭐ للهدية" },
    { id: ids[2], slug: `${sku}-pack`, label_ar: "الباقة الكاملة", quantity: 3, price_mad: 0, is_default: false },
  ];
}

function buildStaticProduct(
  slug: keyof typeof PRODUCT_PHOTOS,
  partial: Omit<Product, "slug" | "base_price_mad" | "compare_at_price_mad" | "offers" | "images"> & {
    images?: Product["images"];
  }
): Product {
  const base = getCatalogBasePrice(slug);
  return applyCatalogPricing({
    ...partial,
    slug,
    base_price_mad: base,
    compare_at_price_mad: base,
    images: partial.images ?? PRODUCT_PHOTOS[slug].map((url, i) => ({ url, alt: partial.name_fr, sort_order: i })),
    offers: stubOffers(slug, partial.sku),
  });
}

const STATIC_PRODUCTS_RAW: Product[] = [
  buildStaticProduct("bague-lien-eternel", {
    id: "11111111-1111-1111-1111-111111111101",
    sku: "GR-BLE-001",
    name_fr: "Bague Lien Éternel By GUMÜÇ Royal",
    name_ar: "خاتم الرابط الأبدي By GUMÜÇ Royal",
    description_short: "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre.",
    description_long: "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable finition dorée — un éclat qui ne ternit jamais.",
    category: "bagues",
    collection: "signature",
    material: "Acier inoxydable finition dorée",
    badge: "Nouveau",
    benefits: [],
    cross_sell_slug: "collier-trefle-lumiere",
    upsell_slug: "collier-trefle-lumiere",
  }),
  buildStaticProduct("collier-trefle-lumiere", {
    id: "11111111-1111-1111-1111-111111111102",
    sku: "GR-CTL-002",
    name_fr: "Collier Trèfle de Lumière By GUMÜÇ Royal",
    name_ar: "قلادة البرسيم المضيء By GUMÜÇ Royal",
    description_short: "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
    description_long: "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
    category: "colliers",
    collection: "signature",
    material: "Acier inoxydable finition dorée",
    badge: "Nouveau",
    benefits: [],
    cross_sell_slug: "bague-double-signature",
    upsell_slug: "bague-lien-eternel",
  }),
  buildStaticProduct("bague-double-signature", {
    id: "11111111-1111-1111-1111-111111111103",
    sku: "GR-BDS-003",
    name_fr: "Bague Double Signature By GUMÜÇ Royal",
    name_ar: "خاتم التوقيع المزدوج By GUMÜÇ Royal",
    description_short: "Un design architectural à deux extrémités pavées de zircons.",
    description_long: "Un design architectural à deux extrémités pavées de zircons, en acier inoxydable finition dorée.",
    category: "bagues",
    collection: "signature",
    material: "Acier inoxydable finition dorée",
    badge: "Nouveau",
    benefits: [],
    cross_sell_slug: "collier-trefle-lumiere",
    upsell_slug: "collier-trefle-lumiere",
  }),
];

export const STATIC_PRODUCTS: Product[] = STATIC_PRODUCTS_RAW;

export function getProductBySlug(slug: string): Product | undefined {
  return STATIC_PRODUCTS.find((p) => p.slug === slug);
}

export function withLocalProductPhotos(product: Product): Product {
  const photos = (PRODUCT_PHOTOS as Record<string, readonly string[]>)[product.slug];
  const badge = product.badge === "Best Seller" ? "Nouveau" : product.badge;
  // Backfill the collection from static data so collection pages work even when
  // products are served by the API (which may not expose the field yet).
  const collection =
    product.collection ?? STATIC_PRODUCTS.find((p) => p.slug === product.slug)?.collection;
  const priced = applyCatalogPricing({ ...product, badge, collection });
  if (!photos || photos.length === 0) return priced;
  const alt = priced.images[0]?.alt ?? priced.name_fr;
  const images = photos.map((url, i) => ({ url, alt, sort_order: i }));
  return applyCatalogPricing({ ...priced, images });
}

export function withLocalProductPhotosList(products: Product[]): Product[] {
  return products.map(withLocalProductPhotos);
}

export async function fetchProducts(): Promise<Product[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return STATIC_PRODUCTS;
  try {
    const res = await fetch(`${api}/api/v1/products`, { next: { revalidate: 60 } });
    if (!res.ok) return STATIC_PRODUCTS;
    const data = await res.json();
    const products: Product[] = data.products?.length ? data.products : STATIC_PRODUCTS;
    return withLocalProductPhotosList(products);
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const fallback = getProductBySlug(slug);
  if (!api) return fallback;
  try {
    const res = await fetch(`${api}/api/v1/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    const product = (await res.json()) as Product;
    return withLocalProductPhotos(product);
  } catch {
    return fallback;
  }
}
