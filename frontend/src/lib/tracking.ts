"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void; page: () => void; load: (id: string) => void };
    snaptr?: (...args: unknown[]) => void;
  }
}

export function trackMeta(eventName: string, params: Record<string, unknown>, eventId: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params, { eventID: eventId });
  }
}

export function trackTikTok(eventName: string, params: Record<string, unknown>, eventId: string) {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(eventName, { ...params, event_id: eventId });
  }
}

export function trackSnap(eventName: string, params: Record<string, unknown>, eventId: string) {
  if (typeof window !== "undefined" && window.snaptr) {
    window.snaptr("track", eventName, { ...params, client_dedup_id: eventId });
  }
}

export function trackPurchase(value: number, contentIds: string[], eventId: string, orderNumber?: string) {
  const params = { value, currency: "MAD", content_ids: contentIds, content_type: "product" };
  trackMeta("Purchase", { ...params, num_items: contentIds.length }, eventId);
  trackTikTok("CompletePayment", { ...params, content_id: contentIds[0] }, eventId);
  trackSnap("PURCHASE", {
    price: value,
    currency: "MAD",
    item_ids: contentIds,
    transaction_id: orderNumber,
    number_items: contentIds.length,
  }, eventId);
}

export function trackAddToCart(value: number, contentId: string, eventId: string) {
  trackMeta("AddToCart", { value, currency: "MAD", content_ids: [contentId] }, eventId);
  trackTikTok("AddToCart", { value, currency: "MAD", content_id: contentId }, eventId);
  trackSnap("ADD_CART", { price: value, currency: "MAD", item_ids: [contentId] }, eventId);
}

export function trackViewContent(contentId: string, value: number, eventId: string) {
  trackMeta("ViewContent", { content_ids: [contentId], content_type: "product", value, currency: "MAD" }, eventId);
  trackTikTok("ViewContent", { content_id: contentId, value, currency: "MAD" }, eventId);
  trackSnap("VIEW_CONTENT", { price: value, currency: "MAD", item_ids: [contentId] }, eventId);
}

export function trackInitiateCheckout(value: number, eventId: string) {
  trackMeta("InitiateCheckout", { value, currency: "MAD" }, eventId);
  trackTikTok("InitiateCheckout", { value, currency: "MAD" }, eventId);
  trackSnap("START_CHECKOUT", { price: value, currency: "MAD" }, eventId);
}
