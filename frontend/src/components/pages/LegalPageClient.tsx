"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";

/**
 * Generic legal / information page shell. The body is an intentional placeholder
 * (filled by GUMÜÇ Royal) — no legal content is invented here.
 */
export function LegalPageClient({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <SectionWrapper dark>
      <div className="max-w-2xl mx-auto min-w-0">
        <h1 className="font-display text-3xl md:text-4xl text-brand-gold mb-8 break-words [overflow-wrap:anywhere]">
          {t(titleKey)}
        </h1>
        <div className="text-brand-white/70 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
          {t("legal.placeholder")}
        </div>
        <Link href="/" className="inline-block mt-10 text-brand-gold underline">
          {t("common.backToShop")}
        </Link>
      </div>
    </SectionWrapper>
  );
}
