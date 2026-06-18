"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Offer, Product } from "@/types/product";
import { Badge, Button, AddToCartLabel, Price, PriceDesireLine, PriceDisplay } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { PieceThumbnailPicker } from "@/components/shared/PieceThumbnailPicker";
import { formatPrice } from "@/lib/format";
import { ProductHeroReassurance } from "@/components/shared/ReassuranceBar";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/I18nProvider";
import {
  ADD_PIECE_PRICE_MAD,
  bundleSavings,
  emptyExtraSlugs,
  extrasComplete,
  offersDisplayOrder,
  resolveExtraProducts,
  tierTotalPrice,
} from "@/lib/offerTiers";
import { getProductName } from "@/lib/products";
import { getOfferSubtitleKey } from "@/i18n/I18nProvider";
import { useIsMobile } from "@/lib/useIsMobile";

export function ProductCard({ product, premium }: { product: Product; premium?: boolean }) {
  const { t, locale } = useTranslation();
  const productName = getProductName(product, locale);
  const badgeKey = product.badge ? `badges.${product.badge}` : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "luxury-card group block min-w-0 w-full overflow-hidden",
        premium
          ? "bg-brand-black border border-brand-gold/10 rounded-lg hover:border-brand-gold/45"
          : "bg-brand-black border border-brand-gold/10 rounded-lg hover:border-brand-gold/30"
      )}
    >
      <div className="aspect-square md:aspect-[4/5] overflow-hidden relative min-h-[260px] md:min-h-[320px]">
        <OptimizedImage
          src={product.images[0]?.url}
          alt={productName}
          width={720}
          height={900}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="luxury-card__image w-full h-full"
        />
        {product.badge && (
          <div className="absolute top-3 end-3">
            <Badge>{badgeKey ? t(badgeKey) : product.badge}</Badge>
          </div>
        )}
      </div>
      <div className="p-5 md:p-6 min-w-0">
        <h3 className="font-display text-lg md:text-xl text-brand-white mb-2 line-clamp-2 tracking-wide font-normal group-hover:text-brand-gold/90 transition-colors break-words [overflow-wrap:anywhere]">
          {productName}
        </h3>
        <Price current={product.base_price_mad} />
        <Button variant={premium ? "primary" : "secondary"} fullWidth className="mt-5 pointer-events-none text-xs">
          {t("common.discoverPiece")}
        </Button>
      </div>
    </Link>
  );
}

function GalleryPlaceholder({ name }: { name: string }) {
  return (
    <div className="aspect-square relative overflow-hidden bg-brand-black rounded-lg border border-brand-gold/15 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-brand-gold/30" aria-hidden />
        <p className="font-display text-brand-gold/60 text-sm tracking-wide break-words [overflow-wrap:anywhere]">
          {name}
        </p>
      </div>
    </div>
  );
}

