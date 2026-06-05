export function buildWhatsAppConfirmUrl(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
  totalMad: number;
  itemsSummary?: string;
}): string {
  const number = params.phone.replace(/\D/g, "");
  const lines = [
    "سلام، أنا",
    params.customerName + ".",
    "بغيت نأكد الطلب ديالي:",
    `📦 ${params.orderNumber}`,
    params.itemsSummary ? `🛍️ ${params.itemsSummary}` : "",
    `💰 المجموع: ${params.totalMad} د.م. (الدفع عند الاستلام)`,
    "مرحبا بكم تتصلو بيا للتأكيد. شكراً! 🙏",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(lines)}`;
}
