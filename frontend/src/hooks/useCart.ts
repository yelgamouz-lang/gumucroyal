import { useMemo } from "react";
import { computeCartTotal, useCartStore } from "@/stores/cartStore";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useMemo(() => computeCartTotal(items), [items]);

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    totalPrice,
    itemCount: items.length,
  };
}
