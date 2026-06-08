"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { fetchProducts, getDefaultOffer, getProductName, PLACEHOLDER_IMAGES } from "@/lib/products";
import {
  emptyExtraSlugs,
  extrasComplete,
  resolveExtraProducts,
  tierTotalPrice,
} from "@/lib/offerTiers";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { ProductGallery, OfferSelector, ProductHeroCard } from "@/components/product/ProductComponents";
import { Steel316LSection } from "@/components/product/Steel316LSection";
import { Button, SectionWrapper, AlternatingSection, FAQItem, ProductTrustBar, PriceDisplay, AddToCartLabel } from "@/components/shared/UI";
import { generateEventId } from "@/lib/format";
import { trackAddToCart, trackViewContent } from "@/lib/tracking";
import { trackAnalyticsClick } from "@/lib/analytics";
import { useProductContent, useProductFaq, useTranslation } from "@/i18n/I18nProvider";

export function ProductPageClient({ product }: { product: Product }) {
  const { t, locale } = useTranslation();
  const { subtitle, desireLine, benefits } = useProductContent(product.slug);
  const faq = useProductFaq();

  const defaultOffer = getDefaultOffer(product);
  const [selectedOfferId, setSelectedOfferId] = useState(defaultOffer.id);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [extraSlugs, setExtraSlugs] = useState<string[]>(() => emptyExtraSlugs(2));
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const viewTracked = useRef(false);

  const selectedOffer = product.offers.find((o) => o.id === selectedOfferId) || defaultOffer;

  useEffect(() => {
    fetchProducts().then(setAllProducts);
  }, []);

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
  const canAddToCart = extrasComplete(extraSlugs, extrasNeeded);
  const displayPrice = tierTotalPrice(product.base_price_mad, selectedOffer.quantity as 1 | 2 | 3);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
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
      <SectionWrapper dark className="pt-8 md:pt-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 min-w-0">
          <ProductGallery images={product.images} productName={getProductName(product, locale)} priority />
          <ProductHeroCard
            product={product}
            subtitle={subtitle}
            desireLine={desireLine}
            selectedOffer={selectedOffer}
            onAddToCart={handleAddToCart}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="font-display text-2xl text-brand-gold mb-6 text-center">{t("offers.chooseOffer")}</h2>
        <div className="max-w-xl mx-auto min-w-0">
          <OfferSelector {...offerSelectorProps} />
          <Button fullWidth className="mt-6 hidden md:flex" onClick={handleAddToCart} disabled={!canAddToCart}>
            <AddToCartLabel amount={displayPrice} />
          </Button>
        </div>
      </SectionWrapper>

      <ProductTrustBar />

      <SectionWrapper dark>
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

      <Steel316LSection imageUrl={product.images[2]?.url || product.images[0]?.url || PLACEHOLDER_IMAGES.packaging} />

      <SectionWrapper dark>
        <h2 className="font-display text-3xl text-center text-brand-gold mb-8">{t("productPage.faqTitle")}</h2>
        <div className="max-w-2xl mx-auto space-y-3 mb-12 min-w-0">
          {faq.map((item) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
        <div className="max-w-xl mx-auto text-center border border-brand-gold/30 p-8 bg-brand-black/50 min-w-0">
          <h3 className="font-display text-2xl text-brand-gold mb-6">{t("offers.chooseOffer")}</h3>
          <OfferSelector {...offerSelectorProps} />
          <Button fullWidth className="mt-6" onClick={handleAddToCart} disabled={!canAddToCart}>
            <AddToCartLabel amount={displayPrice} />
          </Button>
        </div>
      </SectionWrapper>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur border-t border-brand-gray/30 p-3 flex items-center gap-3 safe-area-pb min-w-0">
        <div className="shrink-0 min-w-0">
          <PriceDisplay amount={displayPrice} />
        </div>
        <Button fullWidth onClick={handleAddToCart} disabled={!canAddToCart}>{t("common.addToCart")}</Button>
      </div>
      <div className="h-24 md:hidden" aria-hidden />
    </>
  );
}
