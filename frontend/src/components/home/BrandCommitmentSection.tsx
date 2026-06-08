"use client";

import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { useTranslation } from "@/i18n/I18nProvider";
import { HOME_SECTION_IMAGES } from "@/lib/products";
import { cn } from "@/lib/cn";

const COMMITMENT_IMAGE_SRC = HOME_SECTION_IMAGES.commitment;

export function BrandCommitmentSection() {
  const { t, dir } = useTranslation();

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-center">
      <div
        className={cn(
          "flex flex-col items-center text-center max-w-xl mx-auto md:max-w-none md:mx-0",
          dir === "rtl" ? "md:order-2 md:items-center" : "md:order-1"
        )}
      >
        <h2 className="brand-commitment-title">{t("home.commitmentTitle")}</h2>
        <p className="brand-commitment-text mt-6 md:mt-8">{t("home.commitmentText")}</p>
        <span className="brand-commitment-badge mt-8 md:mt-10">{t("home.commitmentBadge")}</span>
      </div>

      <div
        className={cn(
          "relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg border border-[rgba(201,162,39,0.28)]",
          dir === "rtl" ? "md:order-1" : "md:order-2"
        )}
      >
        <OptimizedImage
          src={COMMITMENT_IMAGE_SRC}
          alt={t("home.commitmentImageAlt")}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
