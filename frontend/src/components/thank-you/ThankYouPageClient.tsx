"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Banknote, Check, Gem, Phone, Truck } from "lucide-react";
import { getOrder } from "@/lib/api";
import { SectionWrapper, PriceDisplay, GoldIcon } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { trackPurchase } from "@/lib/tracking";
import { getProductName } from "@/lib/products";
import { useTranslation } from "@/i18n/I18nProvider";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";

type OrderItem = {
  product_name_ar: string;
  offer_label_ar?: string | null;
  total_price_mad: number;
  is_upsell?: boolean;
};

type OrderData = {
  order_number: string;
  total_mad: number;
  items?: OrderItem[];
  event_id?: string | null;
};

function OrderRecapLine({
  label,
  amount,
  accent,
}: {
  label: string;
  amount: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-8 py-4 border-b border-brand-gold/10 last:border-0",
        accent && "pt-5 mt-1 border-t border-brand-gold/25 border-b-0"
      )}
    >
      <span
        className={cn(
          "font-product leading-snug min-w-0 flex-1 pe-6 break-words",
          accent ? "text-brand-gold text-base md:text-lg" : "text-brand-white/85 text-sm md:text-base"
        )}
      >
        {label}
      </span>
      <span dir="ltr" className="shrink-0 pt-0.5">
        <PriceDisplay amount={amount} compact={!accent} className={accent ? "text-xl md:text-2xl" : undefined} />
      </span>
    </div>
  );
}

function SuggestionCard({ product, locale }: { product: Product; locale: string }) {
  const { t } = useTranslation();
  const name = getProductName(product, locale as "ar" | "fr" | "en");

  return (
    <Link
      href={`/products/${product.slug}`}
      className="thank-you-suggestion group block min-w-0 overflow-hidden transition-colors duration-300"
    >
      <div className="relative aspect-square bg-brand-black border border-brand-gold/12 group-hover:border-brand-gold/35 transition-colors">
        <OptimizedImage
          src={product.images[0]?.url}
          alt={name}
          fill
          sizes="(max-width: 640px) 45vw, 200px"
          className="group-hover:scale-[1.02] transition-transform duration-500"
        />
      </div>
      <div className="pt-3 min-w-0">
        <p className="font-product text-xs md:text-sm line-clamp-2 leading-snug mb-2 break-words text-brand-white/80 group-hover:text-brand-gold/90 transition-colors">
          {name}
        </p>
        <PriceDisplay amount={product.base_price_mad} compact />
      </div>
    </Link>
  );
}

