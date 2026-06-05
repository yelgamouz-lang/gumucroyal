// Order types
export interface OrderItem {
  id: string;
  product_id: string;
  offer_id?: string;
  product_name_ar: string;
  offer_label_ar?: string;
  quantity: number;
  unit_price_mad: number;
  total_price_mad: number;
  is_upsell: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone_display: string;
  items: OrderItem[];
  subtotal_mad: number;
  upsell_amount_mad: number;
  total_mad: number;
  upsell_accepted: boolean;
  upsell_product?: {
    id: string;
    name_ar: string;
    slug: string;
  };
  payment_method: string;
  event_id?: string;
  source_url?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  source_url?: string;
  fbp?: string;
  fbc?: string;
  ttclid?: string;
  sc_click_id?: string;
  client_ip?: string;
  user_agent?: string;
}

export interface UpsellUpdatePayload {
  upsell_product_id: string;
}
