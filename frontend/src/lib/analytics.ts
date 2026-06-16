const API = process.env.NEXT_PUBLIC_API_URL;

export async function recordAnalyticsEvent(payload: {
  event_type: "page_view" | "click";
  path: string;
  product_slug?: string | null;
}) {
  if (!API) return;
  try {
    await fetch(`${API}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

/** CTA click — counted only for valid Morocco IPs on the backend. */
export function trackAnalyticsClick(path: string, productSlug?: string | null) {
  void recordAnalyticsEvent({
    event_type: "click",
    path,
    product_slug: productSlug ?? null,
  });
}

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/api/admin/${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    throw new Error("Session expirée");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkAdminSession(): Promise<{ authenticated: boolean; username?: string }> {
  const res = await fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" });
  if (!res.ok) return { authenticated: false };
  return res.json();
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 429) throw new Error("Trop de tentatives. Réessayez dans une minute.");
  if (!res.ok) throw new Error("Identifiants invalides");
  return checkAdminSession();
}

export async function adminLogout() {
  await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
}

export function fetchAdminMetrics(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const q = params.toString();
  return adminFetch(`metrics${q ? `?${q}` : ""}`);
}

export function fetchAdminOrders(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const q = params.toString();
  return adminFetch(`orders${q ? `?${q}` : ""}`);
}

export function fetchAdminOrder(orderNumber: string) {
  return adminFetch(`orders/${orderNumber}`);
}
