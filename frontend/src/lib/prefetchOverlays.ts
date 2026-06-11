let cartPrefetched = false;
let checkoutPrefetched = false;

export function prefetchCartDrawer() {
  if (cartPrefetched) return;
  cartPrefetched = true;
  void import("@/components/cart/CartDrawer");
}

export function prefetchCheckoutPopup() {
  if (checkoutPrefetched) return;
  checkoutPrefetched = true;
  void import("@/components/checkout/CheckoutFlow");
}
