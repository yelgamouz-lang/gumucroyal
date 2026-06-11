"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const CheckoutPopup = dynamic(() => import("@/components/checkout/CheckoutFlow").then((m) => m.CheckoutPopup), {
  ssr: false,
});
const UpsellModal = dynamic(() => import("@/components/checkout/UpsellModal").then((m) => m.UpsellModal), { ssr: false });
const WhatsAppCTA = dynamic(() => import("@/components/shared/UI").then((m) => m.WhatsAppCTA), { ssr: false });
const PixelProvider = dynamic(() => import("@/components/tracking/PixelProvider").then((m) => m.PixelProvider), {
  ssr: false,
});
const AnalyticsTracker = dynamic(() =>
  import("@/components/tracking/AnalyticsTracker").then((m) => m.AnalyticsTracker), { ssr: false }
);

export function ClientOverlays() {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const checkoutOpen = useUIStore((s) => s.checkoutOpen);
  const upsellOpen = useUIStore((s) => s.upsellOpen);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    if (cartOpen || checkoutOpen || upsellOpen) {
      setWarm(true);
    }
  }, [cartOpen, checkoutOpen, upsellOpen]);

  useEffect(() => {
    const warmUp = () => setWarm(true);
    window.addEventListener("pointerdown", warmUp, { once: true, passive: true });
    let idleHandle: ReturnType<typeof setTimeout> | number | undefined;
    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(warmUp, { timeout: 2800 });
    } else {
      idleHandle = setTimeout(warmUp, 2800);
    }

    return () => {
      window.removeEventListener("pointerdown", warmUp);
      if (idleHandle !== undefined) {
        if ("requestIdleCallback" in window) {
          window.cancelIdleCallback(idleHandle as number);
        } else {
          clearTimeout(idleHandle as ReturnType<typeof setTimeout>);
        }
      }
    };
  }, []);

  return (
    <>
      {(cartOpen || warm) && <CartDrawer />}
      {checkoutOpen && <CheckoutPopup />}
      {upsellOpen && <UpsellModal />}
      {warm && <WhatsAppCTA />}
      {warm && <PixelProvider />}
      {warm && <AnalyticsTracker />}
    </>
  );
}
