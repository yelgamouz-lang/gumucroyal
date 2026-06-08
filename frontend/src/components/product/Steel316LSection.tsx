"use client";

import { SectionWrapper, AlternatingSection } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";

/** Factual stainless steel section — material proof without inflated claims. */
export function Steel316LSection({ imageUrl }: { imageUrl: string }) {
  const { t } = useTranslation();

  return (
    <SectionWrapper dark>
      <AlternatingSection title={t("productPage.materialTitle")} image={imageUrl} imageAlt={t("productPage.materialImageAlt")}>
        <p>{t("productPage.materialP1")}</p>
        <p>{t("productPage.materialP2")}</p>
        <p className="text-brand-gold">{t("productPage.materialP3")}</p>
      </AlternatingSection>
    </SectionWrapper>
  );
}
