export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-MA")} د.م.`;
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
}

export function validateMoroccoPhone(input: string): { valid: boolean; normalized: string; error?: string } {
  const cleaned = input.replace(/[\s\-().]/g, "");
  if (/^0[67]\d{8}$/.test(cleaned)) return { valid: true, normalized: `212${cleaned.slice(1)}` };
  if (/^\+212[67]\d{8}$/.test(cleaned)) return { valid: true, normalized: cleaned.slice(1) };
  if (/^212[67]\d{8}$/.test(cleaned)) return { valid: true, normalized: cleaned };
  return { valid: false, normalized: "", error: "رقم الهاتف غير صالح. استعملي 06 أو 07." };
}

export function generateEventId(eventName: string): string {
  return `${eventName.toLowerCase()}_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}

export function getDeliveryEstimate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long" });
}

export function getScarcityCount(): number {
  return 8 + Math.floor(Math.random() * 16);
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getTrackingParams(): Partial<import("@/types/product").TrackingParams> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  return {
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
    ttclid: params.get("ttclid") || getCookie("ttclid") || undefined,
    sc_click_id: params.get("ScCid") || getCookie("_scid") || undefined,
    source_url: window.location.href,
    user_agent: navigator.userAgent,
  };
}
