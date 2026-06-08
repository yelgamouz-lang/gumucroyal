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

const TOKEN_KEY = "gumuc_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getAdminToken();
  if (!token || !API) throw new Error("Non authentifié");
  const res = await fetch(`${API}/api/v1/admin${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    clearAdminToken();
    throw new Error("Session expirée");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Identifiants invalides");
  const data = await res.json();
  setAdminToken(data.token);
  return data.token;
}

export function fetchAdminMetrics(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const q = params.toString();
  return adminFetch(`/metrics${q ? `?${q}` : ""}`);
}

export function fetchAdminOrders(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const q = params.toString();
  return adminFetch(`/orders${q ? `?${q}` : ""}`);
}

export function fetchAdminOrder(orderNumber: string) {
  return adminFetch(`/orders/${orderNumber}`);
}
