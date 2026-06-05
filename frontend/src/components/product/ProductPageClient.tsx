"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { getDefaultOffer, CLIENT_COUNT, getProductName, PLACEHOLDER_IMAGES, REVIEWS as REVIEW_PHOTOS } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { ProductGallery, OfferSelector, ProductHeroCard } from "@/components/product/ProductComponents";
import { Button, SectionWrapper, AlternatingSection, FAQItem, ProductTrustBar, ReviewCardPhoto, SocialProofCounter } from "@/components/shared/UI";
import { formatPrice, generateEventId } from "@/lib/format";
import { trackAddToCart, trackViewContent } from "@/lib/tracking";
import {
  useProductContent,
  useProductFaq,
  useReviews,
  useTranslation,
  useWhatsAppProofs,
} from "@/i18n/I18nProvider";

export function ProductPageClient({ product }: { product: Product }) {
  const { t, locale } = useTranslation();
  const { subtitle, benefits } = useProductContent(product.slug);
  const reviews = useReviews();
  const faq = useProductFaq();
  const whatsappProofs = useWhatsAppProofs();

  const defaultOffer = getDefaultOffer(product);
  const [selectedOfferId, setSelectedOfferId] = useState(defaultOffer.id);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const viewTracked = useRef(false);

  const selectedOffer = product.offers.find((o) => o.id === selectedOfferId) || defaultOffer;
  const savings = selectedOffer.savings_mad || (selectedOffer.compare_at_price_mad ? selectedOffer.compare_at_price_mad - selectedOffer.price_mad : 0);

  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    const eventId = generateEventId("ViewContent");
    trackViewContent(product.sku, selectedOffer.price_mad, eventId);
  }, [product.sku, selectedOffer.price_mad]);

  const handleAddToCart = () => {
    const eventId = generateEventId("AddToCart");
    trackAddToCart(selectedOffer.price_mad, product.sku, eventId);
    addItem(product, selectedOfferId);
    setCartOpen(true);
  };

  return (
    <>
      <SectionWrapper dark className="pt-8 md:pt-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <ProductGallery images={product.images} productName={getProductName(product, locale)} priority />
          <ProductHeroCard
            product={product}
            subtitle={subtitle}
            selectedOffer={selectedOffer}
            savings={savings}
            onAddToCart={handleAddToCart}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="font-display text-2xl text-brand-gold mb-6 text-center">{t("offers.chooseOffer")}</h2>
        <div className="max-w-xl mx-auto">
          <OfferSelector offers={product.offers} selectedId={selectedOfferId} onSelect={setSelectedOfferId} />
          <Button fullWidth className="mt-6 hidden md:flex" onClick={handleAddToCart}>
            {t("common.addToCartWithPrice", { price: formatPrice(selectedOffer.price_mad) })}
          </Button>
        </div>
      </SectionWrapper>

      <ProductTrustBar />

      <SectionWrapper dark>
        <AlternatingSection
          title={t("productPage.whyTitle")}
          image={product.images[1]?.url || PLACEHOLDER_IMAGES.lifestyle}
          imageAlt="benefits"
          priority={false}
        >
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="text-lg">{b}</li>
            ))}
          </ul>
          <p className="text-brand-gold font-semibold mt-4">{t("productPage.whyHighlight")}</p>
        </AlternatingSection>
      </SectionWrapper>

      <SectionWrapper>
        <AlternatingSection
          title={t("productPage.materialTitle")}
          image={product.images[2]?.url || PLACEHOLDER_IMAGES.packaging}
          imageAlt="316L"
          reverse
        >
          <p>{t("productPage.materialP1")}</p>
          <p>{t("productPage.materialP2")}</p>
          <p className="text-brand-gold">{t("productPage.materialP3")}</p>
        </AlternatingSection>
      </SectionWrapper>

      <SectionWrapper dark>
        <SocialProofCounter count={CLIENT_COUNT} />
        <h2 className="font-display text-3xl text-center text-brand-gold mt-10 mb-8">{t("productPage.reviewsTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {reviews.slice(0, 6).map((r, i) => (
            <ReviewCardPhoto key={`${r.name}-${r.city}`} {...r} photo={REVIEW_PHOTOS[i]?.photo || PLACEHOLDER_IMAGES.lifestyle} />
          ))}
        </div>
        <h3 className="font-display text-xl text-center text-brand-gold mb-6">{t("productPage.whatsappTitle")}</h3>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {whatsappProofs.map((w) => (
            <div key={w.name} className="bg-[#0b141a] border border-[#25D366]/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-sm">💬</span>
                <span className="text-sm text-brand-white/70">{w.name} — {w.city}</span>
              </div>
              <p className="bg-[#1f2c34] rounded-lg p-3 text-sm leading-relaxed text-brand-white/90">{w.text}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="font-display text-3xl text-center text-brand-gold mb-8">{t("productPage.faqTitle")}</h2>
        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          {faq.map((item) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
        <div className="max-w-xl mx-auto text-center border border-brand-gold/30 p-8 bg-brand-black/50">
          <h3 className="font-display text-2xl text-brand-gold mb-6">{t("offers.chooseOffer")}</h3>
          <OfferSelector offers={product.offers} selectedId={selectedOfferId} onSelect={setSelectedOfferId} />
          <Button fullWidth className="mt-6" onClick={handleAddToCart}>
            {t("common.addToCartWithPrice", { price: formatPrice(selectedOffer.price_mad) })}
          </Button>
        </div>
      </SectionWrapper>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-black/95 backdrop-blur border-t border-brand-gray/30 p-3 flex items-center gap-3 safe-area-pb">
        <div className="shrink-0">
          <p className="font-semibold tabular-nums text-brand-gold" dir="ltr">{formatPrice(selectedOffer.price_mad)}</p>
          {savings > 0 && <p className="text-xs tabular-nums text-color-trust" dir="ltr">-{formatPrice(savings)}</p>}
        </div>
        <Button fullWidth onClick={handleAddToCart}>{t("common.addToCart")}</Button>
      </div>
      <div className="h-24 md:hidden" aria-hidden />
    </>
  );
}
