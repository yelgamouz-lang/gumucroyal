"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer));
const CheckoutPopup = dynamic(() => import("@/components/checkout/CheckoutFlow").then((m) => m.CheckoutPopup));
const UpsellModal = dynamic(() => import("@/components/checkout/UpsellModal").then((m) => m.UpsellModal));
const WhatsAppCTA = dynamic(() => import("@/components/shared/UI").then((m) => m.WhatsAppCTA));
const PixelProvider = dynamic(() => import("@/components/tracking/PixelProvider").then((m) => m.PixelProvider));
const AnalyticsTracker = dynamic(() =>
  import("@/components/tracking/AnalyticsTracker").then((m) => m.AnalyticsTracker)
);

export function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <CheckoutPopup />
      <UpsellModal />
      <WhatsAppCTA />
      <PixelProvider />
      <AnalyticsTracker />
    </>
  );
}
