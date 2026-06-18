"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/I18nProvider";
import { getWhatsAppLink } from "@/lib/whatsapp";

export function Footer() {
  const { t } = useTranslation();
  const waLink = getWhatsAppLink();

  return (
    <footer className="bg-brand-black border-t border-brand-gray/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-xl tracking-widest text-brand-gold mb-3">GUMÜÇROYAL</h3>
            <p className="text-brand-white/70">{t("footer.tagline")}</p>
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-brand-gold mb-4">{t("footer.shop")}</h3>
            <ul className="space-y-2 text-brand-white/70">
              <li>
                <Link href="/collection/heritage" className="hover:text-brand-gold">
                  {t("nav.collectionHeritage")}
                </Link>
              </li>
              <li>
                <Link href="/collection/signature" className="hover:text-brand-gold">
                  {t("nav.collectionSignature")}
                </Link>
              </li>
              <li>
                <Link href="/products/bague-lien-eternel" className="hover:text-brand-gold">
                  {t("footer.rings")}
                </Link>
              </li>
              <li>
                <Link href="/products/collier-trefle-lumiere" className="hover:text-brand-gold">
                  {t("footer.necklaces")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-brand-gold mb-4">{t("footer.contactSection")}</h3>
            <ul className="space-y-2 text-brand-white/70">
              {waLink && (
                <li>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold">
                    {t("footer.whatsapp")}
                  </a>
                </li>
              )}
              <li>
                <Link href="/about" className="hover:text-brand-gold">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-gold">
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-brand-gold mb-4">{t("footer.infoSection")}</h3>
            <ul className="space-y-2 text-brand-white/70">
              <li>
                <Link href="/privacy" className="hover:text-brand-gold">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-gold">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-brand-gold">
                  {t("footer.shippingReturns")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-brand-gray/30 text-center text-sm text-brand-white/50">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
