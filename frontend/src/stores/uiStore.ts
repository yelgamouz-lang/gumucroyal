"use client";

import { create } from "zustand";
import type { OrderResponse } from "@/types/product";

interface UIStore {
  cartOpen: boolean;
  checkoutOpen: boolean;
  upsellOpen: boolean;
  pendingOrder: OrderResponse | null;
  setCartOpen: (v: boolean) => void;
  setCheckoutOpen: (v: boolean) => void;
  setUpsellOpen: (v: boolean) => void;
  setPendingOrder: (o: OrderResponse | null) => void;
  openCheckout: () => void;
  openUpsell: () => void;
  resetCheckoutFlow: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  checkoutOpen: false,
  upsellOpen: false,
  pendingOrder: null,
  setCartOpen: (v) => set({ cartOpen: v }),
  setCheckoutOpen: (v) => set(v ? { cartOpen: false, checkoutOpen: true } : { checkoutOpen: false }),
  setUpsellOpen: (v) =>
    set(v ? { cartOpen: false, checkoutOpen: false, upsellOpen: true } : { upsellOpen: false }),
  setPendingOrder: (o) => set({ pendingOrder: o }),
  openCheckout: () => set({ cartOpen: false, checkoutOpen: true, upsellOpen: false }),
  openUpsell: () => set({ cartOpen: false, checkoutOpen: false, upsellOpen: true }),
  resetCheckoutFlow: () =>
    set({
      cartOpen: false,
      checkoutOpen: false,
      upsellOpen: false,
      pendingOrder: null,
    }),
}));
