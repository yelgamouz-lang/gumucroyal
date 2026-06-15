"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { computeCartTotal, countCartPieces, useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { confirmOrder, createOrder } from "@/lib/api";
import { Button, PriceDisplay } from "@/components/shared/UI";
import {
  formatPrice,
  formatPhoneInput,
  validateMoroccoPhone,
  generateEventId,
  getTrackingParams,
  getDeliveryEstimate,
} from "@/lib/format";
import { trackInitiateCheckout } from "@/lib/tracking";
import { trackAnalyticsClick } from "@/lib/analytics";
import {
  ADD_PIECE_PRICE_MAD,
  remainingAddPieceSlots,
  totalAddPieceSavings,
  type AddPieceCandidate,
} from "@/lib/addPieceOffer";
import { getCartItemName, fetchProducts } from "@/lib/products";
import type { Product } from "@/types/product";
import { getOfferLabelKey, useTranslation } from "@/i18n/I18nProvider";
import { AddPieceOfferPanel } from "@/components/checkout/AddPieceOfferPanel";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/useIsMobile";
import {
  CITY_OTHER,
  MOROCCO_CITIES,
  cityOptionLabel,
  resolveCustomerCity,
} from "@/lib/moroccoCities";

function addPieceDisplayName(candidate: AddPieceCandidate, locale: string): string {
  return locale === "ar" ? candidate.name_ar : candidate.name_fr;
}

