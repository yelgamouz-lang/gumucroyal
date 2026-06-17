"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductComponents";
import { SectionWrapper } from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";
import { COLLECTIONS, type CollectionSlug } from "@/lib/collectionConfig";

interface Props {
  initialProducts: Product[];
  collection?: CollectionSlug;
}

function CollectionBanner({ slug }: { slug: CollectionSlug }) {
  const { t } = useTranslation();
  const meta = COLLECTIONS[slug];
  const name = t(`collections.${slug}.name`);
  const tagline = t(`collections.${slug}.tagline`);
  const description = t(`collections.${slug}.description`);

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "340px" }}>
      <Image
        src={meta.bannerImage}
        alt={name}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-brand-black/40 to-brand-black/80 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
        <p className="luxury-eyebrow mb-3 text-brand-gold/70">{tagline}</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-white font-normal tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mb-4">
          {name}
        </h1>
        <p className="text-brand-white/70 text-sm md:text-base font-light max-w-lg leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function CollectionPageClient({ initialProducts, collection }: Props) {
  const { t } = useTranslation();

  const products = collection
    ? initialProducts.filter((p) => p.collection === collection)
    : initialProducts;

  if (collection) {
    const otherSlug = COLLECTIONS[collection].other;
    const otherName = t(`collections.${otherSlug}.name`);
    const discoverOther = t(`collections.${collection}.discoverOther`);

    return (
      <div className="bg-brand-black">
        <CollectionBanner slug={collection} />

        <SectionWrapper dark>
          {products.length === 0 ? (
            <p className="text-brand-white/50 text-center py-12">{t("collection.subtitle")}</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 cv-auto">
              {products.map((p) => (
                <div key={p.slug} className="min-w-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Lien discret vers l'autre collection */}
          <div className="mt-14 md:mt-16 pt-8 border-t border-brand-gold/10 text-center">
            <Link
              href={`/collection/${otherSlug}`}
              className="text-brand-white/50 hover:text-brand-gold text-sm uppercase tracking-[0.15em] transition-colors duration-300"
              aria-label={`${discoverOther} — ${otherName}`}
            >
              {discoverOther}
            </Link>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  return (
    <SectionWrapper dark>
      <h1 className="font-display text-4xl text-brand-gold mb-2">{t("collection.allTitle")}</h1>
      <p className="text-brand-white/70 mb-10">{t("collection.allSubtitle")}</p>
      <div className="grid md:grid-cols-3 gap-8 cv-auto">
        {products.map((p) => (
          <div key={p.slug} className="min-w-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-4 border-t border-brand-gold/10 pt-10">
        {(["heritage", "signature"] as CollectionSlug[]).map((slug) => (
          <Link
            key={slug}
            href={`/collection/${slug}`}
            className="flex flex-col items-center justify-center gap-2 border border-brand-gold/20 hover:border-brand-gold/50 p-6 transition-colors duration-300 text-center"
          >
            <span className="luxury-eyebrow">{t(`collections.${slug}.tagline`)}</span>
            <span className="font-display text-xl text-brand-gold">{t(`collections.${slug}.name`)}</span>
            <span className="text-brand-white/50 text-xs uppercase tracking-[0.15em] mt-1">
              {t(`collections.${slug}.discover`)} →
            </span>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}
