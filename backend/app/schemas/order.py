from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemIn(BaseModel):
    product_id: UUID
    offer_id: UUID
    quantity: int = 1


class TrackingIn(BaseModel):
    event_id: str
    fbp: str | None = None
    fbc: str | None = None
    ttclid: str | None = None
    sc_click_id: str | None = None
    source_url: str | None = None
    user_agent: str | None = None


class CreateOrderIn(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    customer_phone: str
    items: list[OrderItemIn] = Field(min_length=1)
    order_bump_accepted: bool = False
    tracking: TrackingIn


class UpsellProductOut(BaseModel):
    id: str
    slug: str
    name_ar: str
    image_url: str
    original_price_mad: float
    upsell_price_mad: float


class OrderCreatedOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    subtotal_mad: float
    total_mad: float
    upsell_product: UpsellProductOut | None = None
    event_id: str | None = None


class UpsellUpdateIn(BaseModel):
    upsell_accepted: bool


class ConfirmOrderIn(BaseModel):
    upsell_accepted: bool | None = None


class OrderItemOut(BaseModel):
    product_name_ar: str
    offer_label_ar: str | None = None
    quantity: int
    total_price_mad: float
    is_upsell: bool = False


class OrderOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    customer_name: str
    customer_phone_display: str
    items: list[OrderItemOut]
    upsell_accepted: bool
    subtotal_mad: float
    upsell_amount_mad: float
    total_mad: float
    payment_method: str
    event_id: str | None = None
    confirmed_at: str | None = None
