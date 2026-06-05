// Cart types
export interface CartItem {
  product_id: string;
  offer_id: string;
  product_slug: string;
  product_name_ar: string;
  offer_label_ar: string;
  quantity: number;
  unit_price_mad: number;
}

export interface Cart {
  items: CartItem[];
  total_mad: number;
}
