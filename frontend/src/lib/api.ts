import type { OrderResponse, TrackingParams } from "@/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function apiFetch(path: string, init?: RequestInit) {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error("ما قدرناش نتصلو بالسيرفر. تأكد أن backend خدام على port 8000.");
  }
}

export async function createOrder(payload: {
  customer_name: string;
  customer_phone: string;
  items: { product_id: string; offer_id: string; quantity: number }[];
  order_bump_accepted?: boolean;
  tracking: TrackingParams;
}): Promise<OrderResponse> {
  const res = await apiFetch("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : "وقع خطأ ف تأكيد الطلب");
  }
  return res.json();
}

export async function confirmOrder(orderId: string, upsellAccepted: boolean) {
  const res = await apiFetch(`/api/v1/orders/${orderId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upsell_accepted: upsellAccepted }),
  });
  if (!res.ok) throw new Error("وقع خطأ");
  return res.json();
}

export async function getOrder(orderNumber: string) {
  const res = await apiFetch(`/api/v1/orders/${orderNumber}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}
