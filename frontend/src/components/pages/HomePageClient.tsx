"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Gem, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types/product";
import { fetchProducts, HOME_SECTION_IMAGES } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductComponents";
import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { BrandCommitmentSection } from "@/components/home/BrandCommitmentSection";
import { ReassuranceBar } from "@/components/shared/ReassuranceBar";
import {
  Button,
  SectionWrapper,
  AlternatingSection,
  SectionHeader,
  FeatureCard,
  FAQItem,
} from "@/components/shared/UI";
import { useTranslation } from "@/i18n/I18nProvider";

export function HomePageClient() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div className="bg-brand-black">
      {/* 1. Hero vidéo */}
      <section className="hero-home relative min-h-[calc(100dvh-var(--header-mobile-height,4rem))] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden md:isolate z-0">
        <HeroVideoBackground />
        <div className="hero-home-content relative z-10 px-4 max-w-3xl pointer-events-none">
          <div className="hero-brand mb-6 md:mb-8 pointer-events-none">
            <span className="hero-brand-gumuc">GUMÜÇ</span>
            <span className="hero-brand-royal">ROYAL</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl mb-5 md:mb-6 text-brand-white font-normal tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {t("home.heroTitle")}
          </h1>
          <p className="text-brand-white/75 text-base md:text-lg mb-10 font-light tracking-wide leading-relaxed max-w-xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex justify-center pointer-events-auto">
            <Link href="/collection">
              <Button>{t("common.discoverCollection")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Bande réassurance */}
      <ReassuranceBar />

      {/* 3. Nos produits */}
      <SectionWrapper compact className="pt-6 md:pt-8 cv-auto">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="luxury-title">{t("home.collectionTitle")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {products.map((p) => (
            <div key={p.slug} className="min-w-0">
              <ProductCard product={p} premium />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 4. Bénéfices / marque */}
      <SectionWrapper compact className="cv-auto">
        <SectionHeader
          eyebrow={t("home.qualityEyebrow")}
          title={t("home.qualityTitle")}
          description={t("home.qualityDescription")}
          premium
        />
        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mt-8 md:mt-10">
          <FeatureCard icon={Gem} title={t("home.feature1Title")} description={t("home.feature1Desc")} />
          <FeatureCard icon={Truck} title={t("home.feature2Title")} description={t("home.feature2Desc")} />
          <FeatureCard icon={ShieldCheck} title={t("home.feature3Title")} description={t("home.feature3Desc")} />
        </div>
      </SectionWrapper>

      <SectionWrapper compact>
        <AlternatingSection title={t("home.aboutTitle")} image={HOME_SECTION_IMAGES.about} imageAlt="GUMÜÇROYAL">
          <p className="font-light tracking-wide">{t("home.aboutP1")}</p>
          <p className="font-light tracking-wide">{t("home.aboutP2")}</p>
          <Link href="/about" className="inline-block mt-6 text-brand-gold text-sm uppercase tracking-[0.2em] hover:text-brand-gold-light transition-colors">
            {t("common.readMore")}
          </Link>
        </AlternatingSection>
      </SectionWrapper>

      <SectionWrapper compact>
        <BrandCommitmentSection />
      </SectionWrapper>

      <SectionWrapper compact className="cv-auto">
        <SectionHeader title={t("home.faqTitle")} description={t("home.faqDescription")} premium />
        <div className="mt-8 space-y-4 max-w-3xl mx-auto">
          <FAQItem question={t("home.faq1Q")} answer={t("home.faq1A")} />
          <FAQItem question={t("home.faq2Q")} answer={t("home.faq2A")} />
          <FAQItem question={t("home.faq3Q")} answer={t("home.faq3A")} />
        </div>
      </SectionWrapper>

      <SectionWrapper compact className="pb-16 md:pb-20">
        <div className="text-center">
          <h2 className="luxury-title mb-6 md:mb-8">{t("home.ctaTitle")}</h2>
          <Link href="/collection">
            <Button>{t("common.shopNow")}</Button>
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
