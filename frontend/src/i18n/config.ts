import type { Locale } from "./types";

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALES: Locale[] = ["ar", "fr", "en"];
export const LOCALE_STORAGE_KEY = "gumucroyal-locale";

export function getDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getHtmlLang(locale: Locale): string {
  if (locale === "ar") return "ar";
  if (locale === "fr") return "fr";
  return "en";
}
