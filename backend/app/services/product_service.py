from sqlalchemy.orm import Session, joinedload

from app.bootstrap import PRODUCT_PHOTOS
from app.product_catalog import get_base_price
from app.utils.offer_tiers import offers_for_display, tier_total_price
from app.models.offer import Offer
from app.models.product import Product
from app.schemas.product import OfferOut, ProductImage, ProductOut


def serialize_product(product: Product) -> ProductOut:
    offers = offers_for_display(product)
    try:
        base_price = get_base_price(product.slug)
    except KeyError:
        base_price = float(product.base_price_mad)
    local_image = PRODUCT_PHOTOS.get(product.slug)
    if local_image:
        images = [ProductImage(**local_image)]
    else:
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
        base_price_mad=base_price,
        compare_at_price_mad=base_price,
        material=product.material,
        badge=product.badge,
        images=images,
        benefits=product.benefits or [],
        offers=[
            OfferOut(
                id=o.id,
                slug=o.slug,
                label_ar=o.label_ar,
                quantity=o.quantity,
                price_mad=tier_total_price(base_price, o.quantity),
                compare_at_price_mad=None,
                savings_mad=None,
                is_default=o.is_default,
                badge_ar=o.badge_ar,
            )
            for o in offers
        ],
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
