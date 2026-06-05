"use client";

import { cn } from "@/lib/cn";
import { LOCALES } from "@/i18n/config";
import type { Locale } from "@/i18n/types";
import { useTranslation } from "@/i18n/I18nProvider";

const LABELS: Record<Locale, string> = { ar: "AR", fr: "FR", en: "EN" };

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code, index) => (
        <span key={code} className="inline-flex items-center gap-2.5">
          {index > 0 && <span className="text-white/20 text-[10px] select-none" aria-hidden>·</span>}
          <button
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "min-w-[1.75rem] py-0.5 text-[11px] font-medium tracking-[0.22em] transition-all duration-300",
              locale === code
                ? "text-white opacity-100"
                : "text-white/40 hover:text-white/65"
            )}
            aria-pressed={locale === code}
          >
            {LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