export function CheckoutPopup() {
  const { t, locale } = useTranslation();
  const isMobile = useIsMobile();
  const router = useRouter();
  const checkoutOpen = useUIStore((s) => s.checkoutOpen);
  const upsellOpen = useUIStore((s) => s.upsellOpen);
  const setCheckoutOpen = useUIStore((s) => s.setCheckoutOpen);
  const resetCheckoutFlow = useUIStore((s) => s.resetCheckoutFlow);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotal = useMemo(() => computeCartTotal(items), [items]);
  const cartPieceCount = useMemo(() => countCartPieces(items), [items]);
  const maxAddSlots = useMemo(() => remainingAddPieceSlots(cartPieceCount), [cartPieceCount]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [citySelect, setCitySelect] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [addPieces, setAddPieces] = useState<AddPieceCandidate[]>([]);
  const [addPanelDismissed, setAddPanelDismissed] = useState(false);
  const [flashLineKeys, setFlashLineKeys] = useState<Set<string>>(new Set());
  const [panelFlash, setPanelFlash] = useState(false);
  const [upsellMountKey, setUpsellMountKey] = useState(0);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; city?: string; cityOther?: string }>({});
  const [loading, setLoading] = useState(false);
  const confirmFooterRef = useRef<HTMLDivElement>(null);
  const initiateTracked = useRef(false);
  const prevAddCount = useRef(0);

  const addOnTotal = addPieces.length * ADD_PIECE_PRICE_MAD;
  const total = cartTotal + addOnTotal;
  const cumulativeSavings = totalAddPieceSavings(addPieces);

  useEffect(() => {
    if (addPieces.length > prevAddCount.current) {
      const idx = addPieces.length - 1;
      const lineKey = `line-${idx}`;
      setFlashLineKeys((prev) => new Set(prev).add(lineKey));
      window.setTimeout(() => {
        setFlashLineKeys((prev) => {
          const next = new Set(prev);
          next.delete(lineKey);
          return next;
        });
      }, 700);
    }
    prevAddCount.current = addPieces.length;
  }, [addPieces]);

  useEffect(() => {
    if (!checkoutOpen) {
      initiateTracked.current = false;
      setFieldErrors({});
      setError("");
      setAddPieces([]);
      setAddPanelDismissed(false);
      setPanelFlash(false);
      setCitySelect("");
      setCustomCity("");
      prevAddCount.current = 0;
      return;
    }
    setPanelFlash(true);
    setUpsellMountKey((k) => k + 1);
    void fetchProducts().then(setCatalogProducts);
    if (initiateTracked.current) return;
    initiateTracked.current = true;
    trackInitiateCheckout(cartTotal, generateEventId("InitiateCheckout"));
  }, [checkoutOpen, cartTotal]);

  useEffect(() => {
    if (addPieces.length > maxAddSlots) {
      setAddPieces((prev) => prev.slice(0, maxAddSlots));
    }
  }, [maxAddSlots, addPieces.length]);

  useEffect(() => {
    document.body.style.overflow = checkoutOpen && !upsellOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [checkoutOpen, upsellOpen]);

  if (!checkoutOpen || upsellOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const nextFieldErrors: { name?: string; phone?: string; city?: string; cityOther?: string } = {};

    if (name.trim().length < 2) {
      nextFieldErrors.name = t("checkout.nameRequired");
    }
    const phoneCheck = validateMoroccoPhone(phone);
    if (!phoneCheck.valid) {
      nextFieldErrors.phone = phoneCheck.error || t("checkout.phoneInvalid");
    }

    const resolvedCity = resolveCustomerCity(citySelect, customCity);
    if (!citySelect) {
      nextFieldErrors.city = t("checkout.cityRequired");
    } else if (citySelect === CITY_OTHER && !resolvedCity) {
      nextFieldErrors.cityOther = t("checkout.cityOtherRequired");
    } else if (!resolvedCity) {
      nextFieldErrors.city = t("checkout.cityRequired");
    }

    if (nextFieldErrors.name || nextFieldErrors.phone || nextFieldErrors.city || nextFieldErrors.cityOther) {
      setFieldErrors(nextFieldErrors);
      setError(
        nextFieldErrors.name ||
          nextFieldErrors.phone ||
          nextFieldErrors.city ||
          nextFieldErrors.cityOther ||
          t("checkout.error")
      );
      return;
    }

    setFieldErrors({});
    setLoading(true);
    trackAnalyticsClick("/checkout/confirm");
    const purchaseEventId = generateEventId("Purchase");

    try {
      const order = await createOrder({
        customer_name: name.trim(),
        customer_phone: phone,
        customer_city: resolvedCity!,
        items: items.map((i) => ({
          product_id: i.productId,
          offer_id: i.offerId,
          quantity: 1,
          extra_product_ids: i.extraProductIds ?? [],
        })),
        order_bump_accepted: addPieces.length > 0,
        order_bump_product_ids: addPieces.map((p) => p.id),
        tracking: { event_id: purchaseEventId, ...getTrackingParams() },
      });
      await confirmOrder(order.id, false);
      clearCart();
      resetCheckoutFlow();
      router.push(`/thank-you/${order.order_number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkout.error"));
    } finally {
      setLoading(false);
    }
  };

  const skipAddOnOffer = () => {
    setAddPieces([]);
    setAddPanelDismissed(true);
    window.setTimeout(() => confirmFooterRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const showAddPanel = maxAddSlots > 0 && !addPanelDismissed;

  const addPieceBlock = (variant: "mobile" | "desktop") => (
    <>
      <AddPieceOfferPanel
        key={variant === "mobile" ? `mobile-${upsellMountKey}` : `desktop-${upsellMountKey}`}
        maxSlots={maxAddSlots}
        selected={addPieces}
        onSelectedChange={setAddPieces}
        baseTotal={cartTotal}
        flashOnOpen={panelFlash}
        mobileFreeChoice={variant === "mobile"}
        catalogProducts={catalogProducts}
      />
      <button
        type="button"
        onClick={skipAddOnOffer}
        className="mt-3 w-full text-center text-sm text-brand-white/45 hover:text-brand-white/75 underline underline-offset-2 transition-colors"
      >
        {t("checkout.continueSinglePiece")}
      </button>
    </>
  );

  return (
    <div className={cn("fixed inset-0 z-[10003] flex justify-center", isMobile ? "items-end p-0" : "items-center p-4")}>
      <div className="absolute inset-0 bg-black/60 checkout-backdrop" onClick={() => setCheckoutOpen(false)} />
      <div
        className={cn(
          "checkout-sheet relative bg-brand-charcoal border border-brand-gray/30 w-full max-w-lg flex flex-col overflow-hidden",
          isMobile ? "max-h-[92dvh] rounded-t-xl border-b-0" : "max-h-[90vh] rounded-none"
        )}
      >
        <div className={cn("overflow-y-auto flex-1 p-6", isMobile && "pb-4")}>
        <button type="button" className="absolute top-4 start-4 z-10" onClick={() => setCheckoutOpen(false)} aria-label={t("common.close")}>
          <X />
        </button>
        <h2 className="font-display text-xl tracking-wide text-brand-gold mb-4">{t("checkout.title")}</h2>

        {/* 1) Lignes + total */}
        <div className="space-y-2 mb-4 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2 min-w-0">
              <span className="line-clamp-2 min-w-0 break-words">
                <span className="font-product">{getCartItemName(item, locale)}</span>
                {item.offerQuantity > 1 && (
                  <span className="text-brand-white/50"> ({t(getOfferLabelKey(item.offerQuantity))})</span>
                )}
              </span>
              <span dir="ltr" className="shrink-0">
                <PriceDisplay amount={item.priceMad} compact />
              </span>
            </div>
          ))}
          {addPieces.map((piece, index) => (
            <div
              key={`${piece.id}-${index}`}
              className={cn(
                "flex justify-between gap-2 text-brand-gold items-start add-piece-line",
                flashLineKeys.has(`line-${index}`) && "add-piece-line-flash"
              )}
            >
              <span className="line-clamp-2 min-w-0 flex flex-col gap-0.5">
                <span className="flex items-start gap-1">
                  <span>+ </span>
                  <span className="font-product">{addPieceDisplayName(piece, locale)}</span>
                  <button
                    type="button"
                    onClick={() => setAddPieces((prev) => prev.filter((_, i) => i !== index))}
                    className="shrink-0 text-brand-white/50 hover:text-brand-white ms-1"
                    aria-label={t("addPiece.remove")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="text-[11px] text-emerald-400/90 font-price-figures">
                  {t("addPiece.savings", { amount: formatPrice(piece.savings_mad, locale) })}
                </span>
              </span>
              <span dir="ltr" className="shrink-0">
                <PriceDisplay amount={ADD_PIECE_PRICE_MAD} compact />
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-semibold text-lg mb-1">
          <span>{t("common.total")}:</span>
          <PriceDisplay amount={total} className="text-lg" />
        </div>
        {cumulativeSavings > 0 && (
          <p className="text-sm text-emerald-400/95 font-price-figures font-medium mb-2">
            {t("addPiece.cumulativeSavings", { amount: formatPrice(cumulativeSavings, locale) })}
          </p>
        )}
        <p className="text-sm text-color-trust mb-4">{t("common.freeShipping")}</p>
        <p className="text-sm text-brand-gold/90 mb-5">{t("checkout.deliveryEstimate", { date: getDeliveryEstimate() })}</p>

        {/* 2) Carré ajout pièce — mobile: CSS md:hidden (déplié d'emblée, sans JS isMobile) */}
        {showAddPanel && (
          <div className="mb-5 md:hidden checkout-add-piece-mobile">
            {addPieceBlock("mobile")}
          </div>
        )}
        {showAddPanel && (
          <div className="mb-5 hidden md:block">
            {addPieceBlock("desktop")}
          </div>
        )}

        {/* 3) Champs client */}
        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm mb-2">{t("checkout.fullName")}</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={cn(
                "luxury-input w-full bg-brand-black border p-3 focus:border-brand-gold outline-none",
                fieldErrors.name ? "border-red-400" : "border-brand-gray/50"
              )}
            />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm mb-2">{t("checkout.phone")}</label>
            <input
              value={phone}
              onChange={(e) => {
                setPhone(formatPhoneInput(e.target.value));
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              className={cn(
                "luxury-input w-full bg-brand-black border p-3 focus:border-brand-gold outline-none",
                fieldErrors.phone ? "border-red-400" : "border-brand-gray/50"
              )}
              placeholder="06 12 34 56 78"
              dir="ltr"
            />
            <p className="text-xs text-brand-white/50 mt-1">{t("checkout.phoneHint")}</p>
            {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm mb-2">{t("checkout.city")}</label>
            <select
              value={citySelect}
              onChange={(e) => {
                setCitySelect(e.target.value);
                if (e.target.value !== CITY_OTHER) setCustomCity("");
                if (fieldErrors.city || fieldErrors.cityOther) {
                  setFieldErrors((prev) => ({ ...prev, city: undefined, cityOther: undefined }));
                }
              }}
              className={cn(
                "luxury-input w-full bg-brand-black border p-3 focus:border-brand-gold outline-none",
                fieldErrors.city ? "border-red-400" : "border-brand-gray/50"
              )}
            >
              <option value="">{t("checkout.cityPlaceholder")}</option>
              {MOROCCO_CITIES.map((city) => (
                <option key={city.value} value={city.value}>
                  {cityOptionLabel(city, locale)}
                </option>
              ))}
              <option value={CITY_OTHER}>{t("checkout.cityOther")}</option>
            </select>
            {fieldErrors.city && <p className="text-red-400 text-xs mt-1">{fieldErrors.city}</p>}
          </div>
          {citySelect === CITY_OTHER && (
            <div>
              <label className="block text-sm mb-2">{t("checkout.cityOther")}</label>
              <input
                value={customCity}
                onChange={(e) => {
                  setCustomCity(e.target.value);
                  if (fieldErrors.cityOther) setFieldErrors((prev) => ({ ...prev, cityOther: undefined }));
                }}
                className={cn(
                  "luxury-input w-full bg-brand-black border p-3 focus:border-brand-gold outline-none",
                  fieldErrors.cityOther ? "border-red-400" : "border-brand-gray/50"
                )}
                placeholder={t("checkout.cityOtherPlaceholder")}
              />
              {fieldErrors.cityOther && <p className="text-red-400 text-xs mt-1">{fieldErrors.cityOther}</p>}
            </div>
          )}
          {error && !fieldErrors.name && !fieldErrors.phone && !fieldErrors.city && !fieldErrors.cityOther && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </form>
        </div>

        {/* 4) Confirmer — fixé en bas sur mobile */}
        <div
          ref={confirmFooterRef}
          className={cn(
            "shrink-0 p-4 md:p-6 pt-3 bg-brand-charcoal border-t border-brand-gray/30 safe-area-pb",
            isMobile && "sticky bottom-0"
          )}
        >
          <Button
            type="submit"
            form="checkout-form"
            fullWidth
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? t("checkout.submitting") : t("checkout.confirmCod")}
          </Button>
        </div>
      </div>
    </div>
  );
}