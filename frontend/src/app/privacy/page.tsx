import { LegalPageClient } from "@/components/pages/LegalPageClient";

export const metadata = {
  title: "Politique de confidentialité — GUMÜÇ Royal",
  // Placeholder content: keep out of the index until the real text is provided.
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <LegalPageClient titleKey="legal.privacyTitle" />;
}
