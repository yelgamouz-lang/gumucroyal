"use client";

import { useState } from "react";
import Link from "next/link";
import type { Offer, Product } from "@/types/product";
import { Badge, Button, Price } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { getOfferBadgeKey, getOfferLabelKey, useTranslation } from "@/i18n/I18nProvider";
import { getProductName } from "@/lib/products";

export function ProductCard({ product, premium }: { product: Product; premium?: boolean }) {
  const { t, locale } = useTranslation();
  const productName = getProductName(product, locale);
  const badgeKey = product.badge ? `badges.${product.badge}` : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block overflow-hidden transition-all duration-500",
        premium
          ? "bg-brand-black border border-brand-gold/10 rounded-lg hover:border-brand-gold/45 hover:shadow-[0_0_40px_rgba(201,169,39,0.06)]"
          : "bg-brand-black border border-brand-gold/10 rounded-lg hover:border-brand-gold/30"
      )}
    >
      <div className="aspect-square overflow-hidden relative">
        <OptimizedImage
          src={product.images[0]?.url}
          alt={productName}
          width={600}
          height={600}
          sizes="(max-width: 768px) 100vw, 25vw"
          className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        {product.badge && (
          <div className="absolute top-3 end-3">
            <Badge>{badgeKey ? t(badgeKey) : product.badge}</Badge>
          </div>
        )}
      </div>
      <div className="p-5 md:p-6">
        <h3 className="font-display text-lg md:text-xl text-brand-white mb-2 line-clamp-2 tracking-wide font-normal group-hover:text-brand-gold/90 transition-colors">
          {productName}
        </h3>
        <Price current={product.base_price_mad} compareAt={product.compare_at_price_mad} />
        <Button variant={premium ? "primary" : "secondary"} fullWidth className="mt-5 pointer-events-none text-xs">
          {t("common.viewDetails")}
        </Button>
      </div>
    </Link>
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
  const main = images[active] || images[0];

  return (
    <div>
      <div className="aspect-square relative overflow-hidden bg-brand-black mb-3">
        {main && (
          <OptimizedImage
            src={main.url}
            alt={main.alt || productName}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square relative overflow-hidden border-2 transition-colors",
                i === active ? "border-brand-gold" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <OptimizedImage src={img.url} alt={img.alt} fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductHeroCard({
  product,
  subtitle,
  selectedOffer,
  savings,
  onAddToCart,
}: {
  product: Product;
  subtitle: string;
  selectedOffer: Offer;
  savings: number;
  onAddToCart: () => void;
}) {
  const { t, locale } = useTranslation();
  const productName = getProductName(product, locale);

  return (
    <div className="flex flex-col">
      <p className="text-brand-gold/80 text-sm uppercase tracking-widest mb-2">{t("common.byBrand")}</p>
      <h1 className="font-display text-3xl md:text-4xl text-brand-white mb-3">{productName}</h1>
      <p className="text-brand-white/70 text-lg mb-4 leading-relaxed">{subtitle}</p>
      <div className="mt-6 p-5 border border-brand-gold/30 bg-brand-black/40">
        {selectedOffer.compare_at_price_mad && selectedOffer.compare_at_price_mad > selectedOffer.price_mad && (
          <p className="text-brand-white/40 line-through text-lg mb-1" dir="ltr">
            {formatPrice(selectedOffer.compare_at_price_mad)}
          </p>
        )}
        <p className="text-4xl font-bold tabular-nums text-brand-gold" dir="ltr">
          {formatPrice(selectedOffer.price_mad)}
        </p>
        {savings > 0 && (
          <p className="text-color-trust font-semibold mt-2">
            {t("common.saveAmount", { amount: formatPrice(savings) })} — {t("productPage.zirconHighlight")}
          </p>
        )}
      </div>
      <Button fullWidth className="mt-6 hidden md:flex" onClick={onAddToCart}>
        {t("common.addToCartWithPrice", { price: formatPrice(selectedOffer.price_mad) })}
      </Button>
      <p className="text-sm text-brand-white/50 mt-4 text-center">{t("productPage.heroCod")}</p>
    </div>
  );
}

export function OfferSelector({
  offers,
  selectedId,
  onSelect,
}: {
  offers: Offer[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { t, dir } = useTranslation();

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const selected = offer.id === selectedId;
        const savings = offer.savings_mad || (offer.compare_at_price_mad ? offer.compare_at_price_mad - offer.price_mad : 0);
        const badgeKey = getOfferBadgeKey(offer.badge_ar);
        const pieceLabel = offer.quantity === 1 ? t("common.piece") : t("common.pieces");

        return (
          <button
            key={offer.id}
            type="button"
            onClick={() => onSelect(offer.id)}
            className={cn(
              "w-full p-4 border transition-all relative",
              dir === "rtl" ? "text-right" : "text-left",
              selected ? "border-brand-gold bg-brand-gold/5 shadow-lg shadow-brand-gold/10" : "border-brand-gray hover:border-brand-gold/50"
            )}
          >
            {badgeKey && (
              <span className="absolute top-0 start-4 -translate-y-1/2 gold-brilliant-btn text-brand-black text-xs font-bold px-3 py-0.5">
                {t(badgeKey)}
              </span>
            )}
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="font-display text-lg tracking-wide">{t(getOfferLabelKey(offer.quantity))}</p>
                <p className="text-sm text-brand-white/60 mt-1">
                  {offer.quantity} {pieceLabel}
                </p>
                {savings > 0 && (
                  <p className="text-color-trust text-sm font-semibold mt-2">
                    {t("common.saveBulk", { amount: formatPrice(savings) })}
                  </p>
                )}
              </div>
              <div className={cn("shrink-0", dir === "rtl" ? "text-left" : "text-right")}>
                {offer.compare_at_price_mad && offer.compare_at_price_mad > offer.price_mad && (
                  <p className="text-brand-white/40 line-through text-sm" dir="ltr">
                    {formatPrice(offer.compare_at_price_mad)}
                  </p>
                )}
                <p className="font-bold tabular-nums text-brand-gold text-xl" dir="ltr">
                  {formatPrice(offer.price_mad)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
