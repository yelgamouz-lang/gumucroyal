"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/cn";
import { prefetchCartDrawer } from "@/lib/prefetchOverlays";

export function Header() {
  const { t, dir } = useTranslation();
  const count = useCartStore((s) => s.items.length);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const NAV = [
    { href: "/", label: t("nav.home") },
    { href: "/collection/heritage", label: t("nav.collectionHeritage") },
    { href: "/collection/signature", label: t("nav.collectionSignature") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const brand = (
    <Link href="/" className="header-brand shrink-0 py-0.5" aria-label="GUMÜÇROYAL">
      <span className="header-brand-gumuc">GUMÜÇ</span>
      <span className="header-brand-royal">ROYAL</span>
    </Link>
  );

  return (
    <header className="border-b border-white/[0.06] header-premium">
      <div className="header-premium-bg" aria-hidden />
      <div className="header-premium-shine" aria-hidden />
      <div className="header-premium-lines" aria-hidden />

      <div className="header-premium-inner relative max-w-7xl mx-auto px-4">
        {/* Mobile — une seule ligne : hamburger | logo | panier */}
        <div className="header-mobile-bar md:hidden" dir="ltr">
          <button
            type="button"
            className="header-mobile-action header-mobile-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t("nav.menu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          <div className="header-mobile-brand">{brand}</div>

          <button
            type="button"
            className="header-mobile-action header-mobile-cart-btn header-cart-btn"
            onPointerEnter={prefetchCartDrawer}
            onTouchStart={prefetchCartDrawer}
            onClick={() => {
              setMenuOpen(false);
              setCartOpen(true);
            }}
            aria-label={t("nav.cart")}
          >
            <ShoppingBag size={22} strokeWidth={1.5} className="header-cart-icon pointer-events-none" />
            {count > 0 && (
              <span
                className={cn(
                  "absolute top-2 end-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#C9A227]/60 bg-brand-black px-1 text-[10px] font-semibold text-[#E6C766] pointer-events-none",
                  dir === "rtl" ? "start-1 end-auto" : ""
                )}
              >
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Desktop — inchangé */}
        <div className="hidden md:flex items-center justify-between gap-4 ps-[5.25rem] h-[4rem] sm:h-[4.25rem]">
          {brand}

          <nav className="flex items-center gap-10 lg:gap-12">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("header-nav-link", dir === "rtl" && "header-nav-link-rtl")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="relative p-2.5 header-cart-btn"
            onPointerEnter={prefetchCartDrawer}
            onFocus={prefetchCartDrawer}
            onClick={() => setCartOpen(true)}
            aria-label={t("nav.cart")}
          >
            <ShoppingBag size={22} strokeWidth={1.5} className="header-cart-icon" />
            {count > 0 && (
              <span
                className={cn(
                  "absolute -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#C9A227]/60 bg-brand-black px-1 text-[10px] font-semibold text-[#E6C766]",
                  dir === "rtl" ? "-left-0.5" : "-right-0.5"
                )}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mounted &&
        menuOpen &&
        createPortal(
          <div className="mobile-nav-overlay md:hidden" role="dialog" aria-modal="true" aria-label={t("nav.menu")}>
            <button
              type="button"
              className="mobile-nav-backdrop"
              onClick={() => setMenuOpen(false)}
              aria-label={t("common.close")}
            />
            <nav className="mobile-nav-panel">
              <div className="header-mobile-lang px-6 py-4 border-b border-white/[0.06] flex justify-center">
                <LanguageSwitcher className="header-mobile-lang-switcher" />
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn("header-nav-link text-base", dir === "rtl" && "header-nav-link-rtl")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
}
