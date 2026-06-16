export interface ProductImage {
  url: string;
  alt: string;
  sort_order: number;
}

export interface Offer {
  id: string;
  slug: string;
  label_ar: string;
  quantity: number;
  price_mad: number;
  compare_at_price_mad?: number | null;
  savings_mad?: number | null;
  is_default: boolean;
  badge_ar?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name_fr: string;
  name_ar: string;
  description_short: string;
  description_long: string;
  category: "bagues" | "colliers";
  base_price_mad: number;
  compare_at_price_mad: number;
  material?: string | null;
  rating: number;
  review_count: number;
  badge?: string | null;
  images: ProductImage[];
  benefits: string[];
  offers: Offer[];
  cross_sell_slug?: string | null;
  upsell_slug?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productNameFr: string;
  productNameAr?: string;
  offerId: string;
  offerQuantity: number;
  priceMad: number;
  imageUrl: string;
  extraProductIds?: string[];
  bundleLines?: {
    productId: string;
    productSlug: string;
    productNameFr: string;
    productNameAr?: string;
    imageUrl: string;
  }[];
}

export interface UpsellCandidate {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  sku: string;
  image_url: string;
  base_price_mad: number;
  upsell_price_mad: number;
  savings_mad: number;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  subtotal_mad: number;
  total_mad: number;
  upsell_price_mad?: number;
  upsell_candidates?: UpsellCandidate[];
  event_id?: string | null;
  checkout_token?: string;
}

export interface TrackingParams {
  event_id: string;
  fbp?: string;
  fbc?: string;
  ttclid?: string;
  sc_click_id?: string;
  source_url?: string;
  user_agent?: string;
}
