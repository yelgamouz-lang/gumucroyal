"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { confirmOrder } from "@/lib/api";
import { Button } from "@/components/shared/UI";
import { AddPieceOfferPanel } from "@/components/checkout/AddPieceOfferPanel";
import type { AddPieceCandidate } from "@/lib/addPieceOffer";
import { useTranslation } from "@/i18n/I18nProvider";

export function UpsellModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const upsellOpen = useUIStore((s) => s.upsellOpen);
  const resetCheckoutFlow = useUIStore((s) => s.resetCheckoutFlow);
  const pendingOrder = useUIStore((s) => s.pendingOrder);
  const clearCart = useCartStore((s) => s.clearCart);

  const [addPieces, setAddPieces] = useState<AddPieceCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const finished = useRef(false);

  const baseTotal = pendingOrder?.subtotal_mad ?? pendingOrder?.total_mad ?? 0;

  useEffect(() => {
    if (!upsellOpen || !pendingOrder) return;
    finished.current = false;
    setAddPieces([]);
  }, [upsellOpen, pendingOrder]);

  useEffect(() => {
    if (!upsellOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [upsellOpen]);

  const finish = useCallback(
    async (accepted: boolean, productId?: string) => {
      if (!pendingOrder || loading || finished.current) return;
      finished.current = true;
      setLoading(true);
      try {
        await confirmOrder(pendingOrder.id, accepted, accepted ? productId : undefined);
        clearCart();
        resetCheckoutFlow();
        router.push(`/thank-you/${pendingOrder.order_number}`);
      } catch {
        finished.current = false;
        setLoading(false);
      }
    },
    [pendingOrder, loading, clearCart, resetCheckoutFlow, router]
  );

  if (!upsellOpen || !pendingOrder) return null;

  const selected = addPieces[0];

  return (
    <div className="fixed inset-0 z-[10004] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" aria-hidden />
      <div className="relative bg-brand-charcoal border-2 border-brand-gold w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <p className="text-xs text-brand-white/50 uppercase tracking-wider text-center mb-2">{t("upsell.oneTime")}</p>

        <AddPieceOfferPanel
          maxSlots={1}
          selected={addPieces}
          onSelectedChange={setAddPieces}
          baseTotal={baseTotal}
        />

        <div className="flex flex-col gap-3 mt-6">
          <Button fullWidth onClick={() => selected && finish(true, selected.id)} disabled={loading || !selected}>
            {selected ? t("upsell.yesAdd") : t("upsell.yesPickProduct")}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => finish(false)} disabled={loading}>
            {t("upsell.no")}
          </Button>
        </div>
      </div>
    </div>
  );
}
