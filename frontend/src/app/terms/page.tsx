import { LegalPageClient } from "@/components/pages/LegalPageClient";

export const metadata = {
  title: "Conditions de vente — GUMÜÇ Royal",
  // Placeholder content: keep out of the index until the real text is provided.
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <LegalPageClient titleKey="legal.termsTitle" />;
}
