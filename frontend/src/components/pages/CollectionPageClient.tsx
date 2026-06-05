"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductComponents";
import { SectionWrapper } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";

export function CollectionPageClient() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <SectionWrapper dark>
      <h1 className="font-display text-4xl text-brand-gold mb-2">{t("collection.title")}</h1>
      <p className="text-brand-white/70 mb-10">{t("collection.subtitle")}</p>
      <div className="grid md:grid-cols-3 gap-8">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </SectionWrapper>
  );
}
