"use client";

import { useEffect, useMemo } from "react";
import { X, Trash2 } from "lucide-react";
import { computeCartTotal, computeCrossSellProducts, useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { getCartItemName, getProductName, STATIC_PRODUCTS } from "@/lib/products";
import { Button } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { getOfferLabelKey, useTranslation } from "@/i18n/I18nProvider";

export function CartDrawer() {
  const { t, locale, dir } = useTranslation();
  const cartOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  const crossSells = useMemo(() => computeCrossSellProducts(items, STATIC_PRODUCTS), [items]);
  const total = useMemo(() => computeCartTotal(items), [items]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  if (!cartOpen) return null;

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
              return (
                <div key={item.id} className="flex gap-3 border-b border-brand-gray/20 pb-4">
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden">
                    <OptimizedImage src={item.imageUrl} alt={productName} fill sizes="80px" />
                  </div>
                  <div className="flex-1">
                    <p className="font-product text-sm line-clamp-2 tracking-wide">{productName}</p>
                    <p className="text-brand-white/60 text-sm">{t(getOfferLabelKey(item.offerQuantity))}</p>
                    <p className="font-semibold tabular-nums text-brand-gold mt-1" dir="ltr">
                      {formatPrice(item.priceMad)}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-brand-white/50 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}

          {items.length > 0 && crossSells.length > 0 && (
            <div className="pt-4">
              <h3 className="font-display text-base tracking-wide text-brand-gold mb-3">{t("cart.crossSell")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {crossSells.slice(0, 2).map((p) => {
                  const productName = getProductName(p, locale);
                  return (
                    <div key={p.slug} className="border border-brand-gray/30 p-2">
                      <div className="relative aspect-square w-full overflow-hidden">
                        <OptimizedImage src={p.images[0]?.url} alt={productName} fill sizes="150px" />
                      </div>
                      <p className="font-product text-xs mt-2 line-clamp-2 tracking-wide">{productName}</p>
                      <p className="font-semibold tabular-nums text-brand-gold text-sm" dir="ltr">
                        {formatPrice(p.base_price_mad)}
                      </p>
                      <Button variant="secondary" fullWidth className="mt-2 text-sm min-h-10" onClick={() => addItem(p)}>
                        {t("cart.add")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-brand-gray/30 space-y-3">
            <p className="text-sm text-brand-white/70">{t("cart.socialProof")}</p>
            <div className="flex justify-between text-lg font-semibold">
              <span>{t("common.total")}:</span>
              <span className="tabular-nums text-brand-gold" dir="ltr">
                {formatPrice(total)}
              </span>
            </div>
            <Button
              fullWidth
              onClick={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
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
