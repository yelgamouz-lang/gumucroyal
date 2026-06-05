"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { computeCartTotal, useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { createOrder } from "@/lib/api";
import { Button, ReviewCard } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  formatPrice,
  formatPhoneInput,
  validateMoroccoPhone,
  generateEventId,
  getTrackingParams,
  getDeliveryEstimate,
} from "@/lib/format";
import { trackInitiateCheckout } from "@/lib/tracking";
import { ORDER_BUMP_PRICE, resolveOrderBumpProduct } from "@/lib/orderBump";
import { getCartItemName, getProductName } from "@/lib/products";
import { getOfferLabelKey, useReviews, useTranslation } from "@/i18n/I18nProvider";

export function CheckoutPopup() {
  const { t, locale } = useTranslation();
  const reviews = useReviews();
  const checkoutOpen = useUIStore((s) => s.checkoutOpen);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);
  const setUpsellOpen = useUIStore((s) => s.setUpsellOpen);
  const setPendingOrder = useUIStore((s) => s.setPendingOrder);
  const setUpsellProduct = useUIStore((s) => s.setUpsellProduct);
  const items = useCartStore((s) => s.items);
  const cartTotal = useMemo(() => computeCartTotal(items), [items]);
  const bumpProduct = useMemo(() => resolveOrderBumpProduct(items), [items]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderBump, setOrderBump] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const initiateTracked = useRef(false);

  const total = cartTotal + (orderBump && bumpProduct ? ORDER_BUMP_PRICE : 0);

  useEffect(() => {
    if (!checkoutOpen) {
      initiateTracked.current = false;
      return;
    }
    if (initiateTracked.current) return;
    initiateTracked.current = true;
    trackInitiateCheckout(cartTotal, generateEventId("InitiateCheckout"));
  }, [checkoutOpen, cartTotal]);

  if (!checkoutOpen) return null;

  const review = reviews[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError(t("checkout.nameRequired"));
      return;
    }
    const phoneCheck = validateMoroccoPhone(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || t("checkout.phoneInvalid"));
      return;
    }

    setLoading(true);
    const purchaseEventId = generateEventId("Purchase");

    try {
      const order = await createOrder({
        customer_name: name.trim(),
        customer_phone: phone,
        items: items.map((i) => ({ product_id: i.productId, offer_id: i.offerId, quantity: 1 })),
        order_bump_accepted: orderBump && !!bumpProduct,
        tracking: { event_id: purchaseEventId, ...getTrackingParams() },
      });
      setPendingOrder(order);
      setUpsellProduct(order.upsell_product || null);
      setCheckoutOpen(false);
      setUpsellOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkout.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => setCheckoutOpen(false)} />
      <div className="relative bg-brand-charcoal border border-brand-gray/30 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <button type="button" className="absolute top-4 start-4" onClick={() => setCheckoutOpen(false)} aria-label={t("common.close")}>
          <X />
        </button>
        <h2 className="font-display text-xl tracking-wide text-brand-gold mb-4">{t("checkout.title")}</h2>
        <div className="space-y-2 mb-4 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                <span className="font-product">{getCartItemName(item, locale)}</span> ({t(getOfferLabelKey(item.offerQuantity))})
              </span>
              <span dir="ltr" className="shrink-0 tabular-nums">
                {formatPrice(item.priceMad)}
              </span>
            </div>
          ))}
          {orderBump && bumpProduct && (
            <div className="flex justify-between gap-2 text-brand-gold">
              <span className="line-clamp-1">
                + <span className="font-product">{getProductName(bumpProduct, locale)}</span>
              </span>
              <span dir="ltr" className="shrink-0 tabular-nums">
                {formatPrice(ORDER_BUMP_PRICE)}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-semibold text-lg mb-4">
          <span>{t("common.total")}:</span>
          <span className="tabular-nums text-brand-gold" dir="ltr">
            {formatPrice(total)}
          </span>
        </div>
        <p className="text-sm text-color-trust mb-4">{t("common.freeShipping")}</p>

        {bumpProduct && (
          <label className="flex items-start gap-3 p-4 mb-4 border-2 border-brand-gold/40 bg-brand-gold/5 cursor-pointer">
            <input
              type="checkbox"
              checked={orderBump}
              onChange={(e) => setOrderBump(e.target.checked)}
              className="mt-1 h-5 w-5 accent-brand-gold"
            />
            <div className="flex-1">
              <div className="flex gap-3 items-center">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                  <OptimizedImage src={bumpProduct.images[0]?.url} alt={bumpProduct.name_fr} fill sizes="56px" />
                </div>
                <div>
                  <p className="font-display text-brand-gold tracking-wide">{t("checkout.orderBump", { price: ORDER_BUMP_PRICE })}</p>
                  <p className="font-product text-sm text-brand-white/70">{getProductName(bumpProduct, locale)}</p>
                  <p className="text-xs text-brand-white/50 mt-1">{t("checkout.orderBumpDesc")}</p>
                </div>
              </div>
            </div>
          </label>
        )}

        {review && (
          <div className="mb-4">
            <ReviewCard {...review} />
          </div>
        )}
        <p className="text-sm text-brand-gold mb-6">{t("checkout.deliveryEstimate", { date: getDeliveryEstimate() })}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">{t("checkout.fullName")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-brand-black border border-brand-gray/50 p-3 focus:border-brand-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">{t("checkout.phone")}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className="w-full bg-brand-black border border-brand-gray/50 p-3 focus:border-brand-gold outline-none"
              placeholder="06 12 34 56 78"
              dir="ltr"
            />
            <p className="text-xs text-brand-white/50 mt-1">{t("checkout.phoneHint")}</p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? t("checkout.submitting") : t("checkout.confirmCod")}
          </Button>
        </form>
      </div>
    </div>
  );
}
