"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ar from "./messages/ar.json";
import fr from "./messages/fr.json";
import en from "./messages/en.json";
import { DEFAULT_LOCALE, getDir, getHtmlLang, LOCALE_STORAGE_KEY } from "./config";
import type { FaqItem, Locale, ReviewMessage, WhatsAppProof } from "./types";
import { getNestedValue, interpolate } from "./utils";

const allMessages = { ar, fr, en } as const;

type Messages = typeof ar;

interface I18nContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tArray: <T>(key: string) => T[];
  messages: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ar" || stored === "fr" || stored === "en") return stored;
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useLayoutEffect(() => {
    const stored = readStoredLocale();
    if (stored) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* private mode / quota — still switch locale in memory */
    }
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
    document.documentElement.dir = getDir(locale);
    document.documentElement.classList.add("notranslate");
    document.documentElement.setAttribute("translate", "no");
  }, [locale]);

  const messages = allMessages[locale];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getNestedValue(messages, key);
      if (typeof value === "string") return interpolate(value, vars);
      return key;
    },
    [messages]
  );

  const tArray = useCallback(
    <T,>(key: string): T[] => {
      const value = getNestedValue(messages, key);
      return Array.isArray(value) ? (value as T[]) : [];
    },
    [messages]
  );

  const value = useMemo(
    () => ({ locale, dir: getDir(locale), setLocale, t, tArray, messages }),
    [locale, setLocale, t, tArray, messages]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

export function useReviews(): ReviewMessage[] {
  const { tArray } = useTranslation();
  return tArray<ReviewMessage>("reviews");
}

export function useProductFaq(): FaqItem[] {
  const { tArray } = useTranslation();
  return tArray<FaqItem>("productFaq");
}

export function useWhatsAppProofs(): WhatsAppProof[] {
  const { tArray } = useTranslation();
  return tArray<WhatsAppProof>("whatsappProofs");
}

export function getOfferLabelKey(quantity: number): string {
  if (quantity === 1) return "offers.single";
  if (quantity === 2) return "offers.duo";
  return "offers.trio";
}

export function getOfferBadgeKey(badgeAr?: string | null): string | null {
  if (!badgeAr) return null;
  if (badgeAr.includes("الأكثر") || badgeAr.includes("⭐")) return "offers.mostPopular";
  if (badgeAr.includes("أفضل") || badgeAr.includes("Meilleure") || badgeAr.includes("Best value")) return "offers.bestValue";
  return null;
}

export function useProductContent(slug: string) {
  const { messages, t } = useTranslation();
  return {
    subtitle: t(`products.${slug}.subtitle`),
    benefits: (getNestedValue(messages, `products.${slug}.benefits`) as string[]) || [],
  };
}
