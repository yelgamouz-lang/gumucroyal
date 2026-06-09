"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Banknote, Gem, Truck } from "lucide-react";
import { getOrder } from "@/lib/api";
import { SectionWrapper, PriceDisplay, GoldIcon } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { trackPurchase } from "@/lib/tracking";
import { resolveCallBannerKey } from "@/lib/callWindow";
import { fetchProducts, getProductName } from "@/lib/products";
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
  confirmed_at?: string | null;
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
        "flex items-start justify-between gap-6 py-3 border-b border-brand-gray/20 last:border-0",
        accent && "text-brand-gold"
      )}
    >
      <span className="font-product text-sm md:text-base leading-snug min-w-0 flex-1 pe-4 break-words">
        {label}
      </span>
      <span dir="ltr" className="shrink-0 pt-0.5">
        <PriceDisplay amount={amount} compact={!accent} className={accent ? "text-lg" : undefined} />
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
      className="group block min-w-0 rounded-lg border border-brand-gold/15 bg-brand-black/40 overflow-hidden hover:border-brand-gold/40 transition-colors"
    >
      <div className="relative aspect-square bg-brand-black">
        <OptimizedImage
          src={product.images[0]?.url}
          alt={name}
          fill
          sizes="(max-width: 640px) 45vw, 180px"
          className="group-hover:scale-[1.02] transition-transform duration-500"
        />
      </div>
      <div className="p-3 min-w-0">
        <p className="font-product text-xs md:text-sm line-clamp-2 leading-snug mb-2 break-words">{name}</p>
        <PriceDisplay amount={product.base_price_mad} compact />
        <p className="text-[10px] text-brand-gold/70 mt-2 uppercase tracking-wider">{t("thankYou.viewPiece")}</p>
      </div>
    </Link>
  );
}

export function ThankYouPageClient({ orderId }: { orderId: string }) {
  const { t, locale } = useTranslation();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const tracked = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const resetCheckoutFlow = useUIStore((s) => s.resetCheckoutFlow);

  useEffect(() => {
    clearCart();
    resetCheckoutFlow();
  }, [clearCart, resetCheckoutFlow]);

  useEffect(() => {
    if (orderId) getOrder(orderId).then(setOrder).catch(() => setOrder(null));
    fetchProducts().then(setProducts);
  }, [orderId]);

  useEffect(() => {
    if (order?.event_id && !tracked.current) {
      tracked.current = true;
      trackPurchase(order.total_mad, ["GUMUCROYAL"], order.event_id, order.order_number);
    }
  }, [order]);

  const callBannerKey = useMemo(
    () => resolveCallBannerKey(order?.confirmed_at),
    [order?.confirmed_at]
  );

  const suggestions = useMemo(() => {
    if (!order?.items?.length || !products.length) return products.slice(0, 3);
    const ordered = new Set(order.items.map((i) => i.product_name_ar));
    const others = products.filter((p) => !ordered.has(p.name_ar));
    return others.length > 0 ? others : products;
  }, [order, products]);

  const reassurance = [
    { icon: Banknote, text: t("thankYou.reassuranceCod") },
    { icon: Truck, text: t("thankYou.reassuranceDelivery") },
    { icon: Gem, text: t("thankYou.reassuranceSteel") },
  ];

  return (
    <SectionWrapper dark className="pb-16 md:pb-20">
      <div className="max-w-2xl mx-auto min-w-0">
        {/* Bandeau appel — darija conversion */}
        <div
          className="mb-8 rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-4 py-4 md:px-5 md:py-5 text-center"
          role="status"
        >
          <p className="text-sm md:text-base text-brand-white/90 leading-relaxed font-light">{t(callBannerKey)}</p>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-gold mb-3 tracking-wide">{t("thankYou.title")}</h1>
          {order ? (
            <p className="text-brand-white/60 text-sm">
              {t("common.orderNumber")}:{" "}
              <strong dir="ltr" className="text-brand-white/85 font-price-figures">
                {order.order_number}
              </strong>
            </p>
          ) : (
            <p className="text-brand-white/60">{t("common.loadingOrder")}</p>
          )}
        </div>

        {order && (
          <>
            <div className="bg-brand-charcoal border border-brand-gray/30 rounded-lg p-5 md:p-6 mb-8">
              <h2 className="font-display text-lg text-brand-gold mb-4 tracking-wide">{t("thankYou.recapTitle")}</h2>
              <div className="divide-y divide-brand-gray/15">
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

            <div className="mb-10 rounded-lg border border-brand-gold/15 bg-brand-black/50 p-5 md:p-6">
              <h2 className="font-display text-lg text-brand-gold mb-4 tracking-wide">{t("thankYou.waitTitle")}</h2>
              <ul className="space-y-4">
                {reassurance.map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <GoldIcon icon={icon} className="w-[18px] h-[18px] shrink-0 mt-0.5" />
                    <span className="text-brand-white/70 text-sm leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-brand-white/55 leading-relaxed border-t border-brand-gray/20 pt-4">
                {t("thankYou.callHint")}
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-xl text-brand-gold mb-2 text-center tracking-wide">
                  {t("thankYou.completeTitle")}
                </h2>
                <p className="text-center text-sm text-brand-white/55 mb-5">{t("thankYou.completeSubtitle")}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {suggestions.slice(0, 3).map((p) => (
                    <SuggestionCard key={p.slug} product={p} locale={locale} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center">
          <Link href="/collection" className="inline-block text-brand-gold underline underline-offset-4 text-sm">
            {t("common.backToCollection")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
