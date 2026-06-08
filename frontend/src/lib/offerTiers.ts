import type { Offer, Product } from "@/types/product";
import {
  ADD_PIECE_PRICE_MAD,
  computeOfferTotal,
  totalAddPieceSavings,
} from "@/lib/addPieceOffer";

export { ADD_PIECE_PRICE_MAD, totalAddPieceSavings as bundleSavings };

/** Bundle total: base + (quantity − 1) × ADD_PIECE_PRICE_MAD */
export function tierTotalPrice(basePriceMad: number, quantity: 1 | 2 | 3): number {
  return computeOfferTotal(basePriceMad, quantity - 1);
}

const TIER_META: { quantity: 1 | 2 | 3; label_ar: string; highlighted: boolean }[] = [
  { quantity: 1, label_ar: "قطعة واحدة", highlighted: false },
  { quantity: 2, label_ar: "عرض زوجي", highlighted: true },
  { quantity: 3, label_ar: "باقة نهائية", highlighted: false },
];

function offerSlug(sku: string, quantity: number): string {
  const suffix = quantity === 1 ? "single" : quantity === 2 ? "duo" : "pack";
  return `${sku}-${suffix}`;
}

export function buildOffersForProduct(
  product: Pick<Product, "id" | "slug" | "sku" | "base_price_mad">,
  existingOffers: Offer[] = []
): Offer[] {
  const byQty = new Map(existingOffers.map((o) => [o.quantity, o]));

  return TIER_META.map((tier) => {
    const existing = byQty.get(tier.quantity);
    const price_mad = tierTotalPrice(product.base_price_mad, tier.quantity);
    return {
      id: existing?.id ?? `${product.id}-qty-${tier.quantity}`,
      slug: existing?.slug ?? offerSlug(product.sku, tier.quantity),
      label_ar: tier.label_ar,
      quantity: tier.quantity,
      price_mad,
      is_default: tier.highlighted,
      badge_ar: tier.highlighted ? "⭐ للهدية" : null,
    };
  });
}

export function offersDisplayOrder(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => a.quantity - b.quantity);
}

export function enrichProductOffers(product: Product): Product {
  const offers = offersDisplayOrder(buildOffersForProduct(product, product.offers));
  return { ...product, offers };
}

export function enrichProductsOffers(products: Product[]): Product[] {
  return products.map(enrichProductOffers);
}

/** Default selection on page load = 1 pièce */
export function getDefaultOffer(product: Product): Offer {
  const offers = buildOffersForProduct(product, product.offers);
  return offers.find((o) => o.quantity === 1)!;
}

export function getSingleOffer(product: Product): Offer {
  return getDefaultOffer(product);
}

export function emptyExtraSlugs(count: number): string[] {
  return Array.from({ length: count }, () => "");
}

export function resolveExtraProducts(slugs: string[], allProducts: Product[]): Product[] {
  return slugs
    .filter(Boolean)
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter(Boolean) as Product[];
}

export function extrasComplete(slugs: string[], required: number): boolean {
  if (required <= 0) return true;
  return slugs.slice(0, required).every(Boolean);
}
