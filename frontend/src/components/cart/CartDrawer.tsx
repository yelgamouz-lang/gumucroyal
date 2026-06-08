"use client";

import { useEffect, useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { computeCartTotal, useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { getCartItemName } from "@/lib/products";
import { Button, PriceDisplay } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { cn } from "@/lib/cn";
import { trackAnalyticsClick } from "@/lib/analytics";
import { getOfferLabelKey, useTranslation } from "@/i18n/I18nProvider";

export function CartDrawer() {
  const { t, locale, dir } = useTranslation();
  const cartOpen = useUIStore((s) => s.cartOpen);
  const checkoutOpen = useUIStore((s) => s.checkoutOpen);
  const upsellOpen = useUIStore((s) => s.upsellOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const openCheckout = useUIStore((s) => s.openCheckout);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);

  const total = useMemo(() => computeCartTotal(items), [items]);

  useEffect(() => {
    const lockScroll = cartOpen && !checkoutOpen && !upsellOpen;
    document.body.style.overflow = lockScroll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, checkoutOpen, upsellOpen]);

  if (!cartOpen || checkoutOpen || upsellOpen) return null;

  return (
    <div className="cart-drawer-root fixed inset-0 z-[10002]">
      <div className="cart-drawer-backdrop absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
      <div
        className={cn(
          "cart-drawer-panel absolute top-0 end-0 h-full w-full max-w-md bg-brand-charcoal shadow-xl flex flex-col",
          dir === "rtl" ? "animate-slide-in-start" : "animate-slide-in-end"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-brand-gray/30">
          <h2 className="font-display text-xl tracking-wide text-brand-gold">{t("cart.title", { count: items.length })}</h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label={t("common.close")}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-brand-white/60 py-12">{t("cart.empty")}</p>
          ) : (
            items.map((item) => {
              const productName = getCartItemName(item, locale);
              const lines = item.bundleLines?.length ? item.bundleLines : [item];
              return (
                <div key={item.id} className="flex gap-3 border-b border-brand-gray/20 pb-4">
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden">
                    <OptimizedImage src={item.imageUrl} alt={productName} fill sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-product text-sm line-clamp-2 tracking-wide break-words">{productName}</p>
                    <p className="text-brand-white/60 text-sm">{t(getOfferLabelKey(item.offerQuantity))}</p>
                    {lines.length > 1 && (
                      <ul className="text-xs text-brand-white/50 mt-1 space-y-0.5">
                        {lines.map((line) => (
                          <li key={line.productId} className="line-clamp-1">
                            · {getCartItemName(line, locale)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <PriceDisplay amount={item.priceMad} />
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-brand-white/50 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-brand-gray/30 space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>{t("common.total")}:</span>
              <PriceDisplay amount={total} className="text-lg" />
            </div>
            <Button
              fullWidth
              onClick={() => {
                trackAnalyticsClick("/cart/checkout");
                openCheckout();
              }}
            >
              {t("cart.confirmCod")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
