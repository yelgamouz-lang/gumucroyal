"""Bundle offers: base + (n-1) × ADD_PIECE_PRICE_MAD per extra piece."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from app.config import settings

if TYPE_CHECKING:
    from app.models.offer import Offer
    from app.models.product import Product


def add_piece_price_mad() -> float:
    return float(getattr(settings, "ADD_PIECE_PRICE_MAD", settings.UPSELL_PRICE_MAD))


def tier_total_price(base_price_mad: float, quantity: int) -> float:
    if quantity == 1:
        return float(base_price_mad)
    return float(base_price_mad) + add_piece_price_mad() * (quantity - 1)


TIER_META = (
    {"quantity": 1, "label_ar": "قطعة واحدة", "highlighted": False, "sort_order": 1},
    {"quantity": 2, "label_ar": "عرض زوجي", "highlighted": True, "badge_ar": "⭐ للهدية", "sort_order": 2},
    {"quantity": 3, "label_ar": "باقة نهائية", "highlighted": False, "badge_ar": None, "sort_order": 3},
)


def offer_slug(sku: str, quantity: int) -> str:
    suffix = {1: "single", 2: "duo", 3: "pack"}[quantity]
    return f"{sku}-{suffix}"


def sync_product_offers(db, product: "Product") -> None:
    from app.models.offer import Offer

    by_qty = {o.quantity: o for o in product.offers}
    for tier in TIER_META:
        qty = tier["quantity"]
        price = tier_total_price(float(product.base_price_mad), qty)
        slug = offer_slug(product.sku, qty)
        highlighted = tier["highlighted"]
        if qty in by_qty:
            offer = by_qty[qty]
            offer.price_mad = price
            offer.slug = slug
            offer.label_ar = tier["label_ar"]
            offer.is_default = highlighted
            offer.badge_ar = tier.get("badge_ar")
            offer.sort_order = tier["sort_order"]
            offer.compare_at_price_mad = None
            offer.savings_mad = None
        else:
            db.add(
                Offer(
                    id=uuid.uuid4(),
                    product_id=product.id,
                    slug=slug,
                    label_ar=tier["label_ar"],
                    quantity=qty,
                    price_mad=price,
                    compare_at_price_mad=None,
                    savings_mad=None,
                    is_default=highlighted,
                    badge_ar=tier.get("badge_ar"),
                    sort_order=tier["sort_order"],
                )
            )


def offers_for_display(product: "Product") -> list["Offer"]:
    return sorted(product.offers, key=lambda o: o.sort_order)
