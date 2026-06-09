"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { PieceThumbnailPicker } from "@/components/shared/PieceThumbnailPicker";
import { PriceDisplay } from "@/components/shared/UI";
import {
  ADD_PIECE_PRICE_MAD,
  buildAddPieceCandidates,
  buildAllAddPieceCandidates,
  checkoutAddOnTotal,
  maxAddPieceSavings,
  totalAddPieceSavings,
  type AddPieceCandidate,
} from "@/lib/addPieceOffer";
import { formatPrice } from "@/lib/format";
import { fetchProducts } from "@/lib/products";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

type AddPieceOfferPanelProps = {
  maxSlots: number;
  selected: AddPieceCandidate[];
  onSelectedChange: (items: AddPieceCandidate[]) => void;
  baseTotal?: number;
  className?: string;
  /** Golden pulse when checkout recap opens (2–3 s). */
  flashOnOpen?: boolean;
  /** Mobile: all 3 products selectable with thumbnails. */
  mobileFreeChoice?: boolean;
};

export function AddPieceOfferPanel({
  maxSlots,
  selected,
  onSelectedChange,
  baseTotal,
  className,
  flashOnOpen = false,
  mobileFreeChoice = false,
}: AddPieceOfferPanelProps) {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [openFlash, setOpenFlash] = useState(flashOnOpen);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!flashOnOpen) return;
    setOpenFlash(true);
    const timer = window.setTimeout(() => setOpenFlash(false), 2800);
    return () => window.clearTimeout(timer);
  }, [flashOnOpen]);

  const candidates = useMemo(
    () => (mobileFreeChoice ? buildAllAddPieceCandidates(products) : buildAddPieceCandidates(products)),
    [products, mobileFreeChoice]
  );
  const candidateBySlug = useMemo(() => new Map(candidates.map((c) => [c.slug, c])), [candidates]);
  const maxSavings = useMemo(() => maxAddPieceSavings(products), [products]);

  const slots: (string | null)[] = Array.from({ length: maxSlots }, (_, i) => selected[i]?.slug ?? null);
  const totalSavings = totalAddPieceSavings(selected);
  const previewTotal = baseTotal != null ? baseTotal + checkoutAddOnTotal(selected.length) : null;

  if (maxSlots <= 0 || products.length === 0) return null;

  const handleSlotsChange = (nextSlots: (string | null)[]) => {
    const next: AddPieceCandidate[] = [];
    for (const slug of nextSlots.slice(0, maxSlots)) {
      if (!slug) continue;
      const c = candidateBySlug.get(slug);
      if (c) next.push(c);
    }
    onSelectedChange(next);
  };

  return (
    <div
      className={cn(
        "add-piece-offer-panel rounded-xl p-4 sm:p-5",
        openFlash && "add-piece-offer-panel-open-flash",
        className
      )}
    >
      <h3 className="font-display text-base sm:text-lg text-white tracking-wide leading-snug">
        {t("addPiece.headlinePrefix")}{" "}
        <span className="add-piece-price-shimmer font-price-figures">
          {formatPrice(ADD_PIECE_PRICE_MAD, locale)}
        </span>
      </h3>
      {maxSavings > 0 && (
        <p className="add-piece-max-savings text-sm sm:text-base mt-2 mb-1 font-price-figures">
          {t("addPiece.maxSavings", { amount: formatPrice(maxSavings, locale) })}
        </p>
      )}
      <p className="text-sm text-white/80 mb-4 leading-relaxed">{t("addPiece.pickSubtitle")}</p>

      <PieceThumbnailPicker
        products={products}
        slots={slots}
        onSlotsChange={handleSlotsChange}
        activeSlot={activeSlot}
        onActiveSlotChange={setActiveSlot}
        compact
        allowAllProducts={mobileFreeChoice}
      />

      {selected.length > 0 && totalSavings > 0 && (
        <div className="mt-4 pt-3 border-t border-white/20 text-center space-y-1">
          <p className="text-sm sm:text-base text-white font-price-figures font-medium">
            {t("addPiece.cumulativeSavings", { amount: formatPrice(totalSavings, locale) })}
          </p>
          {previewTotal != null && (
            <p className="text-sm text-white/80 mt-2">
              {t("addPiece.newTotal")}{" "}
              <PriceDisplay amount={previewTotal} compact />
            </p>
          )}
        </div>
      )}
    </div>
  );
}
