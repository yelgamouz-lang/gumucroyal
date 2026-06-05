"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrder } from "@/lib/api";
import { Button, SectionWrapper } from "@/components/shared/UI";
import { formatPrice } from "@/lib/format";
import { trackPurchase } from "@/lib/tracking";
import { buildWhatsAppConfirmUrl } from "@/lib/whatsapp";
import { useTranslation } from "@/i18n/I18nProvider";

type OrderItem = { product_name_ar: string; offer_label_ar?: string; total_price_mad: number };

export default function ThankYouPage() {
  const { t } = useTranslation();
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrder>> | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (orderId) getOrder(orderId).then(setOrder).catch(() => setOrder(null));
  }, [orderId]);

  useEffect(() => {
    if (order?.event_id && !tracked.current) {
      tracked.current = true;
      trackPurchase(order.total_mad, ["GUMUCROYAL"], order.event_id, order.order_number);
    }
  }, [order]);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000";

  const itemsSummary = useMemo(() => {
    if (!order?.items?.length) return "";
    return order.items.map((i: OrderItem) => i.product_name_ar).join(" + ");
  }, [order]);

  const whatsappUrl = useMemo(() => {
    if (!order) return `https://wa.me/${waNumber}`;
    return buildWhatsAppConfirmUrl({
      phone: waNumber,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      totalMad: order.total_mad,
      itemsSummary,
    });
  }, [order, waNumber, itemsSummary]);

  return (
    <SectionWrapper dark>
      <div className="max-w-lg mx-auto text-center">
        <h1 className="font-display text-4xl text-brand-gold mb-4">{t("thankYou.title")}</h1>
        {order ? (
          <>
            <p className="text-brand-white/70 mb-2">
              {t("common.orderNumber")}: <strong dir="ltr">{order.order_number}</strong>
            </p>
            <div className="bg-brand-charcoal border border-brand-gray/30 p-6 my-6 space-y-2">
              {order.items?.map((item: OrderItem, i: number) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="font-product">
                    {item.product_name_ar} {item.offer_label_ar && `(${item.offer_label_ar})`}
                  </span>
                  <span dir="ltr" className="tabular-nums shrink-0">{formatPrice(item.total_price_mad)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-4 border-t border-brand-gray/30">
                <span>{t("common.totalCod")}:</span>
                <span className="tabular-nums text-brand-gold" dir="ltr">
                  {formatPrice(order.total_mad)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-brand-white/60">{t("common.loadingOrder")}</p>
        )}
        <p className="mb-6 text-brand-white/70">{t("thankYou.confirmHint")}</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-sm">
          <Button fullWidth variant="primary" className="!bg-[#25D366] !text-white hover:!bg-[#1da851]">
            {t("thankYou.confirmButton")}
          </Button>
        </a>
        <p className="text-xs text-brand-white/40 mt-3">{t("thankYou.confirmNote")}</p>
        <Link href="/collection" className="block mt-8 text-brand-gold underline">
          {t("common.backToCollection")}
        </Link>
      </div>
    </SectionWrapper>
  );
}
