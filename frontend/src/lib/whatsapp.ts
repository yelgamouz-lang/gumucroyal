import { formatPrice } from "@/lib/format";
import type { Locale } from "@/i18n/types";

export function buildWhatsAppConfirmUrl(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
  totalMad: number;
  itemsSummary?: string;
  locale?: Locale;
}): string {
  const number = params.phone.replace(/\D/g, "");
  const totalLabel = formatPrice(params.totalMad, params.locale ?? "ar");
  const lines = [
    "سلام، أنا",
    params.customerName + ".",
    "بغيت نأكد الطلب ديالي:",
    `📦 ${params.orderNumber}`,
    params.itemsSummary ? `🛍️ ${params.itemsSummary}` : "",
    `💰 المجموع: ${totalLabel} (الدفع عند الاستلام)`,
    "مرحبا بكم تتصلو بيا للتأكيد. شكراً! 🙏",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(lines)}`;
}
