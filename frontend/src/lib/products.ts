import type { CartItem, Product } from "@/types/product";
import type { Locale } from "@/i18n/types";

const RING1 = "https://images.unsplash.com/photo-1605100804763-247f67b35585?w=800&q=80";
const RING2 = "https://images.unsplash.com/photo-1603561596112-067a23a47fc8?w=800&q=80";
const NECK = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80";
const LIFE = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80";
const PACK = "https://images.unsplash.com/photo-1543294001-fd4a5d7a84a7?w=800&q=80";
const HERO = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&q=80";

export const PLACEHOLDER_IMAGES = { hero: HERO, ring1: RING1, ring2: RING2, necklace: NECK, lifestyle: LIFE, packaging: PACK };

/** Add your photo at `frontend/public/brand-commitment.jpg` */
export const BRAND_COMMITMENT_IMAGE = "/brand-commitment.jpg";

export function getProductName(product: Pick<Product, "name_fr" | "name_ar">, locale: Locale): string {
  return locale === "ar" ? product.name_ar : product.name_fr;
}

export function getCartItemName(
  item: Pick<CartItem, "productNameFr"> & { productNameAr?: string },
  locale: Locale
): string {
  return locale === "ar" && item.productNameAr ? item.productNameAr : item.productNameFr;
}

export const STATIC_PRODUCTS: Product[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "bague-lien-eternel",
    sku: "GR-BLE-001",
    name_fr: "Bague Lien Éternel By GUMÜÇ Royal",
    name_ar: "خاتم الرابط الأبدي — غوموش رويال",
    description_short: "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre.",
    description_long: "Le maillon iconique réinventé en anneau ouvert, pavé de zircons taille brillant avec une pierre solitaire en son centre. Acier inoxydable doré à l'or fin — un éclat qui ne ternit jamais.",
    category: "bagues",
    base_price_mad: 249,
    compare_at_price_mad: 399,
    material: "Acier inoxydable 316L, dorure or fin 18K",
    rating: 4.9,
    review_count: 847,
    badge: "Best Seller",
    images: [
      { url: RING1, alt: "خاتم الرابط الأبدي", sort_order: 0 },
      { url: RING2, alt: "تفاصيل", sort_order: 1 },
      { url: LIFE, alt: "مُرتدى", sort_order: 2 },
      { url: PACK, alt: "التغليف", sort_order: 3 },
    ],
    benefits: ["✨ éclat zircons taille brillant", "💎 pierre solitaire + zircons pavés", "🔒 acier 316L — ma kaybehdelch", "📐 taille ajustable", "🎁 boîte cadeau premium"],
    offers: [
      { id: "22222222-2222-2222-2222-222222222201", slug: "GR-BLE-001-single", label_ar: "قطعة واحدة", quantity: 1, price_mad: 249, compare_at_price_mad: 399, is_default: false },
      { id: "22222222-2222-2222-2222-222222222202", slug: "GR-BLE-001-duo", label_ar: "عرض زوجي", quantity: 2, price_mad: 429, compare_at_price_mad: 798, savings_mad: 69, is_default: true, badge_ar: "⭐ الأكثر طلباً" },
      { id: "22222222-2222-2222-2222-222222222203", slug: "GR-BLE-001-trio", label_ar: "عرض العائلة", quantity: 3, price_mad: 549, compare_at_price_mad: 1197, savings_mad: 198, is_default: false, badge_ar: "أفضل قيمة" },
    ],
    cross_sell_slug: "collier-trefle-lumiere",
    upsell_slug: "collier-trefle-lumiere",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "collier-trefle-lumiere",
    sku: "GR-CTL-002",
    name_fr: "Collier Trèfle de Lumière By GUMÜÇ Royal",
    name_ar: "قلادة البرسيم المضيء — غوموش رويال",
    description_short: "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants.",
    description_long: "Une double chaîne délicate ponctuée de quatre trèfles porte-bonheur pavés de zircons étincelants. L'élégance discrète qui se remarque, en acier inoxydable doré à l'or fin.",
    category: "colliers",
    base_price_mad: 279,
    compare_at_price_mad: 449,
    material: "Acier inoxydable 316L, dorure or fin 18K",
    rating: 4.8,
    review_count: 623,
    badge: "Porte-Bonheur",
    images: [
      { url: NECK, alt: "قلادة البرسيم", sort_order: 0 },
      { url: HERO, alt: "تفاصيل", sort_order: 1 },
      { url: LIFE, alt: "مُرتdaة", sort_order: 2 },
      { url: PACK, alt: "التغليف", sort_order: 3 },
    ],
    benefits: ["🍀 4 trèfles porte-bonheur", "✨ double chaîne délicate", "💫 zircons taille brillant", "🔒 acier inoxydable", "🎁 emballage cadeau premium"],
    offers: [
      { id: "22222222-2222-2222-2222-222222222204", slug: "GR-CTL-002-single", label_ar: "قطعة واحدة", quantity: 1, price_mad: 279, compare_at_price_mad: 449, is_default: false },
      { id: "22222222-2222-2222-2222-222222222205", slug: "GR-CTL-002-duo", label_ar: "عرض زوجي", quantity: 2, price_mad: 479, compare_at_price_mad: 898, savings_mad: 79, is_default: true, badge_ar: "⭐ الأكثر طلباً" },
      { id: "22222222-2222-2222-2222-222222222206", slug: "GR-CTL-002-trio", label_ar: "عرض العائلة", quantity: 3, price_mad: 599, compare_at_price_mad: 1347, savings_mad: 238, is_default: false, badge_ar: "أفضل قيمة" },
    ],
    cross_sell_slug: "bague-double-signature",
    upsell_slug: "bague-lien-eternel",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "bague-double-signature",
    sku: "GR-BDS-003",
    name_fr: "Bague Double Signature By GUMÜÇ Royal",
    name_ar: "خاتم التوقيع المزدوج — غوموش رويال",
    description_short: "Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin.",
    description_long: "Un design architectural à deux extrémités pavées de zircons, ferme et résolument féminin. Forme ouverte ajustable, en acier inoxydable doré à l'or fin.",
    category: "bagues",
    base_price_mad: 229,
    compare_at_price_mad: 369,
    material: "Acier inoxydable 316L, dorure or fin 18K",
    rating: 4.9,
    review_count: 512,
    badge: "Nouveau",
    images: [
      { url: RING2, alt: "خاتم التوقيع", sort_order: 0 },
      { url: RING1, alt: "تفاصيل", sort_order: 1 },
      { url: LIFE, alt: "مُرتdى", sort_order: 2 },
      { url: PACK, alt: "التغليف", sort_order: 3 },
    ],
    benefits: ["💎 design architectural unique", "✨ zircons pavés", "📐 forme ajustable", "🔒 acier 316L", "🎁 boîte cadeau premium"],
    offers: [
      { id: "22222222-2222-2222-2222-222222222207", slug: "GR-BDS-003-single", label_ar: "قطعة واحدة", quantity: 1, price_mad: 229, compare_at_price_mad: 369, is_default: false },
      { id: "22222222-2222-2222-2222-222222222208", slug: "GR-BDS-003-duo", label_ar: "عرض زوجي", quantity: 2, price_mad: 389, compare_at_price_mad: 738, savings_mad: 69, is_default: true, badge_ar: "⭐ الأكثر طلباً" },
      { id: "22222222-2222-2222-2222-222222222209", slug: "GR-BDS-003-trio", label_ar: "عرض العائلة", quantity: 3, price_mad: 499, compare_at_price_mad: 1107, savings_mad: 188, is_default: false, badge_ar: "أفضل قيمة" },
    ],
    cross_sell_slug: "collier-trefle-lumiere",
    upsell_slug: "collier-trefle-lumiere",
  },
];

