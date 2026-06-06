"""Post-checkout upsell — 2nd piece of choice at fixed price."""

from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.models.order import Order
from app.models.product import Product


def upsell_price_mad() -> float:
    return float(settings.UPSELL_PRICE_MAD)


def upsell_savings(base_price_mad: float) -> float:
    return max(0.0, float(base_price_mad) - upsell_price_mad())


def is_upsell_eligible(product: Product) -> bool:
    return float(product.base_price_mad) > upsell_price_mad()


def order_product_ids(order: Order) -> set[UUID]:
    return {item.product_id for item in order.items if not item.is_upsell}


def get_upsell_candidates(db: Session, order: Order | None = None) -> list[dict]:
    """All active products eligible at add-on price (includes same product as order)."""
    price = upsell_price_mad()
    candidates: list[dict] = []

    for product in db.query(Product).filter(Product.is_active.is_(True)).order_by(Product.sort_order):
        base = float(product.base_price_mad)
        if base <= price:
            continue
        image_url = ""
        if product.images and isinstance(product.images[0], dict):
            image_url = product.images[0].get("url", "")
        candidates.append(
            {
                "id": str(product.id),
                "slug": product.slug,
                "name_fr": product.name_fr,
                "name_ar": product.name_ar,
                "sku": product.sku,
                "image_url": image_url,
                "base_price_mad": base,
                "upsell_price_mad": price,
                "savings_mad": upsell_savings(base),
            }
        )
    return candidates


def resolve_upsell_product(db: Session, product_id: UUID, order: Order) -> Product:
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if not product:
        raise HTTPException(status_code=422, detail="Produit upsell invalide")
    if product.id in order_product_ids(order):
        raise HTTPException(status_code=422, detail="Ce produit fait déjà partie de la commande")
    if not is_upsell_eligible(product):
        raise HTTPException(status_code=422, detail="Produit non éligible à l'offre upsell")
    return product
