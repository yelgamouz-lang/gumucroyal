"use client";

import Link from "next/link";
import { SectionWrapper, Button } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";
import { getWhatsAppLink } from "@/lib/whatsapp";

export function ContactPageClient() {
  const { t } = useTranslation();
  const waLink = getWhatsAppLink();

  return (
    <SectionWrapper dark>
      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-display text-4xl text-brand-gold mb-6">{t("contact.title")}</h1>
        <p className="text-brand-white/80 mb-8">{t("contact.subtitle")}</p>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button fullWidth>{t("contact.whatsapp")}</Button>
          </a>
        )}
        <div className="mt-12 space-y-4 text-brand-white/70">
          <p>{t("contact.cod")}</p>
          <p>{t("contact.delivery")}</p>
        </div>
        <Link href="/collection" className="inline-block mt-8 text-brand-gold underline">
          {t("common.backToShop")}
        </Link>
      </div>
    </SectionWrapper>
  );
}
