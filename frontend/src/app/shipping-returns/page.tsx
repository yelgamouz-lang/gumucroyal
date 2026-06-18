import { LegalPageClient } from "@/components/pages/LegalPageClient";

export const metadata = {
  title: "Livraison & retours — GUMÜÇ Royal",
  // Placeholder content: keep out of the index until the real text is provided.
  robots: { index: false, follow: true },
};

export default function ShippingReturnsPage() {
  return <LegalPageClient titleKey="legal.shippingTitle" />;
}