export function ProductGallery({
  images,
  productName,
  priority = false,
}: {
  images: Product["images"];
  productName: string;
  priority?: boolean;
}) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const valid = images.filter((img) => img && img.url);

  if (valid.length === 0) {
    return <GalleryPlaceholder name={productName} />;
  }

  const main = valid[active] || valid[0];
  const multi = valid.length > 1;

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.max(0, Math.min(valid.length - 1, idx)));
  };

  return (
    <div className="min-w-0">
      {/* Mobile — swipeable carousel */}
      <div className="md:hidden">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-lg"
        >
          {valid.map((img, i) => (
            <div
              key={img.url}
              className="snap-center shrink-0 basis-full aspect-square relative overflow-hidden bg-brand-black"
            >
              <OptimizedImage
                src={img.url}
                alt={img.alt || productName}
                fill
                priority={priority && i === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        {multi && (
          <div className="flex justify-center gap-2 mt-3">
            {valid.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`${productName} ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-brand-gold" : "w-2 bg-brand-gold/30"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop — main image + thumbnails */}
      <div className="hidden md:block">
        <div className="aspect-square relative overflow-hidden bg-brand-black mb-3 rounded-lg">
          {main && (
            <OptimizedImage
              src={main.url}
              alt={main.alt || productName}
              fill
              priority={priority}
              sizes="50vw"
            />
          )}
        </div>
        {multi && (
          <div className="grid grid-cols-4 gap-2">
            {valid.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${productName} ${i + 1}`}
                className={cn(
                  "aspect-square relative overflow-hidden rounded-md border-2 transition-colors",
                  i === active ? "border-brand-gold" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <OptimizedImage src={img.url} alt={img.alt || productName} fill sizes="120px" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductHeroCard({
  product,
  subtitle,
  desireLine,
  selectedOffer,
  onAddToCart,
}: {
  product: Product;
  subtitle: string;
  desireLine: string;
  selectedOffer: Offer;
  onAddToCart: () => void;
}) {
  const { t, locale } = useTranslation();
  const productName = getProductName(product, locale);

  return (
    <div className="flex flex-col min-w-0">
      <h1 className="font-display text-3xl md:text-4xl text-brand-white mb-4 break-words [overflow-wrap:anywhere] leading-tight">
        {productName}
      </h1>
      <p className="text-brand-white/65 text-base md:text-lg mb-6 leading-relaxed break-words [overflow-wrap:anywhere]">
        {subtitle}
      </p>
      <div className="p-5 md:p-6 border border-brand-gold/25 bg-brand-black/40">
        <PriceDisplay amount={product.base_price_mad} hero />
        <PriceDesireLine text={desireLine} />
        <ProductHeroReassurance />
      </div>
      <Button fullWidth className="mt-6 hidden md:flex" onClick={onAddToCart}>
        <AddToCartLabel amount={selectedOffer.price_mad} />
      </Button>
    </div>
  );
}

export function OfferSelector({
  offers,
  allProducts,
  basePriceMad,
  selectedId,
  onSelect,
  extraSlugs,
  onExtraChange,
}: {
  offers: Offer[];
  allProducts: Product[];
  basePriceMad: number;
  selectedId: string;
  onSelect: (id: string) => void;
  extraSlugs: string[];
  onExtraChange: (index: number, slug: string | null) => void;
}) {
  const { t, dir, locale } = useTranslation();
  const isMobile = useIsMobile();
  const [activeSlot, setActiveSlot] = useState(0);
  const ordered = offersDisplayOrder(offers);

  return (
    <div className="space-y-3">
      {ordered.map((offer) => {
        const selected = offer.id === selectedId;
        const tierKey =
          offer.quantity === 1 ? "offers.single" : offer.quantity === 2 ? "offers.duo" : "offers.packUltimate";

        const extrasNeeded = Math.max(0, offer.quantity - 1);
        const slotSlugs = extraSlugs.slice(0, extrasNeeded).map((s) => s || null);
        const extras = resolveExtraProducts(extraSlugs.slice(0, extrasNeeded), allProducts);
        const savings = extras.length > 0 ? bundleSavings(extras) : 0;
        const displayPrice = tierTotalPrice(basePriceMad, offer.quantity as 1 | 2 | 3);
        const isFeaturedTier = offer.quantity === 2;

        return (
          <div
            key={offer.id}
            className={cn(
              "offer-tier-card w-full transition-colors relative min-w-0 rounded-lg",
              isFeaturedTier && "offer-tier-duo-pulse",
              selected && "offer-tier-selected"
            )}
          >
            {isFeaturedTier && (
              <div className="absolute top-0 inset-x-0 z-10 flex justify-center px-3 -translate-y-1/2 pointer-events-none">
                <span className="gold-brilliant-btn text-brand-black text-[11px] sm:text-xs font-bold px-3 py-1 leading-snug text-center whitespace-normal max-w-[min(100%,20rem)]">
                  {t("offers.bestForGift")}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                onSelect(offer.id);
                if (extrasNeeded > 0) setActiveSlot(0);
              }}
              className={cn(
                "w-full p-4 min-w-0",
                isFeaturedTier && "pt-6 sm:pt-7",
                dir === "rtl" ? "text-right" : "text-left"
              )}
            >
              <div className="flex justify-between items-start gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg tracking-wide break-words">{t(tierKey)}</p>
                  <p className="text-sm text-brand-white/60 mt-1">{t(getOfferSubtitleKey(offer.quantity))}</p>
                  {selected && extrasNeeded > 0 && savings > 0 && (
                    <p className="text-sm text-emerald-400/95 mt-2 font-price-figures font-medium">
                      {t("addPiece.cumulativeSavings", { amount: formatPrice(savings, locale) })}
                    </p>
                  )}
                  {!selected && offer.quantity >= 2 && (
                    <p className="text-xs text-brand-gold/70 mt-2 font-price-figures">
                      {t("addPiece.onlyPrice", { price: formatPrice(ADD_PIECE_PRICE_MAD, locale) })}
                      {offer.quantity === 3 ? ` × 2` : ""}
                    </p>
                  )}
                </div>
                <div className={cn("shrink-0", dir === "rtl" ? "text-left" : "text-right")}>
                  <PriceDisplay amount={displayPrice} offer />
                </div>
              </div>
            </button>

            {selected && extrasNeeded > 0 && isMobile && (
              <p className="px-4 pb-3 text-xs text-brand-white/60 border-t border-brand-gold/15 pt-3">
                {t("addPiece.pickSubtitle")}
              </p>
            )}

            {selected && extrasNeeded > 0 && allProducts.length > 0 && !isMobile && (
              <div
                className="px-4 pb-4 pt-1 border-t border-brand-gold/15 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs text-brand-white/60 mb-3">{t("addPiece.pickSubtitle")}</p>
                <PieceThumbnailPicker
                  products={allProducts}
                  slots={slotSlugs}
                  onSlotsChange={(slots) => {
                    slots.forEach((slug, i) => onExtraChange(i, slug));
                    for (let i = slots.length; i < extrasNeeded; i++) onExtraChange(i, null);
                  }}
                  activeSlot={activeSlot}
                  onActiveSlotChange={setActiveSlot}
                  compact={isMobile}
                  allowAllProducts={isMobile}
                />
                {extrasNeeded > 0 && !extrasComplete(extraSlugs, extrasNeeded) && !isMobile && (
                  <p className="text-xs text-amber-400/90 mt-3">{t("offers.completeSelection")}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
