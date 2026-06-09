"use client";

import { useEffect, useState, type RefObject } from "react";
import { Button, PriceDisplay, AddToCartLabel } from "@/components/shared/UI";
import { PieceThumbnailPicker } from "@/components/shared/PieceThumbnailPicker";
import { useTranslation } from "@/i18n/I18nProvider";
import { useIsMobile } from "@/lib/useIsMobile";
import { ADD_PIECE_PRICE_MAD } from "@/lib/offerTiers";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";

type ProductStickyCTAProps = {
  productName: string;
  displayPrice: number;
  canAddToCart: boolean;
  onAddToCart: () => void;
  heroSentinelRef: RefObject<HTMLElement | null>;
  extrasNeeded: number;
  allProducts: Product[];
  extraSlugs: string[];
  onExtraChange: (index: number, slug: string | null) => void;
  mobileBundleSavings: number;
};

export function ProductStickyCTA({
  productName,
  displayPrice,
  canAddToCart,
  onAddToCart,
  heroSentinelRef,
  extrasNeeded,
  allProducts,
  extraSlugs,
  onExtraChange,
  mobileBundleSavings,
}: ProductStickyCTAProps) {
  const { t, locale } = useTranslation();
  const isMobile = useIsMobile();
  const [heroVisible, setHeroVisible] = useState(true);
  const [mobilePickerSlot, setMobilePickerSlot] = useState(0);

  useEffect(() => {
    const node = heroSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [heroSentinelRef]);

  const showSticky = !heroVisible;
  const mobileSlotSlugs = extraSlugs.slice(0, extrasNeeded).map((s) => s || null);
  const showMobilePicker = isMobile && extrasNeeded > 0 && allProducts.length > 0;

  if (!showSticky) return null;

  return (
    <>
      {/* Titre produit — collé sous le header mobile / en haut desktop */}
      <div
        className={cn(
          "fixed inset-x-0 z-[35] bg-brand-black/95 backdrop-blur border-b border-brand-gray/30 px-4 py-2.5",
          "top-[var(--header-mobile-height,4rem)] md:top-0"
        )}
        aria-hidden={false}
      >
        <p className="font-display text-sm md:text-base text-brand-white truncate text-center max-w-3xl mx-auto tracking-wide">
          {productName}
        </p>
      </div>

      {/* CTA bas — mobile + desktop */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur border-t border-brand-gray/30 safe-area-pb min-w-0">
        {showMobilePicker && (
          <div className="px-3 pt-3 border-b border-brand-gray/20 max-h-[42vh] overflow-y-auto">
            <p className="text-xs text-brand-white/60 mb-2">{t("addPiece.pickSubtitle")}</p>
            <PieceThumbnailPicker
              products={allProducts}
              slots={mobileSlotSlugs}
              onSlotsChange={(slots) => {
                slots.forEach((slug, i) => onExtraChange(i, slug));
                for (let i = slots.length; i < extrasNeeded; i++) onExtraChange(i, null);
              }}
              activeSlot={mobilePickerSlot}
              onActiveSlotChange={setMobilePickerSlot}
              compact
              allowAllProducts
            />
            {mobileBundleSavings > 0 && canAddToCart && (
              <p className="text-xs text-emerald-400/95 font-price-figures mt-2 mb-1">
                {t("addPiece.cumulativeSavings", { amount: formatPrice(mobileBundleSavings, locale) })}
              </p>
            )}
          </div>
        )}
        <div className="p-3 md:px-6 md:py-4 flex items-center gap-3 min-w-0 max-w-7xl mx-auto">
          <div className="shrink-0 min-w-0 hidden sm:block md:min-w-[120px]">
            <PriceDisplay amount={displayPrice} />
          </div>
          <div className="shrink-0 min-w-0 sm:hidden">
            <PriceDisplay amount={displayPrice} compact />
            {isMobile && extrasNeeded > 0 && !canAddToCart && (
              <p className="text-[10px] text-brand-white/50 mt-0.5">
                {t("addPiece.onlyPrice", { price: formatPrice(ADD_PIECE_PRICE_MAD, locale) })}
                {extrasNeeded > 1 ? ` × ${extrasNeeded}` : ""}
              </p>
            )}
          </div>
          <Button fullWidth onClick={onAddToCart} disabled={!canAddToCart}>
            <span className="hidden md:inline">
              <AddToCartLabel amount={displayPrice} />
            </span>
            <span className="md:hidden">{t("common.addToCart")}</span>
          </Button>
        </div>
      </div>
    </>
  );
}

/** Spacer so page content is not hidden under sticky bars. */
export function ProductStickySpacer({ extrasNeeded }: { extrasNeeded: number }) {
  const isMobile = useIsMobile();
  const tall = isMobile && extrasNeeded > 0;
  return <div className={cn("pointer-events-none", tall ? "h-52 md:h-24" : "h-24")} aria-hidden />;
}
