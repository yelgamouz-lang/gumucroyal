"use client";

import { usePathname } from "next/navigation";
import { useIsMobile } from "@/lib/useIsMobile";

import { cn } from "@/lib/cn";
import { formatPriceNumber, getCurrencyLabel } from "@/lib/format";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Truck,
  ShieldCheck,
  Gem,
  Sparkles,
  Leaf,
  MessageCircle,
} from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { useTranslation } from "@/i18n/I18nProvider";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export function Button({ variant = "primary", fullWidth, className, children, ...props }: ButtonProps) {
  const variants = {
    primary: "gold-brilliant-btn",
    secondary: "border border-brand-gold/40 text-brand-gold gold-brilliant-btn-outline",
    ghost: "text-brand-gold underline hover:text-brand-gold-light",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center min-h-12 px-6 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 disabled:opacity-50",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GoldIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon className={cn("w-4 h-4 text-brand-gold stroke-[1.5]", className)} aria-hidden />;
}

export function PriceDisplay({
  amount,
  large,
  offer,
  hero,
  compact,
  className,
}: {
  amount: number;
  large?: boolean;
  offer?: boolean;
  /** Hero product page — largest royal serif price */
  hero?: boolean;
  /** Inline in buttons / tight UI */
  compact?: boolean;
  className?: string;
}) {
  const { locale } = useTranslation();
  return (
    <span className={cn("inline-flex items-baseline gap-2 normal-case", className)} dir="ltr">
      <span
        className={cn(
          "font-price-figures text-brand-gold tracking-[0.06em] leading-none",
          hero && "text-[2.75rem] md:text-[3.25rem]",
          large && !hero && "text-4xl",
          offer && "text-2xl",
          compact && "text-base",
          !large && !offer && !hero && !compact && "text-xl"
        )}
      >
        {formatPriceNumber(amount)}
      </span>
      <span
        className={cn(
          "font-price-currency text-brand-gold/45 tracking-normal leading-none",
          hero && "text-base md:text-lg pb-0.5",
          large && !hero && "text-lg pb-px",
          offer && "text-sm pb-px",
          compact && "text-xs pb-px",
          !large && !offer && !hero && !compact && "text-xs pb-px"
        )}
      >
        {getCurrencyLabel(locale)}
      </span>
    </span>
  );
}

/** CTA label: "Ajouter au panier — 129 Dhs" with royal lining figures on the price. */
export function AddToCartLabel({ amount }: { amount: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center justify-center gap-2 flex-wrap">
      <span>{t("common.addToCart")}</span>
      <span className="opacity-50 font-light" aria-hidden>
        —
      </span>
      <PriceDisplay amount={amount} compact />
    </span>
  );
}

/** Short desire phrase under the hero price — one line per product in i18n. */
export function PriceDesireLine({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p
      className={cn(
        "mt-3 font-display text-sm md:text-[0.9375rem] italic text-brand-gold/50 tracking-[0.02em] leading-snug",
        className
      )}
    >
      {text}
    </p>
  );
}

export function Price({ current, large }: { current: number; large?: boolean }) {
  return (
    <div className={large ? "text-2xl" : "text-lg"}>
      <PriceDisplay amount={current} large={large} />
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block gold-brilliant-badge text-brand-gold text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 border rounded-sm">
      {children}
    </span>
  );
}

export function TrustBar() {
  const { t } = useTranslation();
  const items: { icon: LucideIcon; text: string }[] = [
    { icon: Banknote, text: t("trust.cod") },
    { icon: Truck, text: t("trust.delivery") },
    { icon: Gem, text: t("trust.steel") },
  ];

  return (
    <div className="w-full bg-brand-black border-y border-brand-gold/10 py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-y-3">
        {items.map((item, i) => (
          <div key={item.text} className="flex items-center">
            {i > 0 && <span className="hidden sm:inline w-px h-4 bg-brand-gold/15 mx-5 md:mx-8" aria-hidden />}
            <span className="flex items-center gap-2.5 px-2">
              <GoldIcon icon={item.icon} />
              <span className="text-brand-gold/75 text-[10px] md:text-xs uppercase tracking-[0.22em] font-light">
                {item.text}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductTrustBar() {
  const { t } = useTranslation();
  const items: { icon: LucideIcon; text: string }[] = [
    { icon: Banknote, text: t("productTrust.cod") },
    { icon: Sparkles, text: t("productTrust.noRust") },
    { icon: Leaf, text: t("productTrust.noAllergy") },
    { icon: Truck, text: t("productTrust.delivery") },
  ];

  return (
    <div className="w-full bg-brand-black border-y border-brand-gold/10 py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-y-3">
        {items.map((item, i) => (
          <div key={item.text} className="flex items-center">
            {i > 0 && <span className="hidden sm:inline w-px h-4 bg-brand-gold/15 mx-4 md:mx-6" aria-hidden />}
            <span className="flex items-center gap-2 px-2">
              <GoldIcon icon={item.icon} />
              <span className="text-brand-gold/75 text-[10px] md:text-xs uppercase tracking-[0.2em] font-light">
                {item.text}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionWrapper({
  children,
  className,
  compact,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "bg-brand-black",
        compact ? "py-8 md:py-12" : "py-12 md:py-16",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  premium,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
  premium?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl mx-auto text-center", className)}>
      {eyebrow && (
        <p className="luxury-eyebrow mb-3 md:mb-4">{eyebrow}</p>
      )}
      <h2 className={cn("luxury-title mb-4 md:mb-5", premium && "luxury-title--statement", !premium && "text-brand-gold")}>
        {title}
      </h2>
      <p className={cn("luxury-description", premium && "luxury-description--royal")}>{description}</p>
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const { dir } = useTranslation();
  return (
    <div
      className={cn(
        "luxury-feature-card rounded-lg p-8 flex flex-col gap-5 h-full",
        dir === "rtl" ? "text-right" : "text-left"
      )}
    >
      <Icon className="w-7 h-7 text-[#C9A227] stroke-[1.25]" aria-hidden />
      <div>
        <h3 className="font-display text-xl text-[#C9A227] font-normal tracking-wide mb-3">{title}</h3>
        <p className="luxury-feature-card-desc">{description}</p>
      </div>
    </div>
  );
}

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const { dir } = useTranslation();
  return (
    <div className="border border-brand-gold/10 bg-brand-card rounded-lg p-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn("w-full flex items-center justify-between gap-4", dir === "rtl" ? "text-right" : "text-left")}
        aria-expanded={open}
      >
        <span className="font-display text-brand-gold/90 text-base tracking-wide">{question}</span>
        <span className="text-brand-gold text-xl font-light shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-4 text-brand-white/55 leading-relaxed font-light text-sm tracking-wide">{answer}</p>}
    </div>
  );
}

export function WhatsAppCTA() {
  const { t, dir } = useTranslation();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const href = getWhatsAppLink();

  if (!href) return null;
  if (isMobile && pathname?.startsWith("/products/")) return null;

  return (
    <div className="fixed bottom-4 start-4 z-50 rounded-full border border-brand-gold/30 bg-brand-black/95 shadow-2xl shadow-black/40 p-4 backdrop-blur-lg">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 text-brand-gold"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full gold-brilliant-logo text-brand-black">
          <MessageCircle className="w-5 h-5 stroke-[1.5]" />
        </span>
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="font-semibold text-sm tracking-wide">{t("whatsapp.label")}</p>
          <p className="text-xs text-brand-white/50 font-light">{t("whatsapp.note")}</p>
        </div>
      </a>
    </div>
  );
}

export function AlternatingSection({
  title,
  children,
  image,
  imageAlt,
  reverse,
  priority = false,
}: {
  title?: string;
  children: React.ReactNode;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-center">
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        {title && <h2 className="font-display text-3xl md:text-4xl mb-6 text-brand-gold tracking-wide font-normal">{title}</h2>}
        <div className="space-y-4 text-brand-white/60 leading-relaxed font-light tracking-wide text-sm md:text-base">{children}</div>
      </div>
      <div
        className={cn(
          "aspect-[4/5] md:aspect-[5/6] lg:aspect-square overflow-hidden relative rounded-lg border border-brand-gold/10 min-h-[280px] md:min-h-[440px] lg:min-h-[480px]",
          reverse ? "md:order-1" : "md:order-2"
        )}
      >
        <OptimizedImage src={image} alt={imageAlt} fill sizes="(max-width:768px) 100vw, 45vw" priority={priority} />
      </div>
    </div>
  );
}
