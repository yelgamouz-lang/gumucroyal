"use client";

import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GoldIcon } from "@/components/shared/UI";
import { Reveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/I18nProvider";

export function useReassuranceItems(): { icon: LucideIcon; text: string }[] {
  const { t } = useTranslation();
  return [
    { icon: ShieldCheck, text: t("reassurance.cod") },
    { icon: Truck, text: t("reassurance.delivery") },
    { icon: Sparkles, text: t("reassurance.steel") },
  ];
}

/** Full-width reassurance strip — home, collection, etc. */
export function ReassuranceBar() {
  const items = useReassuranceItems();

  return (
    <Reveal>
      <div className="w-full bg-brand-black border-y border-brand-gold/10 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-y-4">
          {items.map((item, i) => (
            <div key={item.text} className="flex items-center">
              {i > 0 && <span className="hidden sm:inline w-px h-5 bg-brand-gold/15 mx-5 md:mx-8" aria-hidden />}
              <span className="flex items-center gap-2.5 px-2 max-w-xs">
                <GoldIcon icon={item.icon} className="w-[18px] h-[18px] shrink-0 opacity-80" />
                <span className="text-brand-gold/70 text-xs md:text-sm font-light leading-snug text-center">
                  {item.text}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/** Compact reassurance under product hero price — 3 items, premium line icons. */
export function ProductHeroReassurance({ className }: { className?: string }) {
  const { dir } = useTranslation();
  const items = useReassuranceItems();

  return (
    <ul
      className={cn(
        "mt-5 pt-5 border-t border-brand-gold/15 space-y-3",
        className
      )}
    >
      {items.map(({ icon, text }) => (
        <li key={text} className={cn("flex items-start gap-3", dir === "rtl" && "flex-row-reverse text-right")}>
          <GoldIcon icon={icon} className="w-[17px] h-[17px] shrink-0 mt-0.5 opacity-75" />
          <span className="text-brand-white/55 text-sm font-light leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
  );
}
