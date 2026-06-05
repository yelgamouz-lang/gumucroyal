from sqlalchemy.orm import Session, joinedload

from app.models.offer import Offer
from app.models.product import Product
from app.schemas.product import OfferOut, ProductImage, ProductOut


def serialize_product(product: Product) -> ProductOut:
    offers = sorted(product.offers, key=lambda o: o.sort_order)
    images = [ProductImage(**img) if isinstance(img, dict) else img for img in (product.images or [])]
    return ProductOut(
        id=product.id,
        slug=product.slug,
        sku=product.sku,
        name_fr=product.name_fr,
        name_ar=product.name_ar,
        description_short=product.description_short,
        description_long=product.description_long,
        category=product.category,
        base_price_mad=float(product.base_price_mad),
        compare_at_price_mad=float(product.compare_at_price_mad),
        material=product.material,
        rating=float(product.rating),
        review_count=product.review_count,
        badge=product.badge,
        images=images,
        benefits=product.benefits or [],
        offers=[OfferOut.model_validate(o) for o in offers],
        cross_sell_slug=product.cross_sell_slug,
        upsell_slug=product.upsell_slug,
    )


def get_all_products(db: Session) -> list[Product]:
    return (
        db.query(Product)
        .options(joinedload(Product.offers))
        .filter(Product.is_active.is_(True))
        .order_by(Product.sort_order)
        .all()
    )


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    return (
        db.query(Product)
        .options(joinedload(Product.offers))
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )
