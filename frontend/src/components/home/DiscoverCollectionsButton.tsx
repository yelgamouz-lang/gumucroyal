"use client";

import { Button } from "@/components/shared/UI";
import { scrollToCollectionsGateway } from "@/lib/scrollToSection";
import { useTranslation } from "@/i18n/I18nProvider";

/** Hero CTA — scrolls to the two collection gateway cards, never navigates away. */
export function DiscoverCollectionsButton() {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        scrollToCollectionsGateway();
      }}
    >
      {t("common.discoverCollection")}
    </Button>
  );
}
