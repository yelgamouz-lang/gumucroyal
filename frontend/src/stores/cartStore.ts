"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";
import { getDefaultOffer } from "@/lib/products";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, offerId?: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

/** Pure helper — use with useMemo in components (never inside a Zustand selector). */
export function computeCrossSellProducts(items: CartItem[], allProducts: Product[]): Product[] {
  const inCart = new Set(items.map((i) => i.productSlug));
  return allProducts.filter((p) => !inCart.has(p.slug));
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceMad, 0);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, offerId) => {
        const offer = offerId
          ? product.offers.find((o) => o.id === offerId) || getDefaultOffer(product)
          : getDefaultOffer(product);
        const item: CartItem = {
          id: `${product.slug}-${offer.slug}-${Date.now()}`,
          productId: product.id,
          productSlug: product.slug,
          productNameFr: product.name_fr,
          productNameAr: product.name_ar,
          offerId: offer.id,
          offerQuantity: offer.quantity,
          priceMad: offer.price_mad,
          imageUrl: product.images[0]?.url || "",
        };
        set({ items: [...get().items, item] });
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearCart: () => set({ items: [] }),
    }),
    { name: "gumucroyal-cart" }
  )
);
