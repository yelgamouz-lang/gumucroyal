"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductComponents";
import { SectionWrapper } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";

export function CollectionPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useTranslation();
  const products = initialProducts;

  return (
    <SectionWrapper dark>
      <h1 className="font-display text-4xl text-brand-gold mb-2">{t("collection.title")}</h1>
      <p className="text-brand-white/70 mb-10">{t("collection.subtitle")}</p>
      <div className="grid md:grid-cols-3 gap-8 cv-auto">
        {products.map((p) => (
          <div key={p.slug} className="min-w-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
