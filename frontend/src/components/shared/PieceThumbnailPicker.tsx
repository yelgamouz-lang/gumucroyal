"use client";

import type { Product } from "@/types/product";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { ADD_PIECE_PRICE_MAD, addPieceSavings, isAddPieceEligible } from "@/lib/addPieceOffer";
import { formatPrice } from "@/lib/format";
import { getProductName } from "@/lib/products";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export type PieceSlotState = (string | null)[];

type PieceThumbnailPickerProps = {
  products: Product[];
  slots: PieceSlotState;
  onSlotsChange: (slots: PieceSlotState) => void;
  activeSlot: number;
  onActiveSlotChange?: (index: number) => void;
  compact?: boolean;
  /** Mobile: all products selectable (no grayed-out items). */
  allowAllProducts?: boolean;
  className?: string;
};

function slotLabel(n: number, t: (k: string, p?: Record<string, string | number>) => string) {
  return t("offers.pickPieceN", { n });
}

export function PieceThumbnailPicker({
  products,
  slots,
  onSlotsChange,
  activeSlot,
  onActiveSlotChange,
  compact,
  allowAllProducts = false,
  className,
}: PieceThumbnailPickerProps) {
  const { t, locale, dir } = useTranslation();

  const isSelectable = (basePriceMad: number) => allowAllProducts || isAddPieceEligible(basePriceMad);

  const handleProductClick = (slug: string) => {
    const product = products.find((p) => p.slug === slug);
    if (!product || !isSelectable(product.base_price_mad)) return;

    const next = [...slots];
    if (next[activeSlot] === slug) {
      next[activeSlot] = null;
    } else {
      next[activeSlot] = slug;
    }
    onSlotsChange(next);

    if (next[activeSlot] === slug) {
      const nextEmpty = next.findIndex((s, i) => i !== activeSlot && s == null);
      if (nextEmpty >= 0) onActiveSlotChange?.(nextEmpty);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {slots.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((slug, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActiveSlotChange?.(i);
              }}
              className={cn(
                "text-xs px-3 py-1.5 border rounded-full transition-colors",
                activeSlot === i
                  ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                  : slug
                    ? "border-brand-gold/40 text-brand-white/80"
                    : "border-brand-gray/40 text-brand-white/50"
              )}
            >
              {slotLabel(i + 2, t)}
              {slug ? " ✓" : ""}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "grid gap-2.5",
          compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        )}
        role="listbox"
        aria-label={t("addPiece.carouselLabel")}
      >
        {products.map((p) => {
          const name = getProductName(p, locale);
          const eligible = isSelectable(p.base_price_mad);
          const isSelectedInActive = slots[activeSlot] === p.slug;

          return (
            <button
              key={p.slug}
              type="button"
              role="option"
              aria-selected={isSelectedInActive}
              disabled={!eligible}
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(p.slug);
              }}
              className={cn(
                "relative flex flex-col border rounded-lg overflow-hidden transition-all text-start min-w-0",
                dir === "rtl" ? "text-right" : "text-left",
                !eligible && "opacity-40 cursor-not-allowed border-brand-gray/20",
                isSelectedInActive && "border-brand-gold ring-2 ring-brand-gold/60 bg-brand-gold/10",
                eligible && !isSelectedInActive && "border-brand-gray/40 hover:border-brand-gold/60 hover:bg-brand-gold/5"
              )}
            >
              <div className="relative aspect-square w-full bg-brand-black">
                <OptimizedImage src={p.images[0]?.url} alt={name} fill sizes="120px" />
                {isSelectedInActive && (
                  <span className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-brand-gold text-brand-black flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 min-w-0">
                <p className="font-product text-[11px] leading-snug line-clamp-2 break-words">{name}</p>
                {eligible && (
                  <p className="text-[10px] text-brand-gold font-price-figures">
                    {t("addPiece.onlyPrice", { price: formatPrice(ADD_PIECE_PRICE_MAD, locale) })}
                  </p>
                )}
                {isSelectedInActive && eligible && (
                  <p className="text-[10px] text-emerald-400/90 font-price-figures mt-0.5">
                    {t("addPiece.savings", { amount: formatPrice(addPieceSavings(p.base_price_mad), locale) })}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