export function ThankYouPageClient({ orderId, initialProducts }: { orderId: string; initialProducts: Product[] }) {
  const { t, locale } = useTranslation();
  const [order, setOrder] = useState<OrderData | null>(null);
  const products = initialProducts;
  const tracked = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const resetCheckoutFlow = useUIStore((s) => s.resetCheckoutFlow);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000";

  useEffect(() => {
    clearCart();
    resetCheckoutFlow();
  }, [clearCart, resetCheckoutFlow]);

  useEffect(() => {
    if (orderId) getOrder(orderId).then(setOrder).catch(() => setOrder(null));
  }, [orderId]);

  useEffect(() => {
    if (order?.event_id && !tracked.current) {
      tracked.current = true;
      trackPurchase(order.total_mad, ["GUMUCROYAL"], order.event_id, order.order_number);
    }
  }, [order]);

  const suggestions = useMemo(() => {
    if (!order?.items?.length || !products.length) return products.slice(0, 3);
    const ordered = new Set(order.items.map((i) => i.product_name_ar));
    const others = products.filter((p) => !ordered.has(p.name_ar));
    return others.length > 0 ? others : products;
  }, [order, products]);

  const whatsappUrl = useMemo(() => {
    const number = waNumber.replace(/\D/g, "");
    const text =
      locale === "ar"
        ? order
          ? `سلام، عندي سؤال على الطلب ${order.order_number}.`
          : "سلام، عندي سؤال."
        : order
          ? `Bonjour, j'ai une question sur la commande ${order.order_number}.`
          : "Bonjour, j'ai une question.";
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }, [order, waNumber, locale]);

  const reassurance = [
    { icon: Banknote, text: t("thankYou.reassuranceCod") },
    { icon: Truck, text: t("thankYou.reassuranceDelivery") },
    { icon: Gem, text: t("thankYou.reassuranceSteel") },
  ];

  return (
    <SectionWrapper dark className="thank-you-page pb-20 md:pb-24 pt-10 md:pt-14">
      <div className="max-w-xl mx-auto min-w-0 space-y-10 md:space-y-12">
        {/* 1. Confirmation */}
        <header className="text-center space-y-5 md:space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-brand-gold/45 bg-brand-gold/5">
            <Check className="w-5 h-5 text-brand-gold stroke-[1.5]" aria-hidden />
          </div>
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-brand-white tracking-wide leading-snug">
            {t("thankYou.title")}
          </h1>
          {order ? (
            <div className="thank-you-order-id inline-block px-5 py-3 md:px-6 md:py-3.5 rounded-lg border border-brand-gold/35 bg-brand-black/80">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.28em] text-brand-gold/55 mb-1.5">
                {t("thankYou.orderLabel")}
              </p>
              <p dir="ltr" className="font-price-figures text-lg md:text-xl text-brand-gold tracking-wider">
                {order.order_number}
              </p>
            </div>
          ) : (
            <p className="text-brand-white/50 text-sm">{t("common.loadingOrder")}</p>
          )}
        </header>

        {order && (
          <>
            {/* 2. Bandeau appel — élément dominant */}
            <div className="thank-you-call-banner text-center" role="status">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand-gold/30 bg-brand-gold/5 mb-4">
                <Phone className="w-4 h-4 text-brand-gold stroke-[1.5]" aria-hidden />
              </div>
              <p className="text-base md:text-lg text-brand-white leading-relaxed font-light mb-3">
                {t("thankYou.callHeadline")}
              </p>
              <p className="text-sm text-brand-white/55 leading-relaxed max-w-md mx-auto">
                {t("thankYou.callHours")}
              </p>
            </div>

            {/* 3. Numéro inconnu */}
            <p className="text-center text-sm md:text-base text-brand-white/65 leading-relaxed px-2">
              {t("thankYou.unknownNumber")}
            </p>

            {/* 4. Récapitulatif */}
            <div className="thank-you-recap">
              <h2 className="font-display text-lg md:text-xl text-brand-gold mb-5 tracking-wide text-center">
                {t("thankYou.recapTitle")}
              </h2>
              <div>
                {order.items?.map((item, i) => (
                  <OrderRecapLine
                    key={`${item.product_name_ar}-${i}`}
                    label={
                      item.offer_label_ar && !item.is_upsell
                        ? `${item.product_name_ar} (${item.offer_label_ar})`
                        : item.product_name_ar
                    }
                    amount={item.total_price_mad}
                  />
                ))}
                <OrderRecapLine label={t("common.totalCod")} amount={order.total_mad} accent />
              </div>
            </div>

            {/* 5. Réassurance */}
            <ul className="thank-you-reassurance space-y-4 md:space-y-5">
              {reassurance.map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-brand-gold/20 bg-brand-gold/5">
                    <GoldIcon icon={icon} className="w-[17px] h-[17px]" />
                  </span>
                  <span className="text-brand-white/70 text-sm md:text-base leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>

            {/* 6. Suggestions produits */}
            {suggestions.length > 0 && (
              <div>
                <h2 className="font-display text-lg md:text-xl text-brand-gold mb-6 tracking-wide text-center leading-snug">
                  {t("thankYou.completeTitle")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                  {suggestions.slice(0, 3).map((p) => (
                    <SuggestionCard key={p.slug} product={p} locale={locale} />
                  ))}
                </div>
              </div>
            )}

            {/* 7. WhatsApp discret */}
            <div className="text-center pt-2 border-t border-brand-gold/10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-white/45 hover:text-brand-gold/70 transition-colors underline underline-offset-4 decoration-brand-gold/25"
              >
                {t("thankYou.whatsappHint")}
              </a>
            </div>
          </>
        )}

        <div className="text-center pt-2">
          <Link
            href="/collection"
            className="text-xs uppercase tracking-[0.2em] text-brand-gold/60 hover:text-brand-gold transition-colors"
          >
            {t("common.backToCollection")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
