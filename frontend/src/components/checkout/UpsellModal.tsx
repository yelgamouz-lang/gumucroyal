"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { confirmOrder } from "@/lib/api";
import { Button } from "@/components/shared/UI";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/i18n/I18nProvider";

export function UpsellModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const upsellOpen = useUIStore((s) => s.upsellOpen);
  const setUpsellOpen = useUIStore((s) => s.setUpsellOpen);
  const pendingOrder = useUIStore((s) => s.pendingOrder);
  const upsellProduct = useUIStore((s) => s.upsellProduct);
  const setPendingOrder = useUIStore((s) => s.setPendingOrder);
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const finished = useRef(false);
  const duration = Number(process.env.NEXT_PUBLIC_UPSELL_DURATION_SECONDS || 12);
  const upsellPrice = Number(process.env.NEXT_PUBLIC_UPSELL_PRICE_MAD || 69);
  const [seconds, setSeconds] = useState(duration);

  const finish = useCallback(
    async (accepted: boolean) => {
      if (!pendingOrder || loading || finished.current) return;
      finished.current = true;
      setLoading(true);
      try {
        await confirmOrder(pendingOrder.id, accepted);
        clearCart();
        setUpsellOpen(false);
        setPendingOrder(null);
        router.push(`/thank-you/${pendingOrder.order_number}`);
      } catch {
        finished.current = false;
        setLoading(false);
      }
    },
    [pendingOrder, loading, clearCart, setUpsellOpen, setPendingOrder, router]
  );

  useEffect(() => {
    if (!upsellOpen) {
      finished.current = false;
      return;
    }
    setSeconds(duration);
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          finish(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [upsellOpen, duration, finish]);

  if (!upsellOpen || !pendingOrder) return null;

  return (
    <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-brand-charcoal border-2 border-brand-gold w-full max-w-md p-6 text-center">
        <p className="font-display text-lg text-brand-gold mb-2">{t("upsell.timer", { seconds })}</p>
        {upsellProduct ? (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden">
              <OptimizedImage src={upsellProduct.image_url} alt={upsellProduct.name_ar} fill sizes="128px" />
            </div>
            <h3 className="font-display text-xl mb-2">{upsellProduct.name_ar}</h3>
            <p className="text-brand-white/80 mb-2">{t("upsell.title")}</p>
            <p className="mb-4">
              <span className="line-through text-brand-white/40" dir="ltr">
                {formatPrice(upsellProduct.original_price_mad)}
              </span>
              {" → "}
              <span className="font-semibold tabular-nums text-brand-gold text-xl" dir="ltr">
                {formatPrice(upsellPrice)}
              </span>
            </p>
          </>
        ) : (
          <p className="mb-4">{t("upsell.confirming")}</p>
        )}
        <div className="w-full bg-brand-gray h-2 mb-6 rounded overflow-hidden">
          <div className="gold-brilliant-btn h-full transition-all rounded-sm" style={{ width: `${(seconds / duration) * 100}%` }} />
        </div>
        {upsellProduct && (
          <div className="flex gap-3">
            <Button fullWidth onClick={() => finish(true)} disabled={loading}>
              {t("upsell.yes")}
            </Button>
            <Button variant="ghost" onClick={() => finish(false)} disabled={loading}>
              {t("upsell.no")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
