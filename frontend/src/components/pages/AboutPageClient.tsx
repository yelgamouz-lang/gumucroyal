"use client";

import Link from "next/link";
import { SectionWrapper, AlternatingSection, Button } from "@/components/shared/UI";
import { ABOUT_SECTION_IMAGES } from "@/lib/products";
import { useTranslation } from "@/i18n/I18nProvider";

export function AboutPageClient() {
  const { t } = useTranslation();

  return (
    <>
      <SectionWrapper dark>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl text-brand-gold mb-6">{t("about.title")}</h1>
          <p className="text-lg text-brand-white/80 leading-relaxed">{t("about.intro")}</p>
        </div>
      </SectionWrapper>
      <SectionWrapper>
        <AlternatingSection
          title={t("about.missionTitle")}
          image={ABOUT_SECTION_IMAGES.mission}
          imageAlt={t("about.missionTitle")}
        >
          <p>{t("about.missionP1")}</p>
          {t("about.missionP2") ? <p>{t("about.missionP2")}</p> : null}
        </AlternatingSection>
      </SectionWrapper>
      <SectionWrapper dark>
        <AlternatingSection
          title={t("about.qualityTitle")}
          image={ABOUT_SECTION_IMAGES.quality}
          imageAlt={t("about.qualityTitle")}
          reverse
        >
          <p>{t("about.qualityP1")}</p>
          <p>{t("about.qualityP2")}</p>
          <p>{t("about.qualityP3")}</p>
        </AlternatingSection>
      </SectionWrapper>
      <SectionWrapper>
        <div className="text-center">
          <Link href="/collection">
            <Button>{t("common.discoverCollection")}</Button>
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