export const CLIENT_COUNT = 2847;

export const PRODUCT_SUBTITLES: Record<string, string> = {
  "bague-lien-eternel": "كل يوم compliment جديد على يدك — acier doré à l'or fin li ma kaybehdelch",
  "collier-trefle-lumiere": "Porte-bonheur li kayban — zircons taille brillant f neck dialk",
  "bague-double-signature": "Signature dialk — design exclusif غوموش رويال",
};

export const REVIEWS = [
  { name: "سارة", city: "الدار البيضاء", text: "وصلني f 2 jours, zircons kaytl3ou bzaf f l'or fin!", rating: 5, photo: LIFE },
  { name: "نور", city: "الرباط", text: "Ma tbehdelt mn 3 mois, brillance d l'acier doré bqa!", rating: 5, photo: RING1 },
  { name: "أمينة", city: "مراكش", text: "Commandit 2 — wa7ed liya wa7ed l'khti, COD mzyan", rating: 5, photo: NECK },
  { name: "فاطمة", city: "طنجة", text: "Team réactif f WhatsApp, livraison rapide", rating: 5, photo: RING2 },
  { name: "يasmine", city: "فاس", text: "Boîte cadeau zwina, parfaite l'hdiya", rating: 5, photo: PACK },
  { name: "ليلى", city: "أكادير", text: "Katsalni compliments kol nhar daba 💫", rating: 5, photo: LIFE },
];

export const WHATSAPP_PROOFS = [
  { name: "خديجة", city: "Casablanca", text: "وصلتني اليوم، quality top! شكراً GUMÜÇROYAL 🥰" },
  { name: "مريم", city: "Rabat", text: "Confirmit l'commande — ghadi ncommandi mra khra" },
  { name: "سلma", city: "Marrakech", text: "L'acier doré kayban f l'wa9i3 b7al f photos" },
];

export const PRODUCT_FAQ = [
  {
    q: "واش kaybehdel l'acier doré à l'or fin?",
    a: "لا — acier inoxydable 316L مع dorure à l'or fin. ما كيصداش ولا كيتبهدل. ضمان 30 يوم.",
  },
  {
    q: "كيفاش كندفع?",
    a: "COD فقط — katkhlesi ghir mlli colis twsl. ما كاين حتى دفع online.",
  },
  {
    q: "شحal d'livraison?",
    a: "24-72 ساعة f ga3 l'mdoun — Casa/Rabat souvent 24h.",
  },
  {
    q: "واش hypoallergénique?",
    a: "Oui — acier 316L ma كيحسّسش. مناسب للبشرة الحساسة.",
  },
  {
    q: "واش نقدر nrje3?",
    a: "Ila kan chi défaut f fabrication, contactini f 30 يوم وkanbedlo lik.",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return STATIC_PRODUCTS.find((p) => p.slug === slug);
}

export function getDefaultOffer(product: Product) {
  return product.offers.find((o) => o.is_default) || product.offers[0];
}

export async function fetchProducts(): Promise<Product[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return STATIC_PRODUCTS;
  try {
    const res = await fetch(`${api}/api/v1/products`, { next: { revalidate: 60 } });
    if (!res.ok) return STATIC_PRODUCTS;
    const data = await res.json();
    return data.products?.length ? data.products : STATIC_PRODUCTS;
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return getProductBySlug(slug);
  try {
    const res = await fetch(`${api}/api/v1/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return getProductBySlug(slug);
    return await res.json();
  } catch {
    return getProductBySlug(slug);
  }
}
