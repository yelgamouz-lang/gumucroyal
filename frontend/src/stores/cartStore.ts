"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Offer, Product } from "@/types/product";
import { getDefaultOffer, tierTotalPrice } from "@/lib/offerTiers";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, offerId?: string, extraProducts?: Product[]) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceMad, 0);
}

export function countCartPieces(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + (item.bundleLines?.length ?? item.offerQuantity ?? 1),
    0
  );
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, offerId, extraProducts = []) => {
        const offer = offerId
          ? product.offers.find((o) => o.id === offerId) || getDefaultOffer(product)
          : getDefaultOffer(product);

        const extras = extraProducts.slice(0, Math.max(0, offer.quantity - 1));

        const item: CartItem = {
          id: `${product.slug}-${offer.slug}-${Date.now()}`,
          productId: product.id,
          productSlug: product.slug,
          productNameFr: product.name_fr,
          productNameAr: product.name_ar,
          offerId: offer.id,
          offerQuantity: offer.quantity,
          priceMad: tierTotalPrice(product.base_price_mad, offer.quantity as 1 | 2 | 3),
          imageUrl: product.images[0]?.url || "",
          extraProductIds: extras.map((p) => p.id),
          bundleLines: [
            {
              productId: product.id,
              productSlug: product.slug,
              productNameFr: product.name_fr,
              productNameAr: product.name_ar,
              imageUrl: product.images[0]?.url || "",
            },
            ...extras.map((p) => ({
              productId: p.id,
              productSlug: p.slug,
              productNameFr: p.name_fr,
              productNameAr: p.name_ar,
              imageUrl: p.images[0]?.url || "",
            })),
          ],
        };
        set({ items: [...get().items, item] });
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearCart: () => set({ items: [] }),
    }),
    { name: "gumucroyal-cart" }
  )
);
