"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/I18nProvider";

export function Footer() {
  const { t } = useTranslation();
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000";

  return (
    <footer className="bg-brand-black border-t border-brand-gray/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-xl tracking-widest text-brand-gold mb-3">GUMÜÇROYAL</h3>
            <p className="text-brand-white/70">{t("footer.tagline")}</p>
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-brand-gold mb-4">{t("footer.shop")}</h3>
            <ul className="space-y-2 text-brand-white/70">
              <li>
                <Link href="/collection" className="hover:text-brand-gold">
                  {t("nav.collection")}
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
              <li>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold">
                  {t("footer.whatsapp")}
                </a>
              </li>
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
        </div>
        <div className="mt-10 pt-6 border-t border-brand-gray/30 text-center text-sm text-brand-white/50">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
