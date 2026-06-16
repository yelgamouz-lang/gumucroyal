import re
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.phone_service import normalize_morocco_phone

NAME_PATTERN = re.compile(
    r"^[\w\s\-'.\u0600-\u06FF\u00C0-\u024F\u1E00-\u1EFF]+$",
    re.UNICODE,
)


class OrderItemIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: UUID
    offer_id: UUID
    quantity: int = Field(default=1, ge=1, le=3)
    extra_product_ids: list[UUID] = Field(default_factory=list, max_length=2)


class TrackingIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1, max_length=128)
    fbp: str | None = Field(default=None, max_length=256)
    fbc: str | None = Field(default=None, max_length=256)
    ttclid: str | None = Field(default=None, max_length=256)
    sc_click_id: str | None = Field(default=None, max_length=256)
    source_url: str | None = Field(default=None, max_length=2048)
    user_agent: str | None = Field(default=None, max_length=512)


class CreateOrderIn(BaseModel):
    """
    Client payload for order creation. Prices are NEVER accepted — the server
    recalculates from catalog base_price_mad, offer tier quantity, and add-piece price.
    """

    model_config = ConfigDict(extra="forbid")

    customer_name: str = Field(min_length=2, max_length=100)
    customer_phone: str = Field(min_length=8, max_length=20)
    customer_city: str = Field(min_length=2, max_length=100)
    items: list[OrderItemIn] = Field(min_length=1, max_length=10)
    order_bump_accepted: bool = False
    order_bump_product_id: UUID | None = None
    order_bump_product_ids: list[UUID] = Field(default_factory=list, max_length=2)
    tracking: TrackingIn

    @field_validator("customer_name")
    @classmethod
    def validate_customer_name(cls, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if len(cleaned) < 2:
            raise ValueError("Name is too short")
        if len(cleaned) > 100:
            raise ValueError("Name is too long")
        if not NAME_PATTERN.match(cleaned):
            raise ValueError("Name contains invalid characters")
        return cleaned

    @field_validator("customer_phone")
    @classmethod
    def validate_customer_phone(cls, value: str) -> str:
        if not normalize_morocco_phone(value):
            raise ValueError("Invalid Moroccan phone number (06/07 or +212 required)")
        return value.strip()

    @field_validator("customer_city")
    @classmethod
    def validate_customer_city(cls, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if len(cleaned) < 2:
            raise ValueError("City is too short")
        if len(cleaned) > 100:
            raise ValueError("City is too long")
        if not NAME_PATTERN.match(cleaned):
            raise ValueError("City contains invalid characters")
        return cleaned


class UpsellCandidateOut(BaseModel):
    id: str
    slug: str
    name_fr: str
    name_ar: str
    sku: str
    image_url: str
    base_price_mad: float
    upsell_price_mad: float
    savings_mad: float


class OrderCreatedOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    subtotal_mad: float
    total_mad: float
    upsell_price_mad: float
    upsell_candidates: list[UpsellCandidateOut] = []
    event_id: str | None = None
    checkout_token: str


class UpsellUpdateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    upsell_accepted: bool


class ConfirmOrderIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    upsell_accepted: bool | None = None
    upsell_product_id: UUID | None = None


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
    customer_city: str = ""
    items: list[OrderItemOut]
    upsell_accepted: bool
    subtotal_mad: float
    upsell_amount_mad: float
    total_mad: float
    payment_method: str
    event_id: str | None = None
    confirmed_at: str | None = None
