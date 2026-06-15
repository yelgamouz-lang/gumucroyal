import type { OrderResponse, TrackingParams } from "@/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function apiFetch(path: string, init?: RequestInit) {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error("ما قدرناش نتصلو بالسيرفر. جرّبي من بعد شوية.");
  }
}

export async function createOrder(payload: {
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  items: { product_id: string; offer_id: string; quantity: number; extra_product_ids?: string[] }[];
  order_bump_accepted?: boolean;
  order_bump_product_id?: string;
  order_bump_product_ids?: string[];
  tracking: TrackingParams;
}): Promise<OrderResponse> {
  const res = await apiFetch("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("طلبات كثيرة. عاودي من بعد دقيقة.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : "وقع خطأ ف تأكيد الطلب");
  }
  return res.json();
}

export async function confirmOrder(orderId: string, upsellAccepted: boolean, upsellProductId?: string) {
  const res = await apiFetch(`/api/v1/orders/${orderId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      upsell_accepted: upsellAccepted,
      upsell_product_id: upsellAccepted && upsellProductId ? upsellProductId : null,
    }),
  });
  if (!res.ok) throw new Error("وقع خطأ");
  return res.json();
}

export async function getOrder(orderNumber: string) {
  const res = await apiFetch(`/api/v1/orders/${orderNumber}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}
