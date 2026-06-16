const TOKEN_PREFIX = "gumuc_checkout_";

export function saveCheckoutToken(orderId: string, orderNumber: string, token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${TOKEN_PREFIX}${orderId}`, token);
  sessionStorage.setItem(`${TOKEN_PREFIX}num_${orderNumber}`, token);
}

export function getCheckoutTokenByOrderId(orderId: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${TOKEN_PREFIX}${orderId}`);
}

export function getCheckoutTokenByOrderNumber(orderNumber: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${TOKEN_PREFIX}num_${orderNumber}`);
}

export function clearCheckoutToken(orderId: string, orderNumber: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${TOKEN_PREFIX}${orderId}`);
  sessionStorage.removeItem(`${TOKEN_PREFIX}num_${orderNumber}`);
}

export const CHECKOUT_TOKEN_HEADER = "X-Checkout-Token";
