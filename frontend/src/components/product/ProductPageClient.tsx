"use client";



import { useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/types/product";

import { getDefaultOffer, getProductName, PLACEHOLDER_IMAGES } from "@/lib/products";

import {

  emptyExtraSlugs,

  extrasComplete,

  resolveExtraProducts,

  tierTotalPrice,

  bundleSavings,

} from "@/lib/offerTiers";

import { useCartStore } from "@/stores/cartStore";

import { useUIStore } from "@/stores/uiStore";

import { ProductGallery, OfferSelector, ProductHeroCard } from "@/components/product/ProductComponents";

import { ProductStickyCTA, ProductStickySpacer } from "@/components/product/ProductStickyCTA";

import { Button, SectionWrapper, AlternatingSection, FAQItem, ProductTrustBar, AddToCartLabel } from "@/components/shared/UI";

import { generateEventId } from "@/lib/format";

import { trackAddToCart, trackViewContent } from "@/lib/tracking";

import { trackAnalyticsClick } from "@/lib/analytics";
import { prefetchCartDrawer } from "@/lib/prefetchOverlays";

import { useProductContent, useProductFaq, useProductObjections, useTranslation } from "@/i18n/I18nProvider";



import { LazyWhenVisible } from "@/components/shared/LazyWhenVisible";



export function ProductPageClient({ product, allProducts }: { product: Product; allProducts: Product[] }) {

  const { t, locale } = useTranslation();

  const { subtitle, desireLine, benefits } = useProductContent(product.slug);

  const faq = useProductFaq();

  const objections = useProductObjections();

  const heroSentinelRef = useRef<HTMLDivElement>(null);



  const defaultOffer = getDefaultOffer(product);

  const [selectedOfferId, setSelectedOfferId] = useState(defaultOffer.id);

  const [extraSlugs, setExtraSlugs] = useState<string[]>(() => emptyExtraSlugs(2));

  const addItem = useCartStore((s) => s.addItem);

  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const viewTracked = useRef(false);



  const selectedOffer = product.offers.find((o) => o.id === selectedOfferId) || defaultOffer;



  useEffect(() => {

    if (viewTracked.current) return;

    viewTracked.current = true;

    const eventId = generateEventId("ViewContent");

    trackViewContent(product.sku, product.base_price_mad, eventId);

  }, [product.sku, product.base_price_mad]);



  const extrasForOffer = useMemo(() => {

    const count = Math.max(0, selectedOffer.quantity - 1);

    return resolveExtraProducts(extraSlugs.slice(0, count), allProducts);

  }, [selectedOffer.quantity, extraSlugs, allProducts]);



  const handleExtraChange = (index: number, slug: string | null) => {

    setExtraSlugs((prev) => {

      const next = [...prev];

      next[index] = slug ?? "";

      return next;

    });

  };



  const extrasNeeded = Math.max(0, selectedOffer.quantity - 1);

  const canAddToCart = extrasNeeded === 0 || extrasComplete(extraSlugs, extrasNeeded);

  const displayPrice = tierTotalPrice(product.base_price_mad, selectedOffer.quantity as 1 | 2 | 3);

  const mobileBundleSavings = bundleSavings(resolveExtraProducts(extraSlugs.slice(0, extrasNeeded), allProducts));

  const productName = getProductName(product, locale);



  const handleAddToCart = () => {

    if (!canAddToCart) return;

    prefetchCartDrawer();

    const eventId = generateEventId("AddToCart");

    trackAddToCart(displayPrice, product.sku, eventId);

    trackAnalyticsClick(`/products/${product.slug}`, product.slug);

    addItem(product, selectedOfferId, extrasForOffer);

    setCartOpen(true);

  };



  const offerSelectorProps = {

    offers: product.offers,

    allProducts,

    basePriceMad: product.base_price_mad,

    selectedId: selectedOfferId,

    onSelect: setSelectedOfferId,

    extraSlugs,

    onExtraChange: handleExtraChange,

  };



  return (

    <>

      <SectionWrapper dark className="pt-8 md:pt-12 cv-auto">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 min-w-0">

          <ProductGallery images={product.images} productName={productName} priority />

          <ProductHeroCard

            product={product}

            subtitle={subtitle}

            desireLine={desireLine}

            selectedOffer={selectedOffer}

            onAddToCart={handleAddToCart}

          />

        </div>

        <div ref={heroSentinelRef} className="h-px w-full" aria-hidden />

      </SectionWrapper>



      <SectionWrapper className="cv-auto">

        <h2 className="font-display text-2xl text-brand-gold mb-6 text-center">{t("offers.chooseOffer")}</h2>

        <div className="max-w-xl mx-auto min-w-0">

          <OfferSelector {...offerSelectorProps} />

          <Button fullWidth className="mt-6 hidden md:flex" onClick={handleAddToCart} disabled={!canAddToCart}>

            <AddToCartLabel amount={displayPrice} />

          </Button>

        </div>

      </SectionWrapper>



      <ProductTrustBar />



      <SectionWrapper dark className="cv-auto">

        <AlternatingSection

          title={t("productPage.whyTitle")}

          image={product.images[1]?.url || product.images[0]?.url || PLACEHOLDER_IMAGES.lifestyle}

          imageAlt="benefits"

          priority={false}

        >

          <ul className="space-y-3">

            {benefits.map((b) => (

              <li key={b} className="text-lg break-words">{b}</li>

            ))}

          </ul>

          <p className="text-brand-gold font-semibold mt-4">{t("productPage.whyHighlight")}</p>

        </AlternatingSection>

      </SectionWrapper>



      <SectionWrapper className="cv-auto">

        <AlternatingSection
          title={t("productPage.objectionsTitle")}
          image={product.images[2]?.url || product.images[0]?.url || PLACEHOLDER_IMAGES.packaging}
          imageAlt={t("productPage.objectionsTitle")}
          reverse
          priority={false}
        >

          <div className="space-y-6 min-w-0">

            {objections.map((o) => (

              <div key={o.q} className="min-w-0">

                <p className="font-display text-brand-gold text-lg mb-1.5 break-words [overflow-wrap:anywhere]">{o.q}</p>

                <p className="text-brand-white/70 leading-relaxed break-words [overflow-wrap:anywhere]">{o.a}</p>

              </div>

            ))}

          </div>

        </AlternatingSection>

      </SectionWrapper>



      <SectionWrapper dark className="cv-auto">

        <h2 className="font-display text-3xl text-center text-brand-gold mb-8">{t("productPage.faqTitle")}</h2>

        <div className="max-w-2xl mx-auto space-y-3 mb-12 min-w-0">

          {faq.map((item, i) => (

            <FAQItem key={item.q} question={item.q} answer={item.a} defaultOpen={i === 0} />

          ))}

        </div>

        <div className="max-w-xl mx-auto border border-brand-gold/30 p-6 md:p-8 bg-brand-black/50 min-w-0">

          <div className="flex items-start gap-3 rounded-lg border border-brand-gold/20 bg-brand-gold/[0.04] p-4 mb-6 text-start">

            <p className="text-sm md:text-base text-brand-white/85 leading-relaxed break-words [overflow-wrap:anywhere]">

              {t("checkout.codReassurance")}

            </p>

          </div>

          <div className="text-center">

            <LazyWhenVisible minHeight="20rem">

              <h3 className="font-display text-2xl text-brand-gold mb-6">{t("offers.chooseOffer")}</h3>

              <OfferSelector {...offerSelectorProps} />

              <Button fullWidth className="mt-6 hidden md:flex" onClick={handleAddToCart} disabled={!canAddToCart}>

                <AddToCartLabel amount={displayPrice} />

              </Button>

            </LazyWhenVisible>

          </div>

        </div>

      </SectionWrapper>



      <ProductStickyCTA

        productName={productName}

        displayPrice={displayPrice}

        canAddToCart={canAddToCart}

        onAddToCart={handleAddToCart}

        heroSentinelRef={heroSentinelRef}

        extrasNeeded={extrasNeeded}

        allProducts={allProducts}

        extraSlugs={extraSlugs}

        onExtraChange={handleExtraChange}

        mobileBundleSavings={mobileBundleSavings}

      />

      <ProductStickySpacer extrasNeeded={extrasNeeded} />

    </>

  );

}

