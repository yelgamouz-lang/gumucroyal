import type { Locale } from "@/i18n/types";

export const CITY_OTHER = "__other__";

export type MoroccoCityOption = {
  value: string;
  fr: string;
  ar: string;
};

/** Canonical French values sent to the API / Google Sheet. */
export const MOROCCO_CITIES: MoroccoCityOption[] = [
  { value: "Casablanca", fr: "Casablanca", ar: "الدار البيضاء" },
  { value: "Rabat", fr: "Rabat", ar: "الرباط" },
  { value: "Marrakech", fr: "Marrakech", ar: "مراكش" },
  { value: "Fès", fr: "Fès", ar: "فاس" },
  { value: "Tanger", fr: "Tanger", ar: "طنجة" },
  { value: "Agadir", fr: "Agadir", ar: "أكادير" },
  { value: "Meknès", fr: "Meknès", ar: "مكناس" },
  { value: "Oujda", fr: "Oujda", ar: "وجدة" },
  { value: "Kénitra", fr: "Kénitra", ar: "القنيطرة" },
  { value: "Tétouan", fr: "Tétouan", ar: "تطوان" },
  { value: "Salé", fr: "Salé", ar: "سلا" },
  { value: "Nador", fr: "Nador", ar: "الناظور" },
  { value: "Mohammedia", fr: "Mohammedia", ar: "المحمدية" },
  { value: "El Jadida", fr: "El Jadida", ar: "الجديدة" },
  { value: "Beni Mellal", fr: "Beni Mellal", ar: "بني ملال" },
  { value: "Khénifra", fr: "Khénifra", ar: "خنيفرة" },
  { value: "Settat", fr: "Settat", ar: "سطات" },
  { value: "Larache", fr: "Larache", ar: "العرائش" },
  { value: "Khouribga", fr: "Khouribga", ar: "خريبكة" },
  { value: "Safi", fr: "Safi", ar: "آسفي" },
  { value: "Essaouira", fr: "Essaouira", ar: "الصويرة" },
  { value: "Guelmim", fr: "Guelmim", ar: "كلميم" },
  { value: "Berrechid", fr: "Berrechid", ar: "برشيد" },
  { value: "Laâyoune", fr: "Laâyoune", ar: "العيون" },
  { value: "Dakhla", fr: "Dakhla", ar: "الداخلة" },
];

export function cityOptionLabel(city: MoroccoCityOption, locale: Locale): string {
  if (locale === "ar") return city.ar;
  return city.fr;
}

export function resolveCustomerCity(citySelect: string, customCity: string): string | null {
  if (!citySelect) return null;
  if (citySelect === CITY_OTHER) {
    const custom = customCity.trim().replace(/\s+/g, " ");
    return custom.length >= 2 ? custom : null;
  }
  const match = MOROCCO_CITIES.find((c) => c.value === citySelect);
  return match?.value ?? null;
}
