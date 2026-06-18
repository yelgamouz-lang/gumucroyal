/**
 * Shared WhatsApp helpers.
 *
 * The number comes exclusively from NEXT_PUBLIC_WHATSAPP_NUMBER (set in EasyPanel).
 * If it is missing or empty, every WhatsApp link/button must be hidden — we never
 * show a fake or placeholder number.
 */

const RAW_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

/** Digits-only WhatsApp number, or empty string when not configured. */
export function getWhatsAppNumber(): string {
  return RAW_NUMBER;
}

/** True when a real WhatsApp number is configured. */
export function hasWhatsApp(): boolean {
  return RAW_NUMBER.length > 0;
}

/** Builds a wa.me link (optionally with a prefilled message), or null when unavailable. */
export function getWhatsAppLink(message?: string): string | null {
  if (!RAW_NUMBER) return null;
  const base = `https://wa.me/${RAW_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
