import type { CartItem, Product } from "@/types/product";
import { STATIC_PRODUCTS } from "@/lib/products";

const BUMP_MAP: Record<string, string> = {
  "bague-lien-eternel": "collier-trefle-lumiere",
  "collier-trefle-lumiere": "bague-lien-eternel",
  "bague-double-signature": "collier-trefle-lumiere",
};

export function resolveOrderBumpProduct(items: CartItem[], catalog = STATIC_PRODUCTS): Product | null {
  const inCart = new Set(items.map((i) => i.productSlug));
  const mainSlug = items[0]?.productSlug;
  let bumpSlug = BUMP_MAP[mainSlug || ""] || "collier-trefle-lumiere";
  if (inCart.has(bumpSlug)) {
    bumpSlug = catalog.find((p) => !inCart.has(p.slug))?.slug || bumpSlug;
  }
  return catalog.find((p) => p.slug === bumpSlug) || null;
}

export const ORDER_BUMP_PRICE = Number(process.env.NEXT_PUBLIC_ORDER_BUMP_PRICE_MAD || 69);
