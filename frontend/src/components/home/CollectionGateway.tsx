"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/I18nProvider";
import { COLLECTIONS, type CollectionSlug } from "@/lib/collectionConfig";
import { cn } from "@/lib/cn";

function CollectionCard({ slug }: { slug: CollectionSlug }) {
  const { t } = useTranslation();
  const meta = COLLECTIONS[slug];
  const name = t(`collections.${slug}.name`);
  const ambiance = t(`collections.${slug}.ambiance`);
  const discover = t(`collections.${slug}.discover`);
  const [src, setSrc] = useState(meta.cardImage);

  return (
    <Link
      href={`/collection/${slug}`}
      className="group relative block overflow-hidden rounded-sm border border-brand-gold/10 hover:border-brand-gold/30 transition-colors duration-500"
      style={{ aspectRatio: "4 / 5" }}
    >
      <Image
        src={src}
        alt={name}
        fill
        onError={() => {
          if (src !== meta.cardImageFallback) setSrc(meta.cardImageFallback);
        }}
        className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/30 to-brand-black/10 pointer-events-none" />

      {/* Top label — collection eyebrow */}
      <div className="absolute top-5 start-5">
        <span className="luxury-eyebrow text-brand-gold/70 text-[10px]">
          {t(`collections.${slug}.tagline`)}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 start-0 end-0 p-5 md:p-7">
        <h3
          className={cn(
            "font-display text-2xl md:text-3xl text-brand-white font-normal tracking-wide leading-tight mb-1.5"
          )}
        >
          {name}
        </h3>
        <p className="text-brand-white/60 text-sm font-light italic leading-snug mb-5">
          {ambiance}
        </p>
        <span className="inline-flex items-center gap-2 border border-brand-gold/50 text-brand-gold text-xs uppercase tracking-[0.18em] px-4 py-2.5 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-black font-semibold">
          {discover}
        </span>
      </div>
    </Link>
  );
}

export function CollectionGateway() {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <p className="luxury-eyebrow mb-3">{t("collections.gatewaySubtitle")}</p>
        <h2 className="luxury-title">{t("collections.gatewayTitle")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <CollectionCard slug="heritage" />
        <CollectionCard slug="signature" />
      </div>
    </section>
  );
}
