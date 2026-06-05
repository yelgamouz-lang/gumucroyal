"use client";

import { create } from "zustand";
import type { OrderResponse, UpsellProduct } from "@/types/product";

interface UIStore {
  cartOpen: boolean;
  checkoutOpen: boolean;
  upsellOpen: boolean;
  pendingOrder: OrderResponse | null;
  upsellProduct: UpsellProduct | null;
  setCartOpen: (v: boolean) => void;
  setCheckoutOpen: (v: boolean) => void;
  setUpsellOpen: (v: boolean) => void;
  setPendingOrder: (o: OrderResponse | null) => void;
  setUpsellProduct: (p: UpsellProduct | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  checkoutOpen: false,
  upsellOpen: false,
  pendingOrder: null,
  upsellProduct: null,
  setCartOpen: (v) => set({ cartOpen: v }),
  setCheckoutOpen: (v) => set({ checkoutOpen: v }),
  setUpsellOpen: (v) => set({ upsellOpen: v }),
  setPendingOrder: (o) => set({ pendingOrder: o }),
  setUpsellProduct: (p) => set({ upsellProduct: p }),
}));
