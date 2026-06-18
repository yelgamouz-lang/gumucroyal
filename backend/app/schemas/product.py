from uuid import UUID

from pydantic import BaseModel, Field


class OfferOut(BaseModel):
    id: UUID
    slug: str
    label_ar: str
    quantity: int
    price_mad: float
    compare_at_price_mad: float | None = None
    savings_mad: float | None = None
    is_default: bool
    badge_ar: str | None = None

    model_config = {"from_attributes": True}


class ProductImage(BaseModel):
    url: str
    alt: str
    sort_order: int = 0


class ProductOut(BaseModel):
    id: UUID
    slug: str
    sku: str
    name_fr: str
    name_ar: str
    description_short: str
    description_long: str
    category: str
    base_price_mad: float
    compare_at_price_mad: float
    material: str | None = None
    badge: str | None = None
    images: list[ProductImage]
    benefits: list[str]
    offers: list[OfferOut]
    cross_sell_slug: str | None = None
    upsell_slug: str | None = None

    model_config = {"from_attributes": True}


class ProductsListOut(BaseModel):
    products: list[ProductOut]
