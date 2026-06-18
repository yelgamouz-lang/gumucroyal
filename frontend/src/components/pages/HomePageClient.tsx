"use client";

import Link from "next/link";
import { Gem, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types/product";
import { HOME_SECTION_IMAGES } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductComponents";
import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { BrandCommitmentSection } from "@/components/home/BrandCommitmentSection";
import { CollectionGateway } from "@/components/home/CollectionGateway";
import { ReassuranceBar } from "@/components/shared/ReassuranceBar";
import {
  Button,
  SectionWrapper,
  AlternatingSection,
  SectionHeader,
  FeatureCard,
  FAQItem,
} from "@/components/shared/UI";
import { Reveal } from "@/components/shared/Reveal";
import { useTranslation } from "@/i18n/I18nProvider";

export function HomePageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useTranslation();
  const products = initialProducts;

  return (
    <div className="bg-brand-black">
      {/* 1. Hero vidéo */}
      <section className="hero-home relative min-h-[72dvh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden md:isolate z-0">
        <HeroVideoBackground />
        <div className="hero-home-content relative z-10 px-4 py-10 max-w-3xl pointer-events-none">
          <div className="hero-brand mb-5 md:mb-7 pointer-events-none">
            <span className="hero-brand-gumuc">GUMÜÇ</span>
            <span className="hero-brand-royal">ROYAL</span>
          </div>
          <h1 className="font-display text-[1.75rem] leading-snug md:text-6xl mb-4 md:mb-6 text-brand-white font-normal tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {t("home.heroTitle")}
          </h1>
          <p className="text-brand-white/75 text-sm md:text-lg mb-8 md:mb-10 font-light tracking-wide leading-relaxed max-w-xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex justify-center pointer-events-auto">
            <Link href="/collection/signature">
              <Button>{t("common.discoverCollection")}</Button>
            </Link>
          </div>
          <p className="text-brand-gold/70 text-[11px] md:text-xs uppercase tracking-[0.25em] mt-5 font-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            {t("home.heroEyebrow")}
          </p>
        </div>
      </section>

      {/* 2. Bande réassurance */}
      <Reveal>
        <ReassuranceBar />
      </Reveal>

      {/* 3. Deux portes d'entrée */}
      <CollectionGateway />

      {/* 4. Best-sellers */}
      <SectionWrapper compact className="pt-0 pb-6 md:pb-8 cv-auto">
        <Reveal>
          <div className="text-center mb-8 md:mb-10">
            <p className="luxury-eyebrow mb-3">{t("home.bestSellersEyebrow")}</p>
            <h2 className="luxury-title">{t("home.collectionTitle")}</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {products.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} staggerIndex={i} className="min-w-0">
              <ProductCard product={p} premium />
            </Reveal>
          ))}
        </div>
      </SectionWrapper>

      {/* 5. Bénéfices / marque */}
      <SectionWrapper compact className="cv-auto">
        <Reveal>
          <SectionHeader
            eyebrow={t("home.qualityEyebrow")}
            title={t("home.qualityTitle")}
            description={t("home.qualityDescription")}
            premium
          />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mt-8 md:mt-10">
          <Reveal staggerIndex={0}>
            <FeatureCard icon={Gem} title={t("home.feature1Title")} description={t("home.feature1Desc")} />
          </Reveal>
          <Reveal staggerIndex={1}>
            <FeatureCard icon={Truck} title={t("home.feature2Title")} description={t("home.feature2Desc")} />
          </Reveal>
          <Reveal staggerIndex={2}>
            <FeatureCard icon={ShieldCheck} title={t("home.feature3Title")} description={t("home.feature3Desc")} />
          </Reveal>
        </div>
      </SectionWrapper>

      <SectionWrapper compact>
        <Reveal>
          <AlternatingSection title={t("home.aboutTitle")} image={HOME_SECTION_IMAGES.about} imageAlt="GUMÜÇROYAL">
            <p className="font-light tracking-wide">{t("home.aboutP1")}</p>
            <p className="font-light tracking-wide">{t("home.aboutP2")}</p>
            <Link href="/about" className="inline-block mt-6 text-brand-gold text-sm uppercase tracking-[0.2em] hover:text-brand-gold-light transition-colors">
              {t("common.readMore")}
            </Link>
          </AlternatingSection>
        </Reveal>
      </SectionWrapper>

      <SectionWrapper compact>
        <Reveal>
          <BrandCommitmentSection />
        </Reveal>
      </SectionWrapper>

      <SectionWrapper compact className="cv-auto">
        <Reveal>
          <SectionHeader title={t("home.faqTitle")} description={t("home.faqDescription")} premium />
        </Reveal>
        <div className="mt-8 space-y-4 max-w-3xl mx-auto">
          <Reveal staggerIndex={0}>
            <FAQItem question={t("home.faq1Q")} answer={t("home.faq1A")} />
          </Reveal>
          <Reveal staggerIndex={1}>
            <FAQItem question={t("home.faq2Q")} answer={t("home.faq2A")} />
          </Reveal>
          <Reveal staggerIndex={2}>
            <FAQItem question={t("home.faq3Q")} answer={t("home.faq3A")} />
          </Reveal>
        </div>
      </SectionWrapper>

      <SectionWrapper compact className="pb-16 md:pb-20">
        <Reveal>
          <div className="text-center">
            <h2 className="luxury-title mb-6 md:mb-8">{t("home.ctaTitle")}</h2>
            <Link href="/collection">
              <Button>{t("common.shopNow")}</Button>
            </Link>
          </div>
        </Reveal>
      </SectionWrapper>
    </div>
  );
}
